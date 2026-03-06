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

const DEFAULT_BSC_RPC =
  process.env.BSC_RPC_URL || 'https://bsc-dataseed.binance.org';
const PANCAKE_V2_FACTORY = '0xca143ce32fe78f1f7019d7d551a6402fc5350c73';
const PAIR_CREATED_TOPIC =
  '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9';
const DEFAULT_QUOTE_TOKENS = new Set([
  '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
  '0x55d398326f99059ff775485246999027b3197955', // USDT
  '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d', // USDC
  '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
  '0xc5f0f7b66764f6ec8c8dff7ba683102295e16409' // FDUSD
]);

const DEFAULT_ENHANCEMENT_APIS = [
  {
    name: 'DexScreener API',
    purpose: 'Liquidity, volume, and pair activity snapshots.',
    docs: 'https://docs.dexscreener.com/api/reference',
    auth: 'No API key, rate-limited.'
  },
  {
    name: 'GoPlus Token Security',
    purpose: 'Token risk/security flags (mint, blacklist, honeypot indicators, etc.).',
    docs: 'https://docs.gopluslabs.io/reference/tokensecurityusingget_1',
    auth: 'API key optional depending on plan; see official docs for current limits.'
  },
  {
    name: 'Honeypot.is API',
    purpose: 'Honeypot, tax, transfer simulation details.',
    docs: 'https://docs.honeypot.is/',
    auth: 'Currently usable without API key (subject to provider changes).'
  },
  {
    name: 'Etherscan/BscScan Logs API',
    purpose: 'Indexed event logs and transaction history fallback.',
    docs: 'https://docs.etherscan.io/api-reference/endpoint/getlogs',
    auth: 'API key required.'
  }
];

function clampNumber(value, min, max) {
  return Math.max(min, Math.min(max, Number(value)));
}

function isAddress(value) {
  return /^0x[a-fA-F0-9]{40}$/.test(String(value || '').trim());
}

function parseHexNumber(value) {
  if (typeof value !== 'string') {
    return 0;
  }
  const out = Number.parseInt(value, 16);
  return Number.isFinite(out) ? out : 0;
}

function toHexBlock(value) {
  return `0x${Math.max(0, Number(value) || 0).toString(16)}`;
}

function topicToAddress(topic) {
  if (typeof topic !== 'string' || !topic.startsWith('0x') || topic.length < 42) {
    return null;
  }
  return `0x${topic.slice(-40).toLowerCase()}`;
}

function parsePairAddressFromData(data) {
  if (typeof data !== 'string' || !data.startsWith('0x')) {
    return null;
  }
  const hex = data.slice(2);
  if (hex.length < 64) {
    return null;
  }
  return `0x${hex.slice(24, 64).toLowerCase()}`;
}

function prevUtcDay(day) {
  const d = new Date(`${day}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

function computeLongestStreak(dayKeys) {
  if (!dayKeys.length) {
    return 0;
  }

  const sorted = [...dayKeys].sort();
  let best = 1;
  let current = 1;
  for (let i = 1; i < sorted.length; i += 1) {
    if (prevUtcDay(sorted[i]) === sorted[i - 1]) {
      current += 1;
      best = Math.max(best, current);
    } else {
      current = 1;
    }
  }
  return best;
}

async function rpcCall(rpcUrl, method, params, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      signal: controller.signal,
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method,
        params
      })
    });

    if (!response.ok) {
      throw new Error(`RPC HTTP ${response.status}`);
    }

    const payload = await response.json();
    if (payload && payload.error) {
      throw new Error(payload.error.message || `RPC ${method} failed`);
    }
    return payload.result;
  } finally {
    clearTimeout(timer);
  }
}

async function callConfiguredApi(spec, timeoutMs = 12000) {
  const name = String(spec?.name || 'api').trim();
  const method = String(spec?.method || 'GET').trim().toUpperCase();
  const url = String(spec?.url || '').trim();
  const headers =
    spec && typeof spec.headers === 'object' && spec.headers
      ? spec.headers
      : {};
  const body = spec?.body;

  if (!url || !/^https?:\/\//i.test(url)) {
    throw new Error(`[${name}] invalid url`);
  }

  const init = {
    method,
    headers: {
      Accept: 'application/json',
      ...headers
    }
  };
  if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
    init.body = typeof body === 'string' ? body : JSON.stringify(body);
    if (!init.headers['Content-Type'] && !init.headers['content-type']) {
      init.headers['Content-Type'] = 'application/json';
    }
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { ...init, signal: controller.signal });
    const text = await res.text();
    let parsed = null;
    try {
      parsed = text ? JSON.parse(text) : null;
    } catch {
      parsed = text;
    }
    return {
      name,
      ok: res.ok,
      status: res.status,
      url,
      data: parsed
    };
  } finally {
    clearTimeout(timer);
  }
}

function buildEnhancementGuide() {
  return {
    mode: 'bring-your-own-api',
    principle:
      'Default run is free (public RPC + DexScreener). Add APIs in your own agent only when you need stronger confidence.',
    providers: DEFAULT_ENHANCEMENT_APIS,
    agentConfigTemplate: {
      env: [
        'BSC_RPC_URL=https://your-rpc-endpoint',
        'GOPLUS_API_KEY=optional',
        'ETHERSCAN_API_KEY=optional'
      ],
      process: [
        'Run dev-launch-streak-radar first to get baseline streak and launch velocity.',
        'If alertLevel is medium/high, let your agent call optional APIs for token-level risk.',
        'Pass those API call specs via input.extraApis so this skill can execute and merge responses.'
      ]
    }
  };
}

async function runDevLaunchStreakRadar(input) {
  const launcher = String(input.launcher || input.dev || '')
    .trim()
    .toLowerCase();
  if (!isAddress(launcher)) {
    throw new Error('launcher must be a valid EVM address, e.g. 0xabc...');
  }

  const rpcUrl = String(input.rpcUrl || DEFAULT_BSC_RPC).trim();
  if (!rpcUrl.startsWith('http')) {
    throw new Error('rpcUrl must be a valid http(s) endpoint');
  }

  const factory = String(input.factory || PANCAKE_V2_FACTORY)
    .trim()
    .toLowerCase();
  if (!isAddress(factory)) {
    throw new Error('factory must be a valid EVM address');
  }

  const days = clampNumber(input.days || input.windowDays || 7, 1, 30);
  const guideOnly = input.guideOnly === true;
  const blockSeconds = clampNumber(input.blockSeconds || 3, 1, 15);
  const blockChunk = clampNumber(input.blockChunk || 20000, 1000, 100000);
  const maxPairCreatedLogs = clampNumber(
    input.maxPairCreatedLogs || 600,
    50,
    5000
  );
  const maxTxLookups = clampNumber(
    input.maxTxLookups || maxPairCreatedLogs,
    50,
    5000
  );
  const minStreakDays = clampNumber(input.minStreakDays || 3, 1, 30);
  const includeDexScreener = input.includeDexScreener === true;
  const maxDexChecks = clampNumber(input.maxDexChecks || 6, 0, 20);
  const minLiquidityUsd = Math.max(0, Number(input.minLiquidityUsd || 5000));
  const extraApis = Array.isArray(input.extraApis)
    ? input.extraApis
        .filter((x) => x && typeof x === 'object')
        .slice(0, 6)
    : [];
  const extraApiTimeoutMs = clampNumber(input.extraApiTimeoutMs || 12000, 2000, 30000);
  const extraQuoteTokens = Array.isArray(input.quoteTokens)
    ? input.quoteTokens
        .map((x) => String(x || '').trim().toLowerCase())
        .filter((x) => isAddress(x))
    : [];

  const quoteTokens = new Set([...DEFAULT_QUOTE_TOKENS, ...extraQuoteTokens]);
  const warnings = [];
  const enhancementGuide = buildEnhancementGuide();
  const telemetry = {
    rpcUrl,
    logsMatchedTopic: 0,
    logsProcessed: 0,
    txLookups: 0,
    blockLookups: 0,
    dexChecks: 0,
    truncated: false
  };

  if (guideOnly) {
    return {
      launcher,
      mode: 'guide-only',
      summary:
        'Guide-only mode: no chain calls executed. Use this output to configure your own agent stack.',
      enhancementGuide,
      tips: [
        'Set guideOnly=false to run onchain streak detection.',
        'No self-hosted API is required for baseline mode; public RPC is enough.',
        'If your agent has API credentials, pass requests via input.extraApis to execute enrichment here.'
      ]
    };
  }

  const latestBlock = parseHexNumber(
    await rpcCall(rpcUrl, 'eth_blockNumber', [])
  );
  const blocksBack = Math.ceil((days * 24 * 60 * 60) / blockSeconds);
  const fromBlock = Math.max(1, latestBlock - blocksBack);

  const logs = [];
  for (
    let end = latestBlock;
    end >= fromBlock && logs.length < maxPairCreatedLogs;
    end -= blockChunk
  ) {
    const start = Math.max(fromBlock, end - blockChunk + 1);
    const batch = await rpcCall(rpcUrl, 'eth_getLogs', [
      {
        address: factory,
        fromBlock: toHexBlock(start),
        toBlock: toHexBlock(end),
        topics: [PAIR_CREATED_TOPIC]
      }
    ]);

    const list = Array.isArray(batch) ? batch : [];
    telemetry.logsMatchedTopic += list.length;

    for (let i = list.length - 1; i >= 0 && logs.length < maxPairCreatedLogs; i -= 1) {
      logs.push(list[i]);
    }
    if (list.length && logs.length >= maxPairCreatedLogs) {
      telemetry.truncated = true;
    }
  }

  telemetry.logsProcessed = logs.length;
  if (logs.length === 0) {
    return {
      launcher,
      window: { days, fromBlock, toBlock: latestBlock },
      continuousOpen: {
        isLikelyContinuous: false,
        streakDays: 0,
        longestStreakDays: 0,
        thresholdDays: minStreakDays
      },
      metrics: {
        launchesTotal: 0,
        launches24h: 0,
        launches7d: 0,
        activeDays: 0
      },
      recentLaunches: [],
      warnings: ['No Pancake PairCreated events found in selected window.'],
      tips: [
        'Default mode is free (public RPC only).',
        'For better coverage, increase days/maxPairCreatedLogs or use a dedicated RPC endpoint.'
      ],
      enhancementGuide,
      telemetry
    };
  }

  const launches = [];
  for (const log of logs) {
    if (telemetry.txLookups >= maxTxLookups) {
      telemetry.truncated = true;
      warnings.push('tx lookups capped by maxTxLookups; results are sampled.');
      break;
    }

    const txHash = String(log.transactionHash || '');
    if (!txHash) {
      continue;
    }
    const tx = await rpcCall(rpcUrl, 'eth_getTransactionByHash', [txHash]);
    telemetry.txLookups += 1;

    if (!tx || String(tx.from || '').toLowerCase() !== launcher) {
      continue;
    }

    const token0 = topicToAddress(log.topics && log.topics[1]);
    const token1 = topicToAddress(log.topics && log.topics[2]);
    const pair = parsePairAddressFromData(log.data);
    if (!token0 || !token1 || !pair) {
      continue;
    }

    const token0IsQuote = quoteTokens.has(token0);
    const token1IsQuote = quoteTokens.has(token1);
    let launchedToken = null;
    if (token0IsQuote && !token1IsQuote) {
      launchedToken = token1;
    } else if (token1IsQuote && !token0IsQuote) {
      launchedToken = token0;
    }

    launches.push({
      txHash,
      blockNumber: parseHexNumber(log.blockNumber),
      token0,
      token1,
      pair,
      launchedToken
    });
  }

  if (!launches.length) {
    return {
      launcher,
      window: { days, fromBlock, toBlock: latestBlock },
      continuousOpen: {
        isLikelyContinuous: false,
        streakDays: 0,
        longestStreakDays: 0,
        thresholdDays: minStreakDays
      },
      metrics: {
        launchesTotal: 0,
        launches24h: 0,
        launches7d: 0,
        activeDays: 0
      },
      recentLaunches: [],
      warnings: warnings.concat('No launches by this launcher found in sampled window.'),
      tips: [
        'Default mode is free (public RPC only).',
        'If this looks wrong, increase maxTxLookups/maxPairCreatedLogs or narrow days.'
      ],
      enhancementGuide,
      telemetry
    };
  }

  const uniqueBlocks = [...new Set(launches.map((x) => x.blockNumber))];
  const blockTs = new Map();
  for (const bn of uniqueBlocks) {
    const block = await rpcCall(rpcUrl, 'eth_getBlockByNumber', [toHexBlock(bn), false]);
    telemetry.blockLookups += 1;
    blockTs.set(bn, parseHexNumber(block && block.timestamp));
  }

  const nowMs = Date.now();
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sevenDayMs = 7 * oneDayMs;
  const dayCounts = new Map();

  launches.forEach((x) => {
    const tsSec = blockTs.get(x.blockNumber) || 0;
    x.timestamp = new Date(tsSec * 1000).toISOString();
    const day = x.timestamp.slice(0, 10);
    dayCounts.set(day, (dayCounts.get(day) || 0) + 1);
  });

  const dayKeys = [...dayCounts.keys()].sort();
  const today = new Date().toISOString().slice(0, 10);
  let streakDays = 0;
  for (let day = today; dayCounts.get(day); day = prevUtcDay(day)) {
    streakDays += 1;
  }
  const longestStreakDays = computeLongestStreak(dayKeys);

  const launches24h = launches.filter(
    (x) => nowMs - Date.parse(x.timestamp) <= oneDayMs
  ).length;
  const launches7d = launches.filter(
    (x) => nowMs - Date.parse(x.timestamp) <= sevenDayMs
  ).length;
  const activeDays = dayCounts.size;
  const isLikelyContinuous = streakDays >= minStreakDays;

  const uniqueLaunchedTokens = [
    ...new Set(launches.map((x) => x.launchedToken).filter(Boolean))
  ];

  const dexSnapshots = [];
  if (includeDexScreener && maxDexChecks > 0) {
    for (const tokenAddress of uniqueLaunchedTokens.slice(0, maxDexChecks)) {
      try {
        const data = await fetchJson(
          `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`,
          10000
        );
        telemetry.dexChecks += 1;

        const pairs = Array.isArray(data.pairs) ? data.pairs : [];
        const bscPairs = pairs.filter((p) => String(p.chainId || '').toLowerCase() === 'bsc');
        if (!bscPairs.length) {
          continue;
        }
        const topPair = bscPairs.sort((a, b) => {
          const liqA = Number(a?.liquidity?.usd || 0);
          const liqB = Number(b?.liquidity?.usd || 0);
          return liqB - liqA;
        })[0];
        dexSnapshots.push({
          tokenAddress,
          pairAddress: String(topPair.pairAddress || '').toLowerCase(),
          liquidityUsd: Number(topPair?.liquidity?.usd || 0),
          volume24h: Number(topPair?.volume?.h24 || 0),
          priceChange24h: Number(topPair?.priceChange?.h24 || 0)
        });
      } catch (error) {
        warnings.push(`DexScreener lookup failed for ${tokenAddress}: ${error.message}`);
      }
    }
  }

  const alive = dexSnapshots.filter((x) => x.liquidityUsd >= minLiquidityUsd).length;
  const avgLiquidityUsd =
    dexSnapshots.length > 0
      ? Number(
          (
            dexSnapshots.reduce((acc, item) => acc + item.liquidityUsd, 0) /
            dexSnapshots.length
          ).toFixed(2)
        )
      : null;

  let alertLevel = 'low';
  let score = 0;
  if (isLikelyContinuous) score += 2;
  if (launches7d >= 5) score += 2;
  if (dexSnapshots.length > 0 && alive / dexSnapshots.length >= 0.5) score += 1;
  if (score >= 4) {
    alertLevel = 'high';
  } else if (score >= 2) {
    alertLevel = 'medium';
  }

  const recentLaunches = launches
    .sort((a, b) => Date.parse(b.timestamp) - Date.parse(a.timestamp))
    .slice(0, 20);

  if (telemetry.truncated) {
    warnings.push('Sampling limits were hit; treat result as directional.');
  }

  const apiEnrichment = {
    configured: extraApis.length,
    completed: 0,
    results: [],
    errors: []
  };
  for (const spec of extraApis) {
    try {
      const out = await callConfiguredApi(spec, extraApiTimeoutMs);
      apiEnrichment.results.push(out);
      apiEnrichment.completed += 1;
    } catch (error) {
      apiEnrichment.errors.push(String(error.message || error));
      warnings.push(`Configured API failed: ${String(error.message || error)}`);
    }
  }

  return {
    launcher,
    window: {
      days,
      fromBlock,
      toBlock: latestBlock
    },
    continuousOpen: {
      isLikelyContinuous,
      streakDays,
      longestStreakDays,
      thresholdDays: minStreakDays
    },
    riskSignal: {
      alertLevel,
      reason:
        alertLevel === 'high'
          ? 'Frequent launches + multi-day streak detected.'
          : alertLevel === 'medium'
            ? 'Some repeated launch activity detected.'
            : 'No strong repeated launch streak found.'
    },
    metrics: {
      launchesTotal: launches.length,
      launches24h,
      launches7d,
      activeDays,
      uniqueLaunchedTokens: uniqueLaunchedTokens.length
    },
    dexScreener: {
      enabled: includeDexScreener,
      checkedTokens: dexSnapshots.length,
      minLiquidityUsd,
      aliveTokens: alive,
      aliveRatio:
        dexSnapshots.length > 0 ? Number((alive / dexSnapshots.length).toFixed(3)) : null,
      avgLiquidityUsd,
      samples: dexSnapshots.slice(0, 10)
    },
    recentLaunches,
    warnings,
    tips: [
      'No paid API is required by default: this skill runs on public BSC RPC only.',
      'Set includeDexScreener=true if you want market/liquidity enrichment.',
      'For better stability, pass your own rpcUrl in input.',
      'For richer alerts, let your agent pass configured API requests via input.extraApis.'
    ],
    enhancementGuide,
    apiEnrichment,
    telemetry
  };
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

    case 'dev-launch-streak-radar': {
      return runDevLaunchStreakRadar(input || {});
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
