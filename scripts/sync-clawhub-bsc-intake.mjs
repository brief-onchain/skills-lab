#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';

const API_BASE = (process.env.CLAWHUB_API_BASE || 'https://wry-manatee-359.convex.site').replace(/\/$/, '');
const QUERY = process.env.CLAWHUB_QUERY || 'bsc';
const LIMIT = Math.max(1, Math.min(200, Number(process.env.CLAWHUB_LIMIT || 60)));
const OUTPUT =
  process.env.CLAWHUB_OUTPUT ||
  path.resolve(process.cwd(), 'skills/lib-3-ecosystem-intake/clawhub-bsc-intake.json');

function cleanText(value, maxLen = 280) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLen);
}

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'application/json', 'User-Agent': 'skills-lab/intake-sync/0.1.0' }
    });
    const raw = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${raw.slice(0, 180)}`);
    }
    return raw ? JSON.parse(raw) : {};
  } finally {
    clearTimeout(timer);
  }
}

async function fetchText(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { Accept: 'text/plain,application/json', 'User-Agent': 'skills-lab/intake-sync/0.1.0' }
    });
    const raw = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${raw.slice(0, 180)}`);
    }
    return raw;
  } finally {
    clearTimeout(timer);
  }
}

function classifyRisk({ summary = '', skillMd = '' }) {
  const text = `${summary}\n${skillMd}`.toLowerCase();
  const hits = [];

  const rules = [
    { key: 'private_key', pattern: /\b(private[_\s-]?key|mnemonic|seed phrase)\b/ },
    { key: 'trade_execution', pattern: /\b(buy|sell|swap|order|trading|withdraw)\b/ },
    { key: 'token_launch', pattern: /\b(launch|bonding curve|mint token)\b/ },
    { key: 'wallet_signing', pattern: /\b(sign|signing|wallet file|transaction)\b/ }
  ];

  for (const rule of rules) {
    if (rule.pattern.test(text)) {
      hits.push(rule.key);
    }
  }

  let riskLevel = 'low';
  if (hits.includes('private_key') || hits.includes('token_launch')) {
    riskLevel = 'high';
  } else if (hits.includes('trade_execution') || hits.includes('wallet_signing')) {
    riskLevel = 'medium';
  }

  return { riskLevel, reasons: hits };
}

async function main() {
  console.log(`[clawhub-intake] API_BASE=${API_BASE}`);
  console.log(`[clawhub-intake] query=${QUERY} limit=${LIMIT}`);

  const searchUrl = `${API_BASE}/api/v1/search?q=${encodeURIComponent(QUERY)}&limit=${LIMIT}`;
  const searchData = await fetchJson(searchUrl);
  const results = Array.isArray(searchData?.results) ? searchData.results : [];

  if (!results.length) {
    throw new Error(`No skills found for query="${QUERY}"`);
  }

  const seen = new Set();
  const slugs = [];
  for (const row of results) {
    const slug = String(row?.slug || '').trim();
    if (!slug || seen.has(slug)) continue;
    seen.add(slug);
    slugs.push(slug);
  }

  const items = [];
  for (const slug of slugs) {
    try {
      const detail = await fetchJson(`${API_BASE}/api/v1/skills/${encodeURIComponent(slug)}`);
      let skillMd = '';
      try {
        skillMd = await fetchText(
          `${API_BASE}/api/v1/skills/${encodeURIComponent(slug)}/file?path=${encodeURIComponent('SKILL.md')}`
        );
      } catch {
        // File fetch can fail for moderated/private/deleted versions; keep detail-only record.
      }

      const summary = cleanText(detail?.skill?.summary || '');
      const risk = classifyRisk({ summary, skillMd });

      items.push({
        slug,
        displayName: detail?.skill?.displayName || slug,
        owner: detail?.owner?.handle || null,
        summary,
        latestVersion: detail?.latestVersion?.version || null,
        updatedAt: detail?.skill?.updatedAt || null,
        stats: detail?.skill?.stats || {},
        metadata: detail?.metadata || null,
        riskLevel: risk.riskLevel,
        riskReasons: risk.reasons,
        source: {
          platform: 'clawhub',
          apiBase: API_BASE,
          skillUrl: `https://clawhub.ai/${encodeURIComponent(detail?.owner?.handle || 'u')}/${encodeURIComponent(slug)}`,
          installCommand: `clawhub install ${slug}`
        }
      });
    } catch (error) {
      items.push({
        slug,
        error: error instanceof Error ? error.message : String(error),
        source: { platform: 'clawhub', apiBase: API_BASE }
      });
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    query: QUERY,
    total: items.length,
    notes: [
      'This file is an intake manifest (metadata only), not a direct code copy.',
      'Review high-risk skills before enabling any write/trade operations.',
      'Prefer attribution and source links when surfacing external skills to users.'
    ],
    items
  };

  fs.mkdirSync(path.dirname(OUTPUT), { recursive: true });
  fs.writeFileSync(OUTPUT, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  console.log(`[clawhub-intake] wrote ${OUTPUT}`);
  console.log(
    `[clawhub-intake] risk summary low=${items.filter((x) => x.riskLevel === 'low').length} medium=${
      items.filter((x) => x.riskLevel === 'medium').length
    } high=${items.filter((x) => x.riskLevel === 'high').length}`
  );
}

main().catch((error) => {
  console.error(`[clawhub-intake] failed: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
