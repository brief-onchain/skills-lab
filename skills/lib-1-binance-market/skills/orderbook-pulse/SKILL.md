---
name: orderbook_pulse
description: Summarizes best bid/ask spread, top-level depth notional, and bid-vs-ask pressure for one Binance spot pair.
---

# Orderbook Pulse

## Usage

- Category: Microstructure
- Mode: live
- Version: 0.1.0

## Input Example

```json
{
  "symbol": "BTCUSDT",
  "limit": 20
}
```

## Output Focus

- best bid / ask
- absolute spread and spread bps
- bid-side vs ask-side notional over the top depth levels
- simple pressure label: `bid-heavy`, `ask-heavy`, or `balanced`

## Guardrails

- Read-only market structure skill.
- Uses Binance public depth data only.
- Do not treat depth imbalance as a standalone trade trigger.

## Local Runtime

Use Playground (local runtime).
