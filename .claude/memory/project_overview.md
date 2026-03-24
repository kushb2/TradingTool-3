---
name: Project Overview — TradingTool-3
description: Active strategies being built, AI team structure, and current development phase
type: project
---

## Active Trading Strategies

**Alpha 10** — see `requirements/strategies/alpha10.md`
- Dual portfolio: Momentum 5 + Mean Reversion 5
- Universe: Nifty LargeMidcap 250
- Bear market protection via Nifty 200 SMA rule
- Prototype exists as alpha10.jsx

**Netweb Swing** — see `requirements/strategies/netweb-swing.md`
- User observed 7-day Monday-morning bounce cycle on NETWEB stock
- Dynamic buy zones (Zone 1/2/3) calculated from historical Monday 9:15-9:45 AM lows
- Scaled entry 40/40/20, scaled exit at +5%/+7%/+9%, hard stop at ₹3,000

## AI Team

| Command | Role |
|---------|------|
| `/pm` | Priya — PM with Zerodha/Groww background, converts vague ideas → specs |
| `/infra-arch` | Infrastructure Architect — DAO, cron, coroutines, helpers (business-logic agnostic) |
| `/arch` | System Architect — full business logic + system design |
| `/kite` | Kite Connect specialist |

**Why:** Kush (CEO) makes vague market observations. PM converts them to specs. Arch designs the system. Kush implements backend.

## Development Phase

Active development. No backward compatibility constraints. Free to rename, restructure, or rewrite anything.
