import { getRpcEndpoints } from '@/lib/server/env';
import { loadSkillIds } from '@/lib/server/catalog';
import type { PlaygroundRequest, PlaygroundResponse } from '@/lib/types';

function normalizeSymbol(value: unknown, fallback = 'BTCUSDT') {
  return String(value || fallback)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');
}

async function fetchJson(url: string, timeoutMs = 12000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'skillsbrain-web/0.1.0' }
    });
    if (!response.ok) {
      throw new Error(`Upstream ${response.status}`);
    }
    return await response.json();
  } finally {
    clearTimeout(timer);
  }
}

async function rpcBlockNumber(endpoint: string) {
  const startedAt = Date.now();
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ jsonrpc: '2.0', id: 1, method: 'eth_blockNumber', params: [] })
  });

  if (!response.ok) {
    throw new Error(`${response.status}`);
  }

  const data = await response.json();
  if (!data.result) {
    throw new Error('no result');
  }

  return {
    endpoint,
    blockNumber: parseInt(data.result, 16),
    latencyMs: Date.now() - startedAt
  };
}

function bap578AdapterBlueprint(input: Record<string, unknown>) {
  const contractName = String(input.contractName || 'MyBAP578Adapter');
  const nfaInterface = String(input.nfaInterface || 'INFAOwner');

  const solidityTemplate = `// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface ${nfaInterface} {
  function ownerOf(uint256 tokenId) external view returns (address);
}

interface IAgentVault {
  function creditNative(uint256 tokenId) external payable;
  function debitNative(uint256 tokenId, uint256 amount, address to) external;
}

contract ${contractName} {
  address public immutable nfa;
  IAgentVault public immutable vault;

  modifier onlyOperator(uint256 tokenId) {
    require(${nfaInterface}(nfa).ownerOf(tokenId) == msg.sender, 'not operator');
    _;
  }

  constructor(address nfa_, address vault_) {
    require(nfa_ != address(0) && vault_ != address(0), 'zero address');
    nfa = nfa_;
    vault = IAgentVault(vault_);
  }

  function fund(uint256 tokenId) external payable {
    require(msg.value > 0, 'zero amount');
    vault.creditNative{ value: msg.value }(tokenId);
  }

  function withdraw(uint256 tokenId, uint256 amount, address to) external onlyOperator(tokenId) {
    vault.debitNative(tokenId, amount, to);
  }
}`;

  return {
    summary: 'Generated from FlapBAP578Adapter pattern: token owner acts as agent operator and vault controller is isolated.',
    solidityTemplate,
    checklist: [
      'Keep ownerOf(tokenId) authorization in modifier.',
      'Separate vault balance bookkeeping from adapter business logic.',
      'Emit events for funding/withdrawal/status update.',
      'Add nonReentrant for payable and token transfer functions.',
      'For ERC20 flows, use balance-diff pattern for fee-on-transfer safety.'
    ]
  };
}

function bap578VaultChecklist(input: Record<string, unknown>) {
  const includeTokenFlows = Boolean(input.includeTokenFlows ?? true);
  const items = [
    'Vault controller whitelist: only adapter/game engine contracts can debit.',
    'Token operator auth: use ownerOf(tokenId) as the sole authority.',
    'State bootstrap: initialize agent state lazily and emit event.',
    'Native withdrawal should validate target and amount.',
    'All external token calls should use safe transfer wrappers.'
  ];

  if (includeTokenFlows) {
    items.push('Use transfer-in balance delta, then credit actual received amount.');
    items.push('Reset ERC20 allowance to 0 after controller credit call.');
  }

  return {
    title: 'BAP578 Vault Safety Checklist',
    items,
    source: 'flap-nfa-mint/contracts/arena/FlapBAP578Adapter.sol'
  };
}

function bap578DeployPlan(input: Record<string, unknown>) {
  const network = String(input.network || 'bsc-mainnet');

  return {
    network,
    steps: [
      'Load env from FLAP_ENV_FILE and validate NEXT_PUBLIC_MINER_ADDRESS/TOKEN_ADDRESS.',
      'Deploy ArenaTreasury, NFAVault, FlapBAP578Adapter, CrashEngine in sequence.',
      'Set vault controllers: adapter=true and crashEngine=true.',
      'Set house edge / min bet / allowed assets on crash engine.',
      'Run verify scripts for all contracts and archive tx hashes.'
    ],
    commandTemplate: [
      'npm run compile',
      `npx hardhat run scripts/deploy-arena.js --network ${network}`,
      `npx hardhat run scripts/verify-arena-contracts.js --network ${network}`
    ],
    source: 'flap-nfa-mint/scripts/deploy-arena.js'
  };
}

function bap578TestTemplate(input: Record<string, unknown>) {
  const tokenId = Number(input.tokenId || 1);
  const includeFeeCase = Boolean(input.includeFeeOnTransferCase ?? true);

  const cases = [
    `fund + withdraw native for tokenId ${tokenId}`,
    'fund + withdraw ERC20 via adapter + vault controller',
    'reject withdraw when caller is not token operator',
    'reject direct vault debit from non-controller'
  ];
  if (includeFeeCase) {
    cases.push('fee-on-transfer token should credit actual received amount');
  }

  return {
    title: 'BAP578 Hardhat Test Skeleton',
    mochaBlocks: cases,
    source: 'flap-nfa-mint/test/ArenaFlow.test.js',
    notes: 'Copy structure and fixtures from ArenaFlow to speed up initial test coverage.'
  };
}

function bap578IdeaSprint(input: Record<string, unknown>) {
  const idea = String(input.idea || 'BAP578 game adapter with reward vault');

  return {
    idea,
    deliverables: [
      'Define tokenId-bound ownership and operator permissions.',
      'List required vault credit/debit flows (native + ERC20).',
      'Define events for indexer and monitoring dashboards.',
      'Draft minimal adapter contract with 3-5 functions.',
      'Draft test plan: happy path, auth fail, and balance consistency.'
    ],
    oneDayPlan: {
      hour1: 'Finalize interface + storage layout.',
      hour2to4: 'Implement adapter + deploy script.',
      hour5to6: 'Write core tests and run locally.',
      hour7: 'Publish skill as template in playground.'
    }
  };
}

async function runLocalSkill(skillId: string, input: Record<string, unknown>) {
  switch (skillId) {
    case 'price-snapshot': {
      const symbol = normalizeSymbol(input.symbol);
      const ticker = await fetchJson(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`);
      return {
        symbol,
        lastPrice: Number(ticker.lastPrice),
        changePercent24h: Number(ticker.priceChangePercent),
        high24h: Number(ticker.highPrice),
        low24h: Number(ticker.lowPrice),
        quoteVolume24h: Number(ticker.quoteVolume)
      };
    }

    case 'top-movers': {
      const quoteAsset = String(input.quoteAsset || 'USDT').toUpperCase();
      const limit = Math.max(1, Math.min(30, Number(input.limit || 10)));
      const all = await fetchJson('https://api.binance.com/api/v3/ticker/24hr');
      const movers = all
        .filter((item: any) => item.symbol?.endsWith?.(quoteAsset) && !String(item.symbol).includes('UP') && !String(item.symbol).includes('DOWN'))
        .map((item: any) => ({
          symbol: item.symbol,
          lastPrice: Number(item.lastPrice),
          changePercent24h: Number(item.priceChangePercent),
          quoteVolume24h: Number(item.quoteVolume)
        }))
        .sort((a: any, b: any) => b.changePercent24h - a.changePercent24h)
        .slice(0, limit);

      return { quoteAsset, movers };
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
      const data = await fetchJson(`https://fapi.binance.com/fapi/v1/premiumIndex?symbol=${symbol}`);
      return {
        symbol,
        markPrice: Number(data.markPrice),
        indexPrice: Number(data.indexPrice),
        fundingRate: Number(data.lastFundingRate),
        nextFundingTime: new Date(Number(data.nextFundingTime)).toISOString()
      };
    }

    case 'open-interest-scan': {
      const symbol = normalizeSymbol(input.symbol || 'ETHUSDT');
      const data = await fetchJson(`https://fapi.binance.com/fapi/v1/openInterest?symbol=${symbol}`);
      return {
        symbol,
        openInterest: Number(data.openInterest),
        timestamp: new Date(Number(data.time)).toISOString()
      };
    }

    case 'symbol-status': {
      const symbol = normalizeSymbol(input.symbol || 'SOLUSDT');
      const data = await fetchJson(`https://api.binance.com/api/v3/exchangeInfo?symbol=${symbol}`);
      const s = data?.symbols?.[0];
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

    case 'bsc-rpc-fanout-check': {
      const sampleSize = Math.max(1, Math.min(6, Number(input.sampleSize || 3)));
      const endpoints = getRpcEndpoints().slice(0, sampleSize);
      const probes = await Promise.all(
        endpoints.map(async (endpoint) => {
          try {
            return await rpcBlockNumber(endpoint);
          } catch (error) {
            return {
              endpoint,
              error: error instanceof Error ? error.message : 'probe failed'
            };
          }
        })
      );

      const ok = probes.filter((p: any) => !('error' in p));
      ok.sort((a: any, b: any) => a.latencyMs - b.latencyMs);

      return {
        probes,
        fastest: ok[0] || null
      };
    }

    case 'bap578-adapter-blueprint':
      return bap578AdapterBlueprint(input);

    case 'bap578-vault-checklist':
      return bap578VaultChecklist(input);

    case 'bap578-deploy-plan':
      return bap578DeployPlan(input);

    case 'bap578-test-template':
      return bap578TestTemplate(input);

    case 'bap578-contract-idea-sprint':
      return bap578IdeaSprint(input);

    default: {
      const known = Array.from(loadSkillIds()).join(', ');
      throw new Error(`Unknown skillId: ${skillId}. Known: ${known}`);
    }
  }
}

export async function runPlaygroundLocal(payload: PlaygroundRequest): Promise<PlaygroundResponse> {
  const startedAt = Date.now();
  try {
    const result = await runLocalSkill(payload.skillId, payload.input || {});
    return {
      success: true,
      mode: 'local',
      data: result,
      executionTime: Date.now() - startedAt
    };
  } catch (error) {
    return {
      success: false,
      mode: 'local',
      error: error instanceof Error ? error.message : 'Unknown error',
      executionTime: Date.now() - startedAt
    };
  }
}

export async function runPlaygroundRemote(
  payload: PlaygroundRequest,
  remote: { apiBase: string; apiPath: string; apiKey?: string; model?: string }
): Promise<PlaygroundResponse> {
  const startedAt = Date.now();

  const endpoint = `${remote.apiBase.replace(/\/$/, '')}${
    remote.apiPath.startsWith('/') ? remote.apiPath : `/${remote.apiPath}`
  }`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  };

  if (remote.apiKey) {
    headers.Authorization = `Bearer ${remote.apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      skillId: payload.skillId,
      input: payload.input || {},
      model: remote.model,
      client: 'skillsbrain-web'
    })
  });

  const text = await response.text();
  let parsed: any;
  try {
    parsed = text ? JSON.parse(text) : {};
  } catch {
    parsed = { raw: text };
  }

  if (!response.ok) {
    return {
      success: false,
      mode: 'proxy',
      error: parsed?.error || `Remote API failed with status ${response.status}`,
      executionTime: Date.now() - startedAt
    };
  }

  return {
    success: true,
    mode: 'proxy',
    data: parsed,
    executionTime: Date.now() - startedAt
  };
}
