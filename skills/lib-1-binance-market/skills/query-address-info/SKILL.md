---
name: query_address_info
description: Pulls wallet token positions and rough USD exposure for a BSC address using Binance Web3 public endpoints.
---

# Query Address Info

## Usage

- Category: Onchain Data
- Mode: live
- Version: 0.1.0

## Input Example

```json
{
  "address": "0x0000000000000000000000000000000000000001",
  "chainId": "56",
  "limit": 10
}
```

## Output Focus

- token symbol and contract address
- last price and 24h move
- remaining quantity
- rough USD exposure by position

## Notes

- Uses public wallet position endpoints; no private key needed.
- Returns a compact portfolio view for quick chain-side reads, not full accounting-grade PnL.

## Install

`Use Playground (local runtime).`
