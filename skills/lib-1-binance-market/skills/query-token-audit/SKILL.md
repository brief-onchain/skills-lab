---
name: query_token_audit
description: Runs pre-trade token risk checks for honeypot, contract, and tax issues using Binance Web3 public audit endpoints.
---

# Query Token Audit

## Usage

- Category: Security
- Mode: live
- Version: 0.1.0

## Input Example

```json
{
  "contractAddress": "0x55d398326f99059ff775485246999027b3197955",
  "chainId": "56"
}
```

## Output Focus

- supported / unsupported status
- risk level and triggered risk items
- buy tax / sell tax snapshot
- code verification flag

## Notes

- Public audit results are point-in-time snapshots, not guarantees.
- Always pair this with liquidity checks and contract ownership review before trading.

## Install

`Use Playground (local runtime).`
