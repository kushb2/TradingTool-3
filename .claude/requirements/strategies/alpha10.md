# Alpha 10 — Strategy Specification

**Type:** Dual-portfolio equity strategy
**Universe:** Nifty LargeMidcap 250
**Total positions:** 10 stocks (5 momentum + 5 mean reversion)
**Rebalance:** Monthly (Momentum), Weekly (Mean Reversion)

---

## Portfolio A — Momentum 5

### Scoring Engine
```
Composite Score = 60% × Avg RSI(22, 44, 66)
                + 40% × Avg ROC(1M, 3M, 6M)
```

Why 3 RSI periods: captures short (22), medium (44), and long (66) momentum. A stock strong across all three has sustained momentum — not a one-week spike.

### Entry Filters (ALL must pass)
1. Price above 50-day SMA — uptrend confirmed
2. RSI(22) between 55–78 — strong but not overbought
3. Avg daily traded value > ₹10 Cr — liquid enough to exit
4. Not more than 30% below 52-week high — not a broken stock

### Selection
- Rank filtered stocks by composite score
- Pick Top 5 → equal weight 20% each
- Rebalance: monthly (last Friday)

### Exit Rules
| Stock rank | Action |
|------------|--------|
| Still in Top 8 | Hold |
| Rank 9–12 | Hold 1 more month (sticky band) |
| Rank 13+ | Sell immediately |
| RSI(22) drops below 45 | Sell immediately — momentum gone |

---

## Portfolio B — Mean Reversion 5

### The Core Signal — RSI Percentile (Kush's insight)
Instead of a fixed RSI threshold, each stock is judged against its own 2-year history:

1. Pull 2 years of daily RSI(14) values (~500 data points) per stock
2. Find where today's RSI sits in that stock's own distribution
3. **Oversold signal:** today's RSI ≤ 20th percentile of its own 2-year history
4. **Exit target:** RSI reaches the stock's own 50th percentile (its median)

This is personalised — HDFC Bank's oversold level differs from a volatile midcap's.

### Scoring Engine
```
Oversold Score = 50% × RSI Percentile (lower = better)
               + 30% × % below 20-day SMA (deeper dip = better)
               + 20% × Volume Ratio (today's vol ÷ 20-day avg vol)
```

### Entry Filters (ALL 6 must pass)
1. RSI(14) ≤ 20th percentile of own 2-year RSI history
2. Price ABOVE 200-day SMA — long-term trend intact (non-negotiable)
3. Price is 5–20% below its 20-day SMA — dipped, not crashed
4. Stock NOT making a fresh 52-week low — not in freefall
5. Volume on dip ≥ 1.5× its 20-day average — smart money signal
6. Sector RSI NOT also at its own 20th percentile — not a sector collapse

### Selection
- Rank stocks passing all 6 filters by Oversold Score
- Pick Top 5 → equal weight 20% each
- Rebalance: weekly (every Friday)
- Exits trigger any day — don't wait for Friday

### Exit Rules (strict — no exceptions)
**Take Profit (first of these to hit):**
- Price recovers to 20-day SMA
- RSI reaches stock's own 50th percentile
- +8% gain from entry

**Stop Loss (mandatory):**
- Price falls 5% below entry → sell same day, market order
- Held 20 trading days with no recovery → exit (thesis failed)
- Stock breaks 200-day SMA after entry → exit immediately

---

## Bear Market Override (Both Portfolios)

Check every Friday: Nifty 50 vs 200-day SMA

| Nifty condition | Portfolio A | Portfolio B |
|----------------|-------------|-------------|
| Above 200 SMA | Fully invested | Fully invested |
| Below 200 SMA (Month 1) | 50% cash | Stop new entries, tighten stops to 3% |
| Below 200 SMA (2 consecutive months) | 100% cash | 100% cash |

**Re-entry:** Nifty closes above 200 SMA for 10 consecutive days → rebuild gradually over 2 weeks.

---

## Capital Split
```
Total Capital
├── 50% → Portfolio A (Momentum 5)     — monthly, trend-following
└── 50% → Portfolio B (Mean Reversion 5) — weekly, dip-buying
```

---

## Source
Inspired by Alok Jain (Weekend Investing). RSI percentile signal was Kush's original insight — not from the source material.
