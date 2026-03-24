# Netweb Swing Strategy — Specification

**Stock:** NETWEB (Netweb Technologies, NSE)
**Type:** Weekly cyclical swing trade
**Observation period:** ~8 cycles over 2 months (as of March 2026)

---

## The Core Observation (Kush's Pattern)

Netweb Technologies is a fundamentally strong company (revenue +100%, strong AI/HPC order book). Every ~7 working days, the price returns to a low zone in the first 30 minutes of market open (9:15–9:45 AM IST). From that low, price rises 5–8% by Tuesday or Wednesday.

**Why the pattern exists:** Short-term traders take profit at the top (₹3,500–₹3,700), pulling the price back down. Fresh buyers then see a fundamentally good company at a discount and push it back up. The ₹3,000–₹3,150 zone is watched by many traders — it is a self-fulfilling support.

---

## Entry Rules

### Timing
- Only enter during the first 30 minutes of market open: **9:15–9:45 AM IST**
- Only on the day the weekly low forms (typically Monday, but the system should detect it)
- Wait for the **first uptick** after the low — do NOT buy at market open
- All buys as **limit orders** set before market opens

### Buy Zones (Dynamic — NOT hardcoded)
Zones are calculated automatically from the last 6 months of Monday 9:15–9:45 AM historical low data. More recent data is weighted more heavily.

| Zone | Capital allocation | Description |
|------|-------------------|-------------|
| Zone 1 | 40% | Primary support — most likely bounce level |
| Zone 2 | 40% | Deeper dip — still high probability |
| Zone 3 | 20% | Near all-time recent low — very low probability of reaching |

**Hard stop loss: ₹3,000** — if price breaks this, something fundamental has changed. Exit everything, no exceptions.

*(Current observed all-time recent low: ₹3,014. Stop is ₹14 below that.)*

---

## Exit Rules

### Sell Targets (Scaled)
| Target | % of position to sell | Level |
|--------|----------------------|-------|
| R1 | 40% | +5% from average entry |
| R2 | 40% | +7% from average entry |
| R3 | 20% | +9% from average entry (runner) |

### Moving Stop Loss
| Trigger | Action |
|---------|--------|
| R1 hit | Move stop to average entry price (breakeven — cannot lose money) |
| R2 hit | Move stop just above R1 (real profit locked in) |
| Day 7 | Sell everything at market — cycle window closed |

---

## Pattern Health Rules
- If **2 consecutive cycles** fail to reach R1 → stop trading, observe for 2 weeks
- Track every cycle in the trading diary (see below)

---

## Trading Diary (per cycle)

| Field | Record |
|-------|--------|
| Entry date | |
| Day of week | |
| Zone 1 / 2 / 3 filled? | |
| Average entry price | |
| R1 hit? Date + price | |
| R2 hit? Date + price | |
| R3 hit? Date + price | |
| Stop triggered? | |
| Day 7 exit triggered? | |
| Net P&L | |
| Notes | |

---

## Data Requirements for Dynamic Zone Calculation

The system must:
1. Pull every Monday's 9:15–9:45 AM OHLC data for the past 6 months from Kite Connect
2. Find the low of each such 30-minute window
3. Cluster those lows to identify Zone 1, Zone 2, Zone 3 boundaries
4. Weight recent data (last 2 weeks) more heavily than older data (3–6 months ago)
5. Recalculate zones weekly — they are not static

**Data source:** Kite Connect historical data API (1-minute candles, filtered to 9:15–9:45 window)

---

## 10-Day Price Table Feature

Show for each of the last 10 trading days:
- Date
- Day of week
- Low of day
- High of day

Purpose: visually confirm which days are consistently low vs high.

## Support & Resistance Levels (S1/S2/S3 and R1/R2/R3)

Show three auto-calculated levels above (resistance) and below (support) the current price, derived from recent price data. These serve as:
- Sell targets on the way up (R1/R2/R3)
- Buy zone markers on the way down (S1/S2/S3)
