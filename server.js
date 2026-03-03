const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const ROOT = __dirname;
const PUBLIC_DIR = path.join(ROOT, 'public');
const DATA_FILE = path.join(ROOT, 'data', 'skills.json');
const PORT = Number(process.env.PORT || 4173);
const FLAP_ENV_DEFAULT = '/Users/klxhans/Downloads/flap-nfa-mint/.env';

function loadEnvFile(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      return { loaded: false, path: filePath, reason: 'missing' };
    }

    const raw = fs.readFileSync(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) {
        continue;
      }
      const idx = trimmed.indexOf('=');
      if (idx <= 0) {
        continue;
      }

      const key = trimmed.slice(0, idx).trim();
      let value = trimmed.slice(idx + 1).trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }

    return { loaded: true, path: filePath };
  } catch (error) {
    return { loaded: false, path: filePath, reason: error.message };
  }
}

const envSource = process.env.FLAP_ENV_FILE || FLAP_ENV_DEFAULT;
const envLoadResult = loadEnvFile(envSource);

const CONFIG = {
  apiBase:
    process.env.SKILLS_API_BASE ||
    process.env.AI_API_BASE ||
    process.env.OPENAI_BASE_URL ||
    '',
  apiPath: process.env.SKILLS_API_PATH || '/skills/run',
  apiKey:
    process.env.SKILLS_API_KEY ||
    process.env.AI_API_KEY ||
    process.env.OPENAI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    '',
  model:
    process.env.SKILLS_API_MODEL ||
    process.env.OPENAI_MODEL ||
    process.env.GEMINI_MODEL ||
    'gpt-4.1-mini'
};

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon'
};

function sendJson(res, statusCode, data) {
  const body = JSON.stringify(data, null, 2);
  res.writeHead(statusCode, {
    'Content-Type': MIME['.json'],
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    const limit = 1024 * 1024;

    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > limit) {
        reject(new Error('Body too large'));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });

    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8').trim();
        resolve(raw ? JSON.parse(raw) : {});
      } catch (error) {
        reject(new Error('Invalid JSON body'));
      }
    });

    req.on('error', reject);
  });
}

async function fetchJson(url, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'bsc-skiller-brain/0.1' }
    });
    if (!response.ok) {
      throw new Error(`Upstream ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

function normalizeSymbol(value) {
  return String(value || 'BTCUSDT').toUpperCase().replace(/[^A-Z0-9]/g, '');
}

async function runLocalSkill(skillId, input) {
  switch (skillId) {
    case 'price-snapshot': {
      const symbol = normalizeSymbol(input.symbol);
      const ticker = await fetchJson(
        `https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`
      );
      return {
        symbol,
        lastPrice: Number(ticker.lastPrice),
        changePercent24h: Number(ticker.priceChangePercent),
        high24h: Number(ticker.highPrice),
        low24h: Number(ticker.lowPrice),
        volume24h: Number(ticker.volume)
      };
    }

    case 'top-movers': {
      const quoteAsset = String(input.quoteAsset || 'USDT').toUpperCase();
      const limit = Math.max(1, Math.min(30, Number(input.limit || 8)));
      const all = await fetchJson('https://api.binance.com/api/v3/ticker/24hr');
      const list = all
        .filter(
          (x) =>
            typeof x.symbol === 'string' &&
            x.symbol.endsWith(quoteAsset) &&
            !x.symbol.includes('UP') &&
            !x.symbol.includes('DOWN')
        )
        .map((x) => ({
          symbol: x.symbol,
          lastPrice: Number(x.lastPrice),
          changePercent24h: Number(x.priceChangePercent),
          quoteVolume24h: Number(x.quoteVolume)
        }))
        .sort((a, b) => b.changePercent24h - a.changePercent24h)
        .slice(0, limit);

      return {
        quoteAsset,
        movers: list
      };
    }

    case 'kline-brief': {
      const symbol = normalizeSymbol(input.symbol || 'BNBUSDT');
      const interval = String(input.interval || '15m');
      const limit = Math.max(5, Math.min(200, Number(input.limit || 24)));
      const klines = await fetchJson(
        `https://api.binance.com/api/v3/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`
      );

      const first = klines[0];
      const last = klines[klines.length - 1];
      const open = Number(first[1]);
      const close = Number(last[4]);

      return {
        symbol,
        interval,
        candles: klines.length,
        open,
        close,
        trendPercent: Number((((close - open) / open) * 100).toFixed(3)),
        latestCandle: {
          openTime: new Date(last[0]).toISOString(),
          open: Number(last[1]),
          high: Number(last[2]),
          low: Number(last[3]),
          close: Number(last[4]),
          volume: Number(last[5])
        }
      };
    }

    case 'funding-watch': {
      const symbol = normalizeSymbol(input.symbol || 'BTCUSDT');
      const data = await fetchJson(
        `https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`
      );
      return {
        symbol,
        markPrice: Number(data.markPrice),
        indexPrice: Number(data.indexPrice),
        fundingRate: Number(data.lastFundingRate),
        nextFundingTime: new Date(Number(data.nextFundingTime)).toISOString()
      };
    }

    case 'symbol-status': {
      const symbol = normalizeSymbol(input.symbol || 'SOLUSDT');
      const data = await fetchJson(
        `https://api.binance.com/api/v3/exchangeInfo?symbol=${symbol}`
      );
      const s = data.symbols && data.symbols[0] ? data.symbols[0] : null;
      if (!s) {
        throw new Error(`Symbol not found: ${symbol}`);
      }
      return {
        symbol,
        status: s.status,
        baseAsset: s.baseAsset,
        quoteAsset: s.quoteAsset,
        orderTypes: s.orderTypes,
        filters: s.filters
      };
    }

    default:
      throw new Error(`Unsupported local skill: ${skillId}`);
  }
}

async function callRemoteApi(payload, apiBase, apiPath, apiKey) {
  const base = String(apiBase || '').replace(/\/$/, '');
  const endpoint = `${base}${apiPath.startsWith('/') ? apiPath : `/${apiPath}`}`;

  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  const text = await response.text();
  let parsed;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    const message =
      parsed && parsed.error
        ? String(parsed.error)
        : `Remote API failed with status ${response.status}`;
    throw new Error(message);
  }

  return parsed;
}

function loadSkills() {
  try {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  } catch (error) {
    return {
      generatedAt: new Date().toISOString().slice(0, 10),
      skills: [],
      openSourceCandidates: [],
      error: `skills.json read failed: ${error.message}`
    };
  }
}

function serveStatic(req, res, pathname) {
  const incoming = pathname === '/' ? '/index.html' : pathname;
  const safePath = path.normalize(incoming).replace(/^\.\.[/\\]/, '');
  const target = path.join(PUBLIC_DIR, safePath);

  if (!target.startsWith(PUBLIC_DIR)) {
    sendJson(res, 403, { ok: false, error: 'Forbidden path' });
    return;
  }

  fs.readFile(target, (error, data) => {
    if (error) {
      sendJson(res, 404, { ok: false, error: 'Not found' });
      return;
    }

    const ext = path.extname(target).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache'
    });
    res.end(data);
  });
}

const server = http.createServer(async (req, res) => {
  const host = req.headers.host || `localhost:${PORT}`;
  const url = new URL(req.url || '/', `http://${host}`);
  const pathname = url.pathname;

  try {
    if (req.method === 'GET' && pathname === '/api/health') {
      sendJson(res, 200, {
        ok: true,
        service: 'bsc-skiller-brain',
        envLoaded: envLoadResult.loaded,
        envPath: envLoadResult.path,
        apiConfigured: Boolean(CONFIG.apiBase),
        startedAt: new Date().toISOString()
      });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/skills') {
      const catalog = loadSkills();
      sendJson(res, 200, { ok: true, catalog });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/playground') {
      const body = await readJsonBody(req);
      const skillId = String(body.skillId || 'price-snapshot');
      const input = typeof body.input === 'object' && body.input ? body.input : {};

      const remoteBase = String(body.apiBase || CONFIG.apiBase || '').trim();
      const remotePath = String(body.apiPath || CONFIG.apiPath || '/skills/run').trim();
      const remoteKey = String(body.apiKey || CONFIG.apiKey || '').trim();

      if (remoteBase) {
        const remotePayload = {
          skillId,
          input,
          model: body.model || CONFIG.model,
          client: 'skillslab-web'
        };
        const remoteResult = await callRemoteApi(
          remotePayload,
          remoteBase,
          remotePath,
          remoteKey
        );

        sendJson(res, 200, {
          ok: true,
          mode: 'proxy',
          skillId,
          result: remoteResult,
          proxiedTo: `${remoteBase}${remotePath}`
        });
        return;
      }

      const localResult = await runLocalSkill(skillId, input);
      sendJson(res, 200, {
        ok: true,
        mode: 'local',
        skillId,
        result: localResult,
        note: 'No external AI API configured, fallback to local skill runtime.'
      });
      return;
    }

    if (req.method === 'GET') {
      serveStatic(req, res, pathname);
      return;
    }

    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 500, {
      ok: false,
      error: error.message || 'Internal server error'
    });
  }
});

server.listen(PORT, () => {
  const mode = CONFIG.apiBase ? 'proxy+local' : 'local-only';
  console.log(`[bsc-skiller-brain] listening on http://localhost:${PORT} (${mode})`);
  if (envLoadResult.loaded) {
    console.log(`[bsc-skiller-brain] env loaded from ${envLoadResult.path}`);
  }
});
