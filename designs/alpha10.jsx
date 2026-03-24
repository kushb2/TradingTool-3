import { useState, useEffect, useCallback } from "react";

// ─── FONTS ───────────────────────────────────────────────────────────────────
const FontLink = () => (
  <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;500;600;700;800&family=JetBrains+Mono:wght@300;400;500;700&display=swap" rel="stylesheet" />
);

// ─── NIFTY LARGEMIDCAP 250 UNIVERSE ──────────────────────────────────────────
const UNIVERSE = [
  { symbol: "RELIANCE", sector: "Energy" },
  { symbol: "TCS", sector: "IT" },
  { symbol: "HDFCBANK", sector: "Banking" },
  { symbol: "INFY", sector: "IT" },
  { symbol: "ICICIBANK", sector: "Banking" },
  { symbol: "HINDUNILVR", sector: "FMCG" },
  { symbol: "ITC", sector: "FMCG" },
  { symbol: "SBIN", sector: "Banking" },
  { symbol: "BHARTIARTL", sector: "Telecom" },
  { symbol: "KOTAKBANK", sector: "Banking" },
  { symbol: "LT", sector: "Infra" },
  { symbol: "AXISBANK", sector: "Banking" },
  { symbol: "ASIANPAINT", sector: "Chemicals" },
  { symbol: "MARUTI", sector: "Auto" },
  { symbol: "TITAN", sector: "Consumer" },
  { symbol: "SUNPHARMA", sector: "Pharma" },
  { symbol: "ULTRACEMCO", sector: "Cement" },
  { symbol: "BAJFINANCE", sector: "NBFC" },
  { symbol: "NESTLEIND", sector: "FMCG" },
  { symbol: "WIPRO", sector: "IT" },
  { symbol: "POWERGRID", sector: "Power" },
  { symbol: "NTPC", sector: "Power" },
  { symbol: "HCLTECH", sector: "IT" },
  { symbol: "TECHM", sector: "IT" },
  { symbol: "INDUSINDBK", sector: "Banking" },
  { symbol: "DRREDDY", sector: "Pharma" },
  { symbol: "DIVISLAB", sector: "Pharma" },
  { symbol: "CIPLA", sector: "Pharma" },
  { symbol: "EICHERMOT", sector: "Auto" },
  { symbol: "HEROMOTOCO", sector: "Auto" },
  { symbol: "BAJAJFINSV", sector: "NBFC" },
  { symbol: "TATACONSUM", sector: "FMCG" },
  { symbol: "BRITANNIA", sector: "FMCG" },
  { symbol: "APOLLOHOSP", sector: "Healthcare" },
  { symbol: "ADANIENT", sector: "Conglomerate" },
  { symbol: "ADANIPORTS", sector: "Infra" },
  { symbol: "COALINDIA", sector: "Energy" },
  { symbol: "ONGC", sector: "Energy" },
  { symbol: "BPCL", sector: "Energy" },
  { symbol: "IOC", sector: "Energy" },
  { symbol: "GRASIM", sector: "Cement" },
  { symbol: "JSWSTEEL", sector: "Metals" },
  { symbol: "TATASTEEL", sector: "Metals" },
  { symbol: "HINDALCO", sector: "Metals" },
  { symbol: "VEDL", sector: "Metals" },
  { symbol: "PIDILITIND", sector: "Chemicals" },
  { symbol: "BERGEPAINT", sector: "Chemicals" },
  { symbol: "INDIGO", sector: "Aviation" },
  { symbol: "IRCTC", sector: "Infra" },
  { symbol: "CONCOR", sector: "Logistics" },
  { symbol: "TATAPOWER", sector: "Power" },
  { symbol: "ADANIGREEN", sector: "Power" },
  { symbol: "TORNTPOWER", sector: "Power" },
  { symbol: "NHPC", sector: "Power" },
  { symbol: "RECLTD", sector: "NBFC" },
  { symbol: "PFC", sector: "NBFC" },
  { symbol: "IRFC", sector: "NBFC" },
  { symbol: "MUTHOOTFIN", sector: "NBFC" },
  { symbol: "CHOLAFIN", sector: "NBFC" },
  { symbol: "LICHSGFIN", sector: "NBFC" },
  { symbol: "PAGEIND", sector: "Consumer" },
  { symbol: "HAVELLS", sector: "Consumer" },
  { symbol: "POLYCAB", sector: "Consumer" },
  { symbol: "JUBLFOOD", sector: "Consumer" },
  { symbol: "DMART", sector: "Retail" },
  { symbol: "TRENT", sector: "Retail" },
  { symbol: "MARICO", sector: "FMCG" },
  { symbol: "DABUR", sector: "FMCG" },
  { symbol: "GODREJCP", sector: "FMCG" },
  { symbol: "ZYDUSLIFE", sector: "Pharma" },
  { symbol: "MANKIND", sector: "Pharma" },
  { symbol: "ALKEM", sector: "Pharma" },
  { symbol: "LUPIN", sector: "Pharma" },
  { symbol: "AUROPHARMA", sector: "Pharma" },
  { symbol: "KPITTECH", sector: "IT" },
  { symbol: "MPHASIS", sector: "IT" },
  { symbol: "PERSISTENT", sector: "IT" },
  { symbol: "COFORGE", sector: "IT" },
  { symbol: "PIIND", sector: "Chemicals" },
  { symbol: "UPL", sector: "Chemicals" },
  { symbol: "ATUL", sector: "Chemicals" },
  { symbol: "DEEPAKNITR", sector: "Chemicals" },
  { symbol: "TATAMOTORS", sector: "Auto" },
  { symbol: "MAHINDRA", sector: "Auto" },
  { symbol: "ASHOKLEY", sector: "Auto" },
  { symbol: "BAJAJAUTO", sector: "Auto" },
  { symbol: "TVSMOTORS", sector: "Auto" },
  { symbol: "CROMPTON", sector: "Consumer" },
  { symbol: "VOLTAS", sector: "Consumer" },
  { symbol: "DIXON", sector: "Consumer" },
  { symbol: "ABB", sector: "Infra" },
  { symbol: "SIEMENS", sector: "Infra" },
  { symbol: "BHEL", sector: "Infra" },
  { symbol: "THERMAX", sector: "Infra" },
  { symbol: "CAMS", sector: "Fintech" },
  { symbol: "CDSL", sector: "Fintech" },
  { symbol: "BSE", sector: "Fintech" },
  { symbol: "MCX", sector: "Fintech" },
  { symbol: "ANGELONE", sector: "Fintech" },
  { symbol: "ZOMATO", sector: "Fintech" },
  { symbol: "NYKAA", sector: "Retail" },
  { symbol: "PAYTM", sector: "Fintech" },
  { symbol: "TATAELXSI", sector: "IT" },
  { symbol: "AFFLE", sector: "IT" },
  { symbol: "OBEROIRLTY", sector: "Real Estate" },
  { symbol: "GODREJPROP", sector: "Real Estate" },
  { symbol: "SOBHA", sector: "Real Estate" },
  { symbol: "DLF", sector: "Real Estate" },
  { symbol: "PRESTIGE", sector: "Real Estate" },
  { symbol: "STARHEALTH", sector: "Insurance" },
  { symbol: "MAXHEALTH", sector: "Healthcare" },
  { symbol: "METROPOLIS", sector: "Healthcare" },
  { symbol: "LALPATHLAB", sector: "Healthcare" },
  { symbol: "NMDC", sector: "Metals" },
  { symbol: "SAIL", sector: "Metals" },
  { symbol: "HAL", sector: "Defence" },
  { symbol: "BEL", sector: "Defence" },
  { symbol: "BEML", sector: "Defence" },
  { symbol: "KEI", sector: "Consumer" },
  { symbol: "EXIDEIND", sector: "Auto" },
  { symbol: "MOTHERSON", sector: "Auto" },
  { symbol: "ENDURANCE", sector: "Auto" },
  { symbol: "SUNDRMFAST", sector: "Auto" },
];

// ─── DETERMINISTIC PRICE SERIES GENERATOR ────────────────────────────────────
// Generates ~500 days of realistic price data per stock using seeded random walks
function seededRng(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function generatePriceSeries(symbol, days = 520) {
  const seed = symbol.split("").reduce((a, c) => a + c.charCodeAt(0) * 31, 0);
  const rng = seededRng(seed);
  const basePrice = 150 + rng() * 4500;
  const volatility = 0.008 + rng() * 0.022;
  const drift = -0.0002 + rng() * 0.0006;
  const prices = [basePrice];
  for (let i = 1; i < days; i++) {
    const shock = (rng() - 0.5) * 2;
    const change = drift + volatility * shock;
    prices.push(Math.max(10, prices[i - 1] * (1 + change)));
  }
  return prices;
}

// ─── TECHNICAL INDICATORS ─────────────────────────────────────────────────────
function calcRSI(prices, period) {
  if (prices.length < period + 1) return 50;
  let gains = 0, losses = 0;
  for (let i = 1; i <= period; i++) {
    const diff = prices[i] - prices[i - 1];
    if (diff > 0) gains += diff; else losses -= diff;
  }
  let avgGain = gains / period;
  let avgLoss = losses / period;
  for (let i = period + 1; i < prices.length; i++) {
    const diff = prices[i] - prices[i - 1];
    const g = diff > 0 ? diff : 0;
    const l = diff < 0 ? -diff : 0;
    avgGain = (avgGain * (period - 1) + g) / period;
    avgLoss = (avgLoss * (period - 1) + l) / period;
  }
  if (avgLoss === 0) return 100;
  const rs = avgGain / avgLoss;
  return 100 - 100 / (1 + rs);
}

function calcSMA(prices, period) {
  if (prices.length < period) return prices[prices.length - 1];
  const slice = prices.slice(-period);
  return slice.reduce((a, b) => a + b, 0) / period;
}

function calcROC(prices, period) {
  if (prices.length < period + 1) return 0;
  const old = prices[prices.length - 1 - period];
  const now = prices[prices.length - 1];
  return ((now - old) / old) * 100;
}

// ─── RSI PERCENTILE (core innovation) ────────────────────────────────────────
// Computes daily RSI over 2yr window, finds today's percentile in that history
function calcRSIPercentile(prices, rsiPeriod = 14) {
  const lookback = 500; // ~2 years trading days
  const start = Math.max(0, prices.length - lookback - rsiPeriod);
  const historicalRSIs = [];
  for (let end = rsiPeriod + 1; end <= prices.length - start; end++) {
    const slice = prices.slice(start, start + end);
    historicalRSIs.push(calcRSI(slice, rsiPeriod));
  }
  if (historicalRSIs.length === 0) return 50;
  const sorted = [...historicalRSIs].sort((a, b) => a - b);
  const currentRSI = historicalRSIs[historicalRSIs.length - 1];
  const rank = sorted.filter(v => v <= currentRSI).length;
  const percentile = (rank / sorted.length) * 100;
  const p20 = sorted[Math.floor(sorted.length * 0.2)];
  const p50 = sorted[Math.floor(sorted.length * 0.5)];
  return { currentRSI: +currentRSI.toFixed(1), percentile: +percentile.toFixed(1), p20: +p20.toFixed(1), p50: +p50.toFixed(1) };
}

// ─── NIFTY MARKET REGIME ─────────────────────────────────────────────────────
function getMarketRegime(niftyPrices) {
  const current = niftyPrices[niftyPrices.length - 1];
  const sma200 = calcSMA(niftyPrices, 200);
  const pct = ((current - sma200) / sma200) * 100;
  if (current > sma200) return { regime: "BULL", label: "Bull Market", color: "#10b981", pct: +pct.toFixed(2), action: "Fully Invested" };
  if (current < sma200) return { regime: "BEAR", label: "Bear Market", color: "#ef4444", pct: +pct.toFixed(2), action: "Move to Cash" };
  return { regime: "NEUTRAL", label: "Neutral", color: "#f59e0b", pct: 0, action: "Caution" };
}

// ─── FULL STOCK ANALYSIS ENGINE ───────────────────────────────────────────────
function analyseStock(stock) {
  const prices = generatePriceSeries(stock.symbol);
  const current = prices[prices.length - 1];
  const sma50 = calcSMA(prices, 50);
  const sma200 = calcSMA(prices, 200);
  const sma20 = calcSMA(prices, 20);
  const high52w = Math.max(...prices.slice(-252));
  const low52w = Math.min(...prices.slice(-252));
  const pctFromHigh = ((current - high52w) / high52w) * 100;
  const pctFromLow = ((current - low52w) / low52w) * 100;
  const pctFromSma20 = ((current - sma20) / sma20) * 100;

  // Volumes (simulated)
  const rng = seededRng(stock.symbol.charCodeAt(0) * 77);
  const avgVol = 500000 + rng() * 15000000;
  const todayVol = avgVol * (0.5 + rng() * 3);
  const volRatio = todayVol / avgVol;
  const avgDailyValue = (current * avgVol) / 1e7; // in Cr

  // Portfolio A signals
  const rsi22 = calcRSI(prices, 22);
  const rsi44 = calcRSI(prices, 44);
  const rsi66 = calcRSI(prices, 66);
  const avgRSI_momentum = (rsi22 + rsi44 + rsi66) / 3;
  const roc1m = calcROC(prices, 21);
  const roc3m = calcROC(prices, 63);
  const roc6m = calcROC(prices, 126);
  const avgROC = (roc1m + roc3m + roc6m) / 3;
  const rocScore = Math.min(100, Math.max(0, 50 + avgROC));
  const momentumScore = +(avgRSI_momentum * 0.6 + rocScore * 0.4).toFixed(2);

  // Portfolio A filters
  const mFilter1 = current > sma50;
  const mFilter2 = rsi22 >= 55 && rsi22 <= 78;
  const mFilter3 = avgDailyValue >= 10;
  const mFilter4 = pctFromHigh >= -30;
  const passedMomentum = mFilter1 && mFilter2 && mFilter3 && mFilter4;

  // Portfolio B signals
  const rsiPct = calcRSIPercentile(prices, 14);
  const oversoldScore = +(
    rsiPct.percentile * -0.5 +  // lower percentile = better, so negate
    Math.abs(Math.min(0, pctFromSma20)) * 0.3 +
    Math.min(volRatio, 3) * 20 * 0.2
  ).toFixed(2);
  // Normalise oversold score for ranking (higher = more oversold = better candidate)
  const mrScore = +(100 - rsiPct.percentile * 0.5 + Math.min(Math.abs(pctFromSma20), 20) * 0.3 + Math.min(volRatio, 3) * 0.2 * 10).toFixed(2);

  // Portfolio B filters
  const mrFilter1 = rsiPct.percentile <= 20;
  const mrFilter2 = current > sma200;
  const mrFilter3 = pctFromSma20 >= -20 && pctFromSma20 <= -5;
  const mrFilter4 = current > low52w * 1.02; // not at 52w low
  const mrFilter5 = volRatio >= 1.5;
  const passedMeanRev = mrFilter1 && mrFilter2 && mrFilter3 && mrFilter4 && mrFilter5;

  return {
    ...stock, current: +current.toFixed(2), sma50: +sma50.toFixed(2),
    sma200: +sma200.toFixed(2), sma20: +sma20.toFixed(2),
    high52w: +high52w.toFixed(2), low52w: +low52w.toFixed(2),
    pctFromHigh: +pctFromHigh.toFixed(2), pctFromSma20: +pctFromSma20.toFixed(2),
    avgDailyValue: +avgDailyValue.toFixed(1), volRatio: +volRatio.toFixed(2),
    rsi22: +rsi22.toFixed(1), rsi44: +rsi44.toFixed(1), rsi66: +rsi66.toFixed(1),
    avgRSI_momentum: +avgRSI_momentum.toFixed(1),
    roc1m: +roc1m.toFixed(2), roc3m: +roc3m.toFixed(2), roc6m: +roc6m.toFixed(2),
    momentumScore, passedMomentum,
    mFilters: [mFilter1, mFilter2, mFilter3, mFilter4],
    rsiPercentile: rsiPct.percentile, rsiCurrent: rsiPct.currentRSI,
    rsiP20: rsiPct.p20, rsiP50: rsiPct.p50,
    mrScore, passedMeanRev,
    mrFilters: [mrFilter1, mrFilter2, mrFilter3, mrFilter4, mrFilter5],
    stopLoss: +(current * 0.95).toFixed(2),
    target: +(sma20).toFixed(2),
  };
}

// ─── COLORS & UTILS ───────────────────────────────────────────────────────────
const C = {
  bg: "#070b14", surface: "#0d1423", border: "rgba(255,255,255,0.06)",
  green: "#00d4aa", red: "#ff4d6d", yellow: "#fbbf24",
  blue: "#4f8ef7", purple: "#a78bfa", text: "#e8edf5", muted: "#4a5568",
};
const pct = (n) => (n >= 0 ? "+" : "") + n?.toFixed(2) + "%";
const pr = (n) => "₹" + n?.toLocaleString("en-IN", { maximumFractionDigits: 0 });
const cl = (n, rev = false) => {
  if (rev) return n <= 0 ? C.green : C.red;
  return n >= 0 ? C.green : C.red;
};

// ─── PILL ─────────────────────────────────────────────────────────────────────
const Pill = ({ pass, label }) => (
  <span style={{
    fontSize: 9, padding: "2px 7px", borderRadius: 20, fontFamily: "JetBrains Mono",
    background: pass ? "rgba(0,212,170,0.12)" : "rgba(255,77,109,0.12)",
    color: pass ? C.green : C.red, border: `1px solid ${pass ? "rgba(0,212,170,0.3)" : "rgba(255,77,109,0.25)"}`,
    letterSpacing: 0.5,
  }}>{pass ? "✓" : "✗"} {label}</span>
);

// ─── SCORE BAR ────────────────────────────────────────────────────────────────
const ScoreBar = ({ value, max = 100, color }) => {
  const pctW = Math.min(100, Math.max(0, (value / max) * 100));
  const col = color || (pctW > 65 ? C.green : pctW > 40 ? C.yellow : C.red);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <div style={{ flex: 1, height: 5, background: "rgba(255,255,255,0.06)", borderRadius: 3, overflow: "hidden" }}>
        <div style={{ width: pctW + "%", height: "100%", background: col, borderRadius: 3 }} />
      </div>
      <span style={{ fontSize: 11, color: col, fontWeight: 700, minWidth: 32, fontFamily: "JetBrains Mono" }}>{value?.toFixed(0)}</span>
    </div>
  );
};

// ─── STOCK DETAIL MODAL ───────────────────────────────────────────────────────
const StockDetail = ({ stock, onClose, portfolio }) => {
  const isMR = portfolio === "B";
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: "blur(8px)" }}
      onClick={onClose}>
      <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 20, padding: 32, maxWidth: 680, width: "90%", maxHeight: "85vh", overflowY: "auto" }}
        onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 26, fontWeight: 800, fontFamily: "Syne", color: C.text }}>{stock.symbol}</div>
            <div style={{ fontSize: 12, color: C.muted, marginTop: 2 }}>{stock.sector} · {isMR ? "Mean Reversion" : "Momentum"} Candidate</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 22, fontWeight: 700, color: C.green, fontFamily: "JetBrains Mono" }}>{pr(stock.current)}</div>
            <button onClick={onClose} style={{ marginTop: 8, background: "rgba(255,255,255,0.06)", border: "none", color: C.muted, padding: "4px 12px", borderRadius: 6, cursor: "pointer", fontSize: 12 }}>✕ Close</button>
          </div>
        </div>

        {isMR ? (
          <>
            <div style={{ background: "rgba(0,212,170,0.05)", border: "1px solid rgba(0,212,170,0.15)", borderRadius: 12, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>RSI PERCENTILE ANALYSIS (2-Year History)</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 12 }}>
                {[
                  { label: "Current RSI", value: stock.rsiCurrent, color: C.yellow },
                  { label: "Percentile", value: stock.rsiPercentile + "th", color: stock.rsiPercentile <= 20 ? C.green : C.red },
                  { label: "20th %ile (Buy zone)", value: stock.rsiP20, color: C.green },
                  { label: "50th %ile (Target)", value: stock.rsiP50, color: C.blue },
                ].map(d => (
                  <div key={d.label} style={{ textAlign: "center", background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12 }}>
                    <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>{d.label}</div>
                    <div style={{ fontSize: 18, fontWeight: 700, color: d.color, fontFamily: "JetBrains Mono" }}>{d.value}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>TRADE LEVELS</div>
                {[
                  { label: "Entry (Current)", value: pr(stock.current), color: C.text },
                  { label: "Stop Loss (−5%)", value: pr(stock.stopLoss), color: C.red },
                  { label: "Target (20-day SMA)", value: pr(stock.target), color: C.green },
                  { label: "Risk/Reward", value: `1 : ${Math.abs((stock.target - stock.current) / (stock.current - stock.stopLoss)).toFixed(1)}`, color: C.blue },
                ].map(d => (
                  <div key={d.label} style={{ display: "flex", justifyContent: "space-between", padding: "7px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ fontSize: 12, color: C.muted }}>{d.label}</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: d.color, fontFamily: "JetBrains Mono" }}>{d.value}</span>
                  </div>
                ))}
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16 }}>
                <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>ENTRY FILTERS</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Pill pass={stock.mrFilters[0]} label={`RSI ≤ 20th %ile (${stock.rsiP20})`} />
                  <Pill pass={stock.mrFilters[1]} label={`Price > 200 SMA (${pr(stock.sma200)})`} />
                  <Pill pass={stock.mrFilters[2]} label={`−20% to −5% from 20 SMA`} />
                  <Pill pass={stock.mrFilters[3]} label="Not at 52W Low" />
                  <Pill pass={stock.mrFilters[4]} label={`Vol ${stock.volRatio.toFixed(1)}× avg (need 1.5×)`} />
                </div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 20 }}>
              {[
                { label: "RSI(22)", value: stock.rsi22, color: stock.rsi22 > 55 ? C.green : C.red },
                { label: "RSI(44)", value: stock.rsi44, color: stock.rsi44 > 55 ? C.green : C.red },
                { label: "RSI(66)", value: stock.rsi66, color: stock.rsi66 > 55 ? C.green : C.red },
                { label: "ROC 1M", value: pct(stock.roc1m), color: cl(stock.roc1m) },
                { label: "ROC 3M", value: pct(stock.roc3m), color: cl(stock.roc3m) },
                { label: "ROC 6M", value: pct(stock.roc6m), color: cl(stock.roc6m) },
              ].map(d => (
                <div key={d.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: 12, textAlign: "center" }}>
                  <div style={{ fontSize: 10, color: C.muted, marginBottom: 6 }}>{d.label}</div>
                  <div style={{ fontSize: 17, fontWeight: 700, color: d.color, fontFamily: "JetBrains Mono" }}>{d.value}</div>
                </div>
              ))}
            </div>
            <div style={{ background: "rgba(255,255,255,0.03)", borderRadius: 10, padding: 16, marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 2, marginBottom: 12 }}>ENTRY FILTERS</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                <Pill pass={stock.mFilters[0]} label={`Price > 50 SMA (${pr(stock.sma50)})`} />
                <Pill pass={stock.mFilters[1]} label={`RSI(22) 55–78 (${stock.rsi22})`} />
                <Pill pass={stock.mFilters[2]} label={`Vol > ₹10Cr (${stock.avgDailyValue.toFixed(0)}Cr)`} />
                <Pill pass={stock.mFilters[3]} label={`<30% from 52W high (${pct(stock.pctFromHigh)})`} />
              </div>
            </div>
          </>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10 }}>
          {[
            { label: "52W High", value: pr(stock.high52w) },
            { label: "52W Low", value: pr(stock.low52w) },
            { label: "20-day SMA", value: pr(stock.sma20) },
            { label: "50-day SMA", value: pr(stock.sma50) },
            { label: "200-day SMA", value: pr(stock.sma200) },
            { label: "Avg Daily Value", value: "₹" + stock.avgDailyValue + "Cr" },
          ].map(d => (
            <div key={d.label} style={{ background: "rgba(255,255,255,0.025)", borderRadius: 7, padding: "10px 12px" }}>
              <div style={{ fontSize: 9, color: C.muted, marginBottom: 4, letterSpacing: 1 }}>{d.label}</div>
              <div style={{ fontSize: 13, color: C.text, fontFamily: "JetBrains Mono", fontWeight: 600 }}>{d.value}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function Alpha10() {
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [allStocks, setAllStocks] = useState([]);
  const [niftyRegime, setNiftyRegime] = useState(null);
  const [tab, setTab] = useState("overview");
  const [selectedStock, setSelectedStock] = useState(null);
  const [selectedPortfolio, setSelectedPortfolio] = useState("A");
  const [rebalanceDate] = useState("28 Mar 2026");

  useEffect(() => {
    let i = 0;
    const run = () => {
      if (i >= UNIVERSE.length) {
        setLoading(false);
        return;
      }
      const batch = UNIVERSE.slice(i, i + 10).map(analyseStock);
      setAllStocks(prev => [...prev, ...batch]);
      setProgress(Math.round(((i + 10) / UNIVERSE.length) * 100));
      i += 10;
      setTimeout(run, 30);
    };
    // Nifty regime
    const niftyPrices = generatePriceSeries("NIFTY50", 520);
    setNiftyRegime(getMarketRegime(niftyPrices));
    run();
  }, []);

  const momentumStocks = allStocks
    .filter(s => s.passedMomentum)
    .sort((a, b) => b.momentumScore - a.momentumScore)
    .slice(0, 5);

  const meanRevStocks = allStocks
    .filter(s => s.passedMeanRev)
    .sort((a, b) => b.mrScore - a.mrScore)
    .slice(0, 5);

  const allMomentum = allStocks.filter(s => s.passedMomentum).sort((a, b) => b.momentumScore - a.momentumScore);
  const allMeanRev = allStocks.filter(s => s.passedMeanRev).sort((a, b) => b.mrScore - a.mrScore);

  if (loading) return (
    <div style={{ minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: "Syne" }}>
      <FontLink />
      <div style={{ fontSize: 13, color: C.muted, letterSpacing: 4, marginBottom: 24, fontFamily: "JetBrains Mono" }}>ANALYSING UNIVERSE</div>
      <div style={{ width: 320, height: 4, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ width: progress + "%", height: "100%", background: `linear-gradient(90deg, ${C.green}, ${C.blue})`, transition: "width 0.2s ease", borderRadius: 2 }} />
      </div>
      <div style={{ marginTop: 16, fontSize: 28, fontWeight: 800, color: C.text }}>{progress}%</div>
      <div style={{ marginTop: 8, fontSize: 11, color: C.muted, fontFamily: "JetBrains Mono" }}>{allStocks.length} / {UNIVERSE.length} stocks computed</div>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: "Syne", color: C.text }}>
      <FontLink />

      {/* ── HEADER ── */}
      <div style={{ borderBottom: `1px solid ${C.border}`, background: "rgba(7,11,20,0.95)", backdropFilter: "blur(16px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ maxWidth: 1300, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 34, height: 34, borderRadius: 9, background: `linear-gradient(135deg, ${C.green}, ${C.blue})`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>α</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 16, letterSpacing: 1 }}>ALPHA 10</div>
              <div style={{ fontSize: 9, color: C.muted, letterSpacing: 3, fontFamily: "JetBrains Mono" }}>NIFTY LARGEMIDCAP 250</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 4 }}>
            {["overview", "momentum", "meanrev", "screener"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding: "6px 14px", borderRadius: 7, border: "1px solid",
                borderColor: tab === t ? C.green : "transparent",
                background: tab === t ? "rgba(0,212,170,0.1)" : "transparent",
                color: tab === t ? C.green : C.muted,
                fontSize: 11, cursor: "pointer", fontFamily: "Syne", fontWeight: 600, letterSpacing: 1,
                textTransform: "uppercase",
              }}>{t === "meanrev" ? "Mean Rev" : t}</button>
            ))}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: "JetBrains Mono" }}>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 10, color: C.muted }}>MARKET REGIME</div>
              <div style={{ fontSize: 12, fontWeight: 700, color: niftyRegime?.color }}>{niftyRegime?.label} · Nifty {niftyRegime?.pct > 0 ? "+" : ""}{niftyRegime?.pct}% from 200 SMA</div>
            </div>
            <div style={{ padding: "5px 12px", borderRadius: 20, background: `${niftyRegime?.color}18`, border: `1px solid ${niftyRegime?.color}44`, fontSize: 10, color: niftyRegime?.color, fontWeight: 700, letterSpacing: 1 }}>
              {niftyRegime?.action}
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1300, margin: "0 auto", padding: "28px 24px" }}>

        {/* ── OVERVIEW TAB ── */}
        {tab === "overview" && (
          <div>
            {/* Stats Row */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: 14, marginBottom: 28 }}>
              {[
                { label: "UNIVERSE", value: UNIVERSE.length, sub: "LargeMidcap 250 stocks", icon: "🏛", color: C.blue },
                { label: "MOMENTUM PICKS", value: momentumStocks.length, sub: `of ${allMomentum.length} passed filters`, icon: "⚡", color: C.green },
                { label: "MEAN REV PICKS", value: meanRevStocks.length, sub: `of ${allMeanRev.length} passed filters`, icon: "🎯", color: C.purple },
                { label: "NEXT REBALANCE", value: rebalanceDate, sub: "Last Friday of month", icon: "📅", color: C.yellow },
                { label: "REGIME", value: niftyRegime?.label, sub: niftyRegime?.action, icon: niftyRegime?.regime === "BULL" ? "🟢" : "🔴", color: niftyRegime?.color },
              ].map((c, i) => (
                <div key={i} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 20px" }}>
                  <div style={{ fontSize: 9, color: C.muted, letterSpacing: 2, marginBottom: 10, fontFamily: "JetBrains Mono" }}>{c.label}</div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: c.color, marginBottom: 4 }}>{c.value}</div>
                  <div style={{ fontSize: 10, color: C.muted }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Two portfolio columns */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
              {/* Portfolio A */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: C.green }}>PORTFOLIO A — MOMENTUM 5</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>60% RSI(22,44,66) + 40% ROC(1M,3M,6M) · Monthly rebalance</div>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: C.muted }}>20% each</div>
                </div>
                {momentumStocks.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: C.muted, fontSize: 13 }}>No stocks passed all filters today</div>
                ) : momentumStocks.map((s, i) => (
                  <div key={s.symbol} onClick={() => { setSelectedStock(s); setSelectedPortfolio("A"); }}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < 4 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.green, minWidth: 20, fontFamily: "JetBrains Mono" }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 14 }}>{s.symbol}</span>
                        <span style={{ fontSize: 10, color: C.muted, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 4 }}>{s.sector}</span>
                      </div>
                      <ScoreBar value={s.momentumScore} />
                    </div>
                    <div style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>
                      <div style={{ fontSize: 12, color: cl(s.roc3m), fontWeight: 700 }}>{pct(s.roc3m)}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>3M ROC</div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setTab("momentum")} style={{ marginTop: 16, width: "100%", background: "rgba(0,212,170,0.07)", border: `1px solid rgba(0,212,170,0.2)`, color: C.green, padding: "9px", borderRadius: 8, cursor: "pointer", fontFamily: "Syne", fontWeight: 700, fontSize: 12 }}>
                  View Full Screener →
                </button>
              </div>

              {/* Portfolio B */}
              <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 1, color: C.purple }}>PORTFOLIO B — MEAN REVERSION 5</div>
                    <div style={{ fontSize: 10, color: C.muted, marginTop: 3 }}>RSI Percentile (2yr) + SMA Dev + Volume · Weekly rebalance</div>
                  </div>
                  <div style={{ fontSize: 10, fontFamily: "JetBrains Mono", color: C.muted }}>20% each</div>
                </div>
                {meanRevStocks.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "32px 0", color: C.muted, fontSize: 13 }}>No oversold stocks passing all 5 filters today</div>
                ) : meanRevStocks.map((s, i) => (
                  <div key={s.symbol} onClick={() => { setSelectedStock(s); setSelectedPortfolio("B"); }}
                    style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: i < meanRevStocks.length - 1 ? `1px solid ${C.border}` : "none", cursor: "pointer" }}
                    onMouseEnter={e => e.currentTarget.style.opacity = "0.8"}
                    onMouseLeave={e => e.currentTarget.style.opacity = "1"}>
                    <div style={{ fontSize: 13, fontWeight: 800, color: C.purple, minWidth: 20, fontFamily: "JetBrains Mono" }}>{i + 1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <div>
                          <span style={{ fontWeight: 700, fontSize: 14 }}>{s.symbol}</span>
                          <span style={{ fontSize: 10, color: C.purple, marginLeft: 8, fontFamily: "JetBrains Mono" }}>RSI {s.rsiPercentile}th %ile</span>
                        </div>
                        <span style={{ fontSize: 10, color: C.muted, background: "rgba(255,255,255,0.04)", padding: "2px 8px", borderRadius: 4 }}>{s.sector}</span>
                      </div>
                      <ScoreBar value={s.mrScore} color={C.purple} />
                    </div>
                    <div style={{ textAlign: "right", fontFamily: "JetBrains Mono" }}>
                      <div style={{ fontSize: 12, color: C.red, fontWeight: 700 }}>{pct(s.pctFromSma20)}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>from 20 SMA</div>
                    </div>
                  </div>
                ))}
                <button onClick={() => setTab("meanrev")} style={{ marginTop: 16, width: "100%", background: "rgba(167,139,250,0.07)", border: `1px solid rgba(167,139,250,0.2)`, color: C.purple, padding: "9px", borderRadius: 8, cursor: "pointer", fontFamily: "Syne", fontWeight: 700, fontSize: 12 }}>
                  View Full Screener →
                </button>
              </div>
            </div>

            {/* Strategy rules */}
            <div style={{ marginTop: 20, background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, padding: 24 }}>
              <div style={{ fontSize: 11, color: C.muted, letterSpacing: 3, marginBottom: 16, fontFamily: "JetBrains Mono" }}>STRATEGY RULES SUMMARY</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                <div>
                  <div style={{ fontSize: 12, color: C.green, fontWeight: 700, marginBottom: 10 }}>Portfolio A — Momentum</div>
                  {["Score = 60% Avg RSI(22,44,66) + 40% Avg ROC(1M,3M,6M)", "Entry: Price > 50 SMA, RSI 55–78, Vol > ₹10Cr, <30% from 52W high", "Hold if still in Top 8 · Watch rank 9–12 · Exit rank 13+", "Exit immediately if RSI(22) drops below 45", "Rebalance: Monthly, last Friday"].map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, fontSize: 11, color: "#94a3b8", marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{ color: C.green, marginTop: 1, fontSize: 9 }}>▸</span>{r}
                    </div>
                  ))}
                </div>
                <div>
                  <div style={{ fontSize: 12, color: C.purple, fontWeight: 700, marginBottom: 10 }}>Portfolio B — Mean Reversion</div>
                  {["RSI(14) ≤ 20th percentile of stock's own 2-year RSI history", "Entry: Price > 200 SMA, −5% to −20% from 20 SMA, vol 1.5×+, not at 52W low", "Target: Price recovers to 20 SMA OR RSI at 50th percentile OR +8%", "Stop loss: −5% from entry — hard, no exceptions", "Exit after 20 trading days if no recovery · Rebalance: Weekly"].map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, fontSize: 11, color: "#94a3b8", marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{ color: C.purple, marginTop: 1, fontSize: 9 }}>▸</span>{r}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ marginTop: 16, padding: 14, background: niftyRegime?.regime === "BULL" ? "rgba(0,212,170,0.05)" : "rgba(255,77,109,0.05)", border: `1px solid ${niftyRegime?.regime === "BULL" ? "rgba(0,212,170,0.2)" : "rgba(255,77,109,0.2)"}`, borderRadius: 10, fontSize: 12, color: niftyRegime?.color }}>
                🛡️ <strong>Bear Market Rule (Both Portfolios):</strong> Nifty below 200 SMA month 1 → 50% cash. Month 2 → 100% cash. Re-enter after 10 consecutive days above 200 SMA. · Current: {niftyRegime?.action}
              </div>
            </div>
          </div>
        )}

        {/* ── MOMENTUM TAB ── */}
        {tab === "momentum" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 3, marginBottom: 20, fontFamily: "JetBrains Mono" }}>
              MOMENTUM SCREENER · {allMomentum.length} STOCKS PASSED FILTERS · SORTED BY COMPOSITE SCORE
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 90px 70px 70px 70px 70px 80px 110px 60px", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 9, color: C.muted, letterSpacing: 2, fontFamily: "JetBrains Mono" }}>
                <span>#</span><span>STOCK</span><span>PRICE</span><span>RSI 22</span><span>RSI 44</span><span>RSI 66</span><span>ROC 3M</span><span>ROC 6M</span><span>SCORE</span><span>ACTION</span>
              </div>
              <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
                {allMomentum.map((s, i) => (
                  <div key={s.symbol} onClick={() => { setSelectedStock(s); setSelectedPortfolio("A"); }}
                    style={{ display: "grid", gridTemplateColumns: "36px 1fr 90px 70px 70px 70px 70px 80px 110px 60px", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", alignItems: "center", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(0,212,170,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontSize: 11, color: i < 5 ? C.green : C.muted, fontFamily: "JetBrains Mono", fontWeight: 700 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{s.symbol}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>{s.sector}</div>
                    </div>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: C.text }}>{pr(s.current)}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: s.rsi22 > 55 ? C.green : C.yellow }}>{s.rsi22}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: s.rsi44 > 55 ? C.green : C.yellow }}>{s.rsi44}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: s.rsi66 > 55 ? C.green : C.yellow }}>{s.rsi66}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: cl(s.roc3m) }}>{pct(s.roc3m)}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: cl(s.roc6m) }}>{pct(s.roc6m)}</span>
                    <ScoreBar value={s.momentumScore} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: i < 5 ? C.green : C.muted, fontFamily: "JetBrains Mono" }}>{i < 5 ? "BUY" : "WATCH"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── MEAN REVERSION TAB ── */}
        {tab === "meanrev" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 3, marginBottom: 20, fontFamily: "JetBrains Mono" }}>
              MEAN REVERSION SCREENER · {allMeanRev.length} STOCKS PASSED ALL 5 FILTERS · SORTED BY OVERSOLD SCORE
            </div>
            <div style={{ background: "rgba(167,139,250,0.05)", border: "1px solid rgba(167,139,250,0.15)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 11, color: C.purple }}>
              🎯 RSI Percentile is calculated from each stock's own 2-year RSI(14) history — not a fixed threshold. Each stock judged against itself.
            </div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "36px 1fr 90px 80px 80px 80px 80px 90px 110px 60px", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 9, color: C.muted, letterSpacing: 2, fontFamily: "JetBrains Mono" }}>
                <span>#</span><span>STOCK</span><span>PRICE</span><span>RSI %ILE</span><span>RSI NOW</span><span>BUY ≤</span><span>TARGET</span><span>STOP</span><span>SCORE</span><span>ACTION</span>
              </div>
              <div style={{ maxHeight: "65vh", overflowY: "auto" }}>
                {allMeanRev.map((s, i) => (
                  <div key={s.symbol} onClick={() => { setSelectedStock(s); setSelectedPortfolio("B"); }}
                    style={{ display: "grid", gridTemplateColumns: "36px 1fr 90px 80px 80px 80px 80px 90px 110px 60px", gap: 8, padding: "11px 16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", alignItems: "center", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(167,139,250,0.04)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontSize: 11, color: i < 5 ? C.purple : C.muted, fontFamily: "JetBrains Mono", fontWeight: 700 }}>{i + 1}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700 }}>{s.symbol}</div>
                      <div style={{ fontSize: 9, color: C.muted }}>{s.sector}</div>
                    </div>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: C.text }}>{pr(s.current)}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: s.rsiPercentile <= 10 ? C.green : C.purple, fontWeight: 700 }}>{s.rsiPercentile}th</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: C.yellow }}>{s.rsiCurrent}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: C.green }}>{s.rsiP20}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: C.blue }}>{s.rsiP50}</span>
                    <span style={{ fontSize: 12, fontFamily: "JetBrains Mono", color: C.red }}>{pr(s.stopLoss)}</span>
                    <ScoreBar value={Math.min(s.mrScore, 100)} color={C.purple} />
                    <span style={{ fontSize: 10, fontWeight: 700, color: i < 5 ? C.purple : C.muted, fontFamily: "JetBrains Mono" }}>{i < 5 ? "BUY" : "WATCH"}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SCREENER TAB ── */}
        {tab === "screener" && (
          <div>
            <div style={{ fontSize: 11, color: C.muted, letterSpacing: 3, marginBottom: 20, fontFamily: "JetBrains Mono" }}>FULL UNIVERSE · {allStocks.length} STOCKS · ALL SIGNALS</div>
            <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 70px 70px 70px 80px 80px 80px 80px", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${C.border}`, fontSize: 9, color: C.muted, letterSpacing: 2, fontFamily: "JetBrains Mono" }}>
                <span>STOCK</span><span>PRICE</span><span>RSI 22</span><span>RSI 44</span><span>RSI 66</span><span>RSI %ILE</span><span>ROC 1M</span><span>ROC 3M</span><span>MOM</span><span>STATUS</span>
              </div>
              <div style={{ maxHeight: "70vh", overflowY: "auto" }}>
                {allStocks.map((s) => (
                  <div key={s.symbol}
                    onClick={() => { setSelectedStock(s); setSelectedPortfolio(s.passedMomentum ? "A" : "B"); }}
                    style={{ display: "grid", gridTemplateColumns: "1fr 80px 70px 70px 70px 70px 80px 80px 80px 80px", gap: 8, padding: "10px 16px", borderBottom: `1px solid ${C.border}`, cursor: "pointer", alignItems: "center", transition: "background 0.15s" }}
                    onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.025)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <div>
                      <span style={{ fontWeight: 700, fontSize: 13 }}>{s.symbol}</span>
                      <span style={{ fontSize: 9, color: C.muted, marginLeft: 8 }}>{s.sector}</span>
                    </div>
                    <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: C.text }}>{pr(s.current)}</span>
                    <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: s.rsi22 > 55 ? C.green : s.rsi22 < 35 ? C.red : C.yellow }}>{s.rsi22}</span>
                    <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: s.rsi44 > 55 ? C.green : s.rsi44 < 35 ? C.red : C.yellow }}>{s.rsi44}</span>
                    <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: s.rsi66 > 55 ? C.green : s.rsi66 < 35 ? C.red : C.yellow }}>{s.rsi66}</span>
                    <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: s.rsiPercentile <= 20 ? C.purple : C.muted }}>{s.rsiPercentile}th</span>
                    <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: cl(s.roc1m) }}>{pct(s.roc1m)}</span>
                    <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: cl(s.roc3m) }}>{pct(s.roc3m)}</span>
                    <span style={{ fontSize: 11, fontFamily: "JetBrains Mono", color: s.momentumScore > 65 ? C.green : C.muted }}>{s.momentumScore.toFixed(0)}</span>
                    <div style={{ display: "flex", gap: 4 }}>
                      {s.passedMomentum && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 10, background: "rgba(0,212,170,0.15)", color: C.green, fontFamily: "JetBrains Mono" }}>MOM</span>}
                      {s.passedMeanRev && <span style={{ fontSize: 8, padding: "2px 6px", borderRadius: 10, background: "rgba(167,139,250,0.15)", color: C.purple, fontFamily: "JetBrains Mono" }}>MR</span>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{ textAlign: "center", padding: "20px 24px", fontSize: 10, color: C.muted, fontFamily: "JetBrains Mono", borderTop: `1px solid ${C.border}` }}>
        ⚠️ Simulated data for strategy visualisation only. Not financial advice. All prices and signals are synthetic. Past performance does not guarantee future results.
      </div>

      {/* Stock Detail Modal */}
      {selectedStock && <StockDetail stock={selectedStock} portfolio={selectedPortfolio} onClose={() => setSelectedStock(null)} />}
    </div>
  );
}
