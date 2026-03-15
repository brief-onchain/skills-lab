---
name: query_token_info
description: Searches token metadata, live market stats, and K-line data from Binance Web3 public endpoints with BSC-first defaults.
---

# Query Token Info

## Usage

- Category: Onchain Data
- Mode: live
- Version: 0.1.0

## Input Example

```json
{
  "action": "overview",
  "chainId": "56",
  "contractAddress": "0x55d398326f99059ff775485246999027b3197955"
}
```

## Supported Actions

- `search`: keyword token search on the selected chain
- `overview`: metadata + dynamic market snapshot
- `kline`: normalized candle summary for chart checks

## Notes

- Defaults to `chainId = 56` for BSC.
- `overview` can resolve by `keyword` if `contractAddress` is omitted.
- `kline` uses the Binance-linked candle feed and returns a compact summary instead of raw full arrays.

## Install

`Use Playground (local runtime).`
