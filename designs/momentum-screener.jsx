import { useState, useEffect, useRef } from "react";

const SAMPLE_STOCKS = [
  "RELIANCE","TCS","HDFCBANK","INFY","ICICIBANK","HINDUNILVR","ITC","SBIN","BHARTIARTL","KOTAKBANK",
  "LT","AXISBANK","ASIANPAINT","MARUTI","TITAN","SUNPHARMA","ULTRACEMCO","BAJFINANCE","NESTLEIND","WIPRO",
  "POWERGRID","NTPC","HCLTECH","TECHM","INDUSINDBK","DRREDDY","DIVISLAB","CIPLA","EICHERMOT","HEROMOTOCO",
  "BAJAJFINSV","TATACONSUM","BRITANNIA","APOLLOHOSP","ADANIENT","ADANIPORTS","COALINDIA","ONGC","BPCL","IOC",
  "GRASIM","JSWSTEEL","TATASTEEL","HINDALCO","VEDL","NMDC","SAIL","NATIONALUM","HINDCOPPER","MOIL",
  "PIDILITIND","BERGEPAINT","AKZOINDIA","KANSAINER","INDIGO","SPICEJET","IRCTC","CONCOR","CESC","TATAPOWER",
  "ADANIGREEN","TORNTPOWER","RPOWER","NHPC","SJVN","RECLTD","PFC","IRFC","HUDCO","NBCC",
  "MUTHOOTFIN","CHOLAFIN","BAJAJHLDNG","LICHSGFIN","CANFINHOME","PNBHOUSING","AAVAS","APTUS","HOMEFIRST","INDIASHLTR",
  "PAGEIND","VGUARD","HAVELLS","POLYCAB","FINOLEX","KEI","RRKABEL","NETWORK18","ZEEL","SUNTV",
  "JUBLFOOD","DEVYANI","WESTLIFE","SAPPHIRE","BARBEQUE","YUMBRANDS","DOMINOS","MCDONALD","PVRCINEMAS","INOXLEISUR",
  "DMART","TRENT","NYKAA","MEESHO","SHOPPERS","VMART","PATANJALI","MARICO","DABUR","GODREJCP",
  "ZYDUSLIFE","MANKIND","ALKEM","LUPIN","AUROPHARMA","CADILAHC","IPCALAB","NATCOPHARM","GRANULES","PFIZER",
  "KPITTECH","MPHASIS","LTTS","PERSISTENT","COFORGE","MASTEK","ZENSAR","NIIT","HEXAWARE","RATEGAIN",
  "PIIND","UPL","ATUL","NAVIN","DEEPAKNITR","AARTI","VINATI","GALAXYSURF","BALRAMCHIN","RENUKA",
  "APLAPOLLO","JSWINFRA","NUVOCO","RAMCOCEM","BIRLASOFT","STARHEALTH","MAXHEALTH","METROPOLIS","THYROCARE","LALPATHLAB",
  "CAMS","CDSL","BSE","MCX","ANGELONE","ICICIlombard","HDFCLIFE","SBILIFE","SBIGENINS","GODIGIT",
  "TATAMOTORS","M&M","ASHOKLEY","FORCEMOT","BAJAJAUTO","TVSMOTORS","ESCORTS","TRACTORS","MAHINDCIE","SUNDRMFAST",
  "CROMPTON","VOLTAS","BLUESTAR","WHIRLPOOL","AMBER","DIXON","PG","HONAUT","3MINDIA","SIEMENS",
  "ABB","BHEL","THERMAX","CG","KALPATPOWR","KEC","POWERINDIA","SUZLON","JINDALSAW","RATNAMANI",
  "ZOMATO","NYKAFASHION","POLICYBZR","CARTRADE","JUSTDIAL","INDIAMART","INFO EDGE","NAZARA","HAPPIEST","TATAELXSI",
  "AFFLE","ROUTE","MAPMYINDIA","IDEAFORGE","PAYTM","FINCABLES","COCHINSHIP","BEL","HAL","BEML",
  "MFSL","MAZDOCK","GRSE","MIDHANI","ELECON","KENNAMETAL","TIMKEN","SCHAEFFLER","SKF","GRINDWELL",
  "CERA","SOMANY","KAJARIA","ASIANPAINT","RELAXO","BATA","METRO","CAMPUS","LEVIS","VIP",
  "WHIRLPOOL","PRESTIGE","OBEROIRLTY","GODREJPROP","SOBHA","BRIGADE","KOLTEPATIL","MAHLIFE","LODHA","DLF",
  "EXIDEIND","AMARAJABAT","GRAVITA","HINDUJAIND","MOTHERSON","ENDURANCE","MINDA","SUPRAJIT","LUMAX","FIEM"
];

function seededRandom(seed) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

function generateStockData(symbol, idx) {
  const rng = seededRandom(idx * 137 + symbol.charCodeAt(0) * 31);
  const basePrice = 200 + rng() * 4800;
  const weekHigh = basePrice * (1 + rng() * 0.6);
  const weekLow = basePrice * (1 - rng() * 0.4);
  const currentPrice = weekLow + rng() * (weekHigh - weekLow);
  const rsi = 25 + rng() * 65;
  const roc1m = -15 + rng() * 40;
  const roc3m = -20 + rng() * 60;
  const roc6m = -25 + rng() * 80;
  const sma50 = basePrice * (0.85 + rng() * 0.3);
  const sma200 = basePrice * (0.75 + rng() * 0.35);
  const pct52wHigh = ((currentPrice - weekHigh) / weekHigh) * 100;
  const pct52wLow = ((currentPrice - weekLow) / weekLow) * 100;
  const maSignal = sma50 > sma200 ? 1 : 0;
  const volume = Math.floor(500000 + rng() * 10000000);
  const mktCap = Math.floor(currentPrice * (1e6 + rng() * 1e9));
  const sector = ["Banking","IT","FMCG","Auto","Pharma","Energy","Metals","Infra","Real Estate","Chemicals"][Math.floor(rng()*10)];

  // Composite momentum score (0-100)
  const rsiScore = rsi > 50 ? Math.min((rsi - 50) / 30 * 100, 100) : Math.max((rsi - 50) / 25 * 100, -100);
  const highScore = Math.max(0, 100 - Math.abs(pct52wHigh) * 3);
  const rocScore = Math.min(100, Math.max(0, 50 + roc3m));
  const maScore = maSignal * 100;
  const composite = (rsiScore * 0.25 + highScore * 0.25 + rocScore * 0.3 + maScore * 0.2);

  return {
    symbol, sector, currentPrice, weekHigh, weekLow,
    rsi: +rsi.toFixed(1),
    roc1m: +roc1m.toFixed(2),
    roc3m: +roc3m.toFixed(2),
    roc6m: +roc6m.toFixed(2),
    sma50: +sma50.toFixed(2),
    sma200: +sma200.toFixed(2),
    pct52wHigh: +pct52wHigh.toFixed(2),
    maSignal,
    volume,
    mktCap,
    composite: +composite.toFixed(2),
  };
}

const ALL_STOCKS = SAMPLE_STOCKS.slice(0, 250).map((s, i) => generateStockData(s, i))
  .sort((a, b) => b.composite - a.composite)
  .map((s, i) => ({ ...s, rank: i + 1 }));

const TOP20 = ALL_STOCKS.slice(0, 20);

const fmt = (n) => n?.toLocaleString("en-IN", { maximumFractionDigits: 2 });
const fmtPct = (n) => (n >= 0 ? "+" : "") + n?.toFixed(2) + "%";
const fmtCr = (n) => {
  if (n >= 1e12) return "₹" + (n / 1e12).toFixed(1) + "L Cr";
  if (n >= 1e9) return "₹" + (n / 1e9).toFixed(1) + "K Cr";
  return "₹" + (n / 1e7).toFixed(1) + " Cr";
};

const SECTORS = [...new Set(ALL_STOCKS.map(s => s.sector))];

export default function MomentumScreener() {
  const [view, setView] = useState("dashboard");
  const [selected, setSelected] = useState(null);
  const [filterSector, setFilterSector] = useState("All");
  const [topN, setTopN] = useState(20);
  const [sortBy, setSortBy] = useState("composite");
  const [animated, setAnimated] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimated(true), 100);
  }, []);

  const displayed = ALL_STOCKS
    .filter(s => filterSector === "All" || s.sector === filterSector)
    .sort((a, b) => {
      if (sortBy === "rsi") return b.rsi - a.rsi;
      if (sortBy === "roc3m") return b.roc3m - a.roc3m;
      if (sortBy === "pct52w") return b.pct52wHigh - a.pct52wHigh;
      return b.composite - a.composite;
    })
    .slice(0, topN);

  const portfolioStocks = displayed.slice(0, 20);
  const equalWeight = (100 / portfolioStocks.length).toFixed(1);

  const rsiColor = (r) => r >= 70 ? "#f97316" : r >= 55 ? "#22c55e" : r >= 40 ? "#facc15" : "#ef4444";
  const rocColor = (r) => r >= 10 ? "#22c55e" : r >= 0 ? "#86efac" : r >= -10 ? "#fca5a5" : "#ef4444";
  const scoreBar = (v) => {
    const pct = Math.max(0, Math.min(100, v));
    const color = pct > 65 ? "#22c55e" : pct > 40 ? "#facc15" : "#ef4444";
    return (
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 6, overflow: "hidden" }}>
          <div style={{ width: pct + "%", height: "100%", background: color, borderRadius: 4, transition: "width 1s ease" }} />
        </div>
        <span style={{ fontSize: 12, color, fontWeight: 700, minWidth: 36 }}>{pct.toFixed(0)}</span>
      </div>
    );
  };

  return (
    <div style={{
      minHeight: "100vh", background: "#0a0e1a",
      fontFamily: "'IBM Plex Mono', monospace",
      color: "#e2e8f0",
      backgroundImage: "radial-gradient(ellipse at 20% 0%, rgba(16,185,129,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 100%, rgba(99,102,241,0.07) 0%, transparent 60%)",
    }}>
      <link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@300;400;500;700&family=Space+Grotesk:wght@400;700&display=swap" rel="stylesheet" />
      
      {/* Header */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", padding: "18px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", background: "rgba(0,0,0,0.3)", backdropFilter: "blur(12px)", position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "linear-gradient(135deg, #10b981, #6366f1)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>⚡</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15, letterSpacing: 2, color: "#f1f5f9" }}>MOMENTUM_ALPHA</div>
            <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 3 }}>NIFTY LARGEMIDCAP 250</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["dashboard","screener","portfolio"].map(v => (
            <button key={v} onClick={() => setView(v)} style={{
              padding: "7px 16px", borderRadius: 6, border: "1px solid",
              borderColor: view === v ? "#10b981" : "rgba(255,255,255,0.1)",
              background: view === v ? "rgba(16,185,129,0.15)" : "transparent",
              color: view === v ? "#10b981" : "#94a3b8",
              fontSize: 11, cursor: "pointer", letterSpacing: 1.5, fontFamily: "inherit", textTransform: "uppercase"
            }}>{v}</button>
          ))}
        </div>
        <div style={{ fontSize: 11, color: "#475569", letterSpacing: 1 }}>
          <span style={{ color: "#10b981" }}>●</span> LIVE SIM · {new Date().toLocaleDateString("en-IN")}
        </div>
      </div>

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "28px 24px" }}>

        {/* DASHBOARD */}
        {view === "dashboard" && (
          <div style={{ opacity: animated ? 1 : 0, transform: animated ? "none" : "translateY(20px)", transition: "all 0.6s ease" }}>
            {/* Stat cards */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 28 }}>
              {[
                { label: "UNIVERSE", value: "250", sub: "Nifty LargeMidcap stocks", icon: "🏛️", color: "#6366f1" },
                { label: "TOP PICKS", value: "20", sub: "Momentum leaders", icon: "⚡", color: "#10b981" },
                { label: "AVG RSI", value: (TOP20.reduce((a,s)=>a+s.rsi,0)/20).toFixed(1), sub: "Portfolio average", icon: "📊", color: "#f59e0b" },
                { label: "AVG 3M ROC", value: fmtPct(TOP20.reduce((a,s)=>a+s.roc3m,0)/20), sub: "Return on capital", icon: "🚀", color: "#ec4899" },
              ].map((c, i) => (
                <div key={i} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 12, padding: "20px", position: "relative", overflow: "hidden", transition: "all 0.3s", cursor: "default" }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = c.color + "66"}
                  onMouseLeave={e => e.currentTarget.style.borderColor = "rgba(255,255,255,0.07)"}>
                  <div style={{ position: "absolute", top: 12, right: 14, fontSize: 22, opacity: 0.3 }}>{c.icon}</div>
                  <div style={{ fontSize: 10, color: "#64748b", letterSpacing: 2, marginBottom: 10 }}>{c.label}</div>
                  <div style={{ fontSize: 28, fontWeight: 700, color: c.color, marginBottom: 4 }}>{c.value}</div>
                  <div style={{ fontSize: 11, color: "#475569" }}>{c.sub}</div>
                </div>
              ))}
            </div>

            {/* Top 10 momentum leaders */}
            <div style={{ marginBottom: 28 }}>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 3, marginBottom: 14 }}>TOP 10 MOMENTUM LEADERS</div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 12 }}>
                {TOP20.slice(0,10).map((s, i) => (
                  <div key={s.symbol} onClick={() => { setSelected(s); setView("screener"); }}
                    style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 10, padding: "14px 18px", cursor: "pointer", transition: "all 0.2s", display: "flex", alignItems: "center", gap: 14 }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(16,185,129,0.06)"; e.currentTarget.style.borderColor = "rgba(16,185,129,0.3)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.025)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}>
                    <div style={{ fontSize: 11, color: "#10b981", fontWeight: 700, minWidth: 24 }}>#{i+1}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                        <span style={{ fontWeight: 700, fontSize: 13, color: "#f1f5f9" }}>{s.symbol}</span>
                        <span style={{ fontSize: 10, color: "#64748b", background: "rgba(255,255,255,0.05)", padding: "2px 8px", borderRadius: 4 }}>{s.sector}</span>
                      </div>
                      {scoreBar(s.composite)}
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 12, color: rocColor(s.roc3m), fontWeight: 700 }}>{fmtPct(s.roc3m)}</div>
                      <div style={{ fontSize: 10, color: "#475569" }}>3M ROC</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Sector heatmap */}
            <div>
              <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 3, marginBottom: 14 }}>SECTOR MOMENTUM HEATMAP</div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
                {SECTORS.map(sector => {
                  const sectorStocks = ALL_STOCKS.filter(s => s.sector === sector);
                  const avgScore = sectorStocks.reduce((a,s) => a+s.composite,0) / sectorStocks.length;
                  const avgRoc = sectorStocks.reduce((a,s) => a+s.roc3m,0) / sectorStocks.length;
                  const intensity = Math.max(0, Math.min(1, avgScore / 80));
                  return (
                    <div key={sector} style={{
                      padding: "12px 16px", borderRadius: 8, cursor: "pointer",
                      background: `rgba(16,185,129,${intensity * 0.3})`,
                      border: `1px solid rgba(16,185,129,${intensity * 0.5 + 0.1})`,
                      transition: "all 0.2s", minWidth: 120, textAlign: "center"
                    }}
                      onClick={() => { setFilterSector(sector); setView("screener"); }}
                      onMouseEnter={e => e.currentTarget.style.transform = "scale(1.04)"}
                      onMouseLeave={e => e.currentTarget.style.transform = "scale(1)"}>
                      <div style={{ fontSize: 11, color: "#cbd5e1", marginBottom: 4 }}>{sector}</div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: rocColor(avgRoc) }}>{fmtPct(avgRoc)}</div>
                      <div style={{ fontSize: 9, color: "#64748b" }}>{sectorStocks.length} stocks</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* SCREENER */}
        {view === "screener" && (
          <div style={{ opacity: animated ? 1 : 0, transition: "opacity 0.4s" }}>
            {selected ? (
              // Detail view
              <div>
                <button onClick={() => setSelected(null)} style={{ background: "none", border: "1px solid rgba(255,255,255,0.1)", color: "#94a3b8", padding: "6px 14px", borderRadius: 6, cursor: "pointer", fontFamily: "inherit", fontSize: 11, letterSpacing: 1, marginBottom: 20 }}>← BACK TO SCREENER</button>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                      <div>
                        <div style={{ fontSize: 24, fontWeight: 700, color: "#f1f5f9", marginBottom: 4 }}>{selected.symbol}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>{selected.sector} · Rank #{selected.rank}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 22, fontWeight: 700, color: "#10b981" }}>₹{fmt(selected.currentPrice.toFixed(2))}</div>
                        <div style={{ fontSize: 11, color: "#64748b" }}>Mkt Cap: {fmtCr(selected.mktCap)}</div>
                      </div>
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                      {[
                        { label: "Momentum Score", value: selected.composite.toFixed(1) + "/100", color: "#10b981" },
                        { label: "RSI (14)", value: selected.rsi, color: rsiColor(selected.rsi) },
                        { label: "52W High", value: "₹" + fmt(selected.weekHigh.toFixed(0)), color: "#94a3b8" },
                        { label: "52W Low", value: "₹" + fmt(selected.weekLow.toFixed(0)), color: "#94a3b8" },
                        { label: "% from 52W High", value: fmtPct(selected.pct52wHigh), color: selected.pct52wHigh > -10 ? "#22c55e" : "#ef4444" },
                        { label: "MA Signal", value: selected.maSignal ? "BULLISH ↑" : "BEARISH ↓", color: selected.maSignal ? "#22c55e" : "#ef4444" },
                      ].map(item => (
                        <div key={item.label} style={{ background: "rgba(255,255,255,0.03)", borderRadius: 8, padding: "12px 14px" }}>
                          <div style={{ fontSize: 10, color: "#64748b", marginBottom: 6 }}>{item.label}</div>
                          <div style={{ fontSize: 16, fontWeight: 700, color: item.color }}>{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 24 }}>
                    <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 16 }}>RETURN ON CAPITAL</div>
                    {[
                      { label: "1 Month ROC", value: selected.roc1m },
                      { label: "3 Month ROC", value: selected.roc3m },
                      { label: "6 Month ROC", value: selected.roc6m },
                    ].map(r => (
                      <div key={r.label} style={{ marginBottom: 16 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                          <span style={{ fontSize: 12, color: "#94a3b8" }}>{r.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: rocColor(r.value) }}>{fmtPct(r.value)}</span>
                        </div>
                        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                          <div style={{ width: Math.min(100, Math.max(0, 50 + r.value)) + "%", height: "100%", background: rocColor(r.value), borderRadius: 4, transition: "width 0.8s ease" }} />
                        </div>
                      </div>
                    ))}
                    <div style={{ marginTop: 24, fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 12 }}>MOVING AVERAGES</div>
                    {[
                      { label: "SMA 50", value: "₹" + selected.sma50.toFixed(1) },
                      { label: "SMA 200", value: "₹" + selected.sma200.toFixed(1) },
                      { label: "50/200 Cross", value: selected.maSignal ? "Golden Cross ✓" : "Death Cross ✗" },
                    ].map(m => (
                      <div key={m.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                        <span style={{ fontSize: 12, color: "#64748b" }}>{m.label}</span>
                        <span style={{ fontSize: 12, color: "#e2e8f0" }}>{m.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              // List view
              <div>
                {/* Filters */}
                <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
                  <select value={filterSector} onChange={e => setFilterSector(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", padding: "8px 12px", borderRadius: 8, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                    <option value="All">All Sectors</option>
                    {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={sortBy} onChange={e => setSortBy(e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", padding: "8px 12px", borderRadius: 8, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                    <option value="composite">Sort: Momentum Score</option>
                    <option value="rsi">Sort: RSI</option>
                    <option value="roc3m">Sort: 3M ROC</option>
                    <option value="pct52w">Sort: % from 52W High</option>
                  </select>
                  <select value={topN} onChange={e => setTopN(+e.target.value)}
                    style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "#e2e8f0", padding: "8px 12px", borderRadius: 8, fontFamily: "inherit", fontSize: 12, cursor: "pointer" }}>
                    {[20,50,100,250].map(n => <option key={n} value={n}>Show Top {n}</option>)}
                  </select>
                  <span style={{ fontSize: 11, color: "#475569", marginLeft: "auto" }}>{displayed.length} stocks shown</span>
                </div>

                {/* Table header */}
                <div style={{ display: "grid", gridTemplateColumns: "40px 1fr 90px 80px 80px 80px 80px 120px 60px", gap: 8, padding: "10px 14px", borderBottom: "1px solid rgba(255,255,255,0.08)", fontSize: 9, color: "#475569", letterSpacing: 2 }}>
                  <span>#</span><span>STOCK</span><span>PRICE</span><span>RSI</span><span>1M ROC</span><span>3M ROC</span><span>52W HIGH</span><span>MOMENTUM</span><span>MA</span>
                </div>

                {/* Rows */}
                <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                  {displayed.map((s, i) => (
                    <div key={s.symbol} onClick={() => setSelected(s)}
                      style={{ display: "grid", gridTemplateColumns: "40px 1fr 90px 80px 80px 80px 80px 120px 60px", gap: 8, padding: "12px 14px", borderBottom: "1px solid rgba(255,255,255,0.04)", cursor: "pointer", transition: "background 0.15s", alignItems: "center" }}
                      onMouseEnter={e => e.currentTarget.style.background = "rgba(16,185,129,0.05)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                      <span style={{ fontSize: 11, color: i < 3 ? "#10b981" : "#475569" }}>{i+1}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#f1f5f9" }}>{s.symbol}</div>
                        <div style={{ fontSize: 9, color: "#475569" }}>{s.sector}</div>
                      </div>
                      <span style={{ fontSize: 12, color: "#e2e8f0" }}>₹{s.currentPrice.toFixed(0)}</span>
                      <span style={{ fontSize: 12, color: rsiColor(s.rsi), fontWeight: 600 }}>{s.rsi}</span>
                      <span style={{ fontSize: 12, color: rocColor(s.roc1m) }}>{fmtPct(s.roc1m)}</span>
                      <span style={{ fontSize: 12, color: rocColor(s.roc3m), fontWeight: 600 }}>{fmtPct(s.roc3m)}</span>
                      <span style={{ fontSize: 12, color: s.pct52wHigh > -10 ? "#22c55e" : "#94a3b8" }}>{fmtPct(s.pct52wHigh)}</span>
                      <div>{scoreBar(s.composite)}</div>
                      <span style={{ fontSize: 10, color: s.maSignal ? "#22c55e" : "#ef4444", fontWeight: 700 }}>{s.maSignal ? "BULL" : "BEAR"}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* PORTFOLIO */}
        {view === "portfolio" && (
          <div style={{ opacity: animated ? 1 : 0, transition: "opacity 0.4s" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 340px", gap: 24 }}>
              <div>
                <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 3, marginBottom: 16 }}>SUGGESTED PORTFOLIO · TOP 20 MOMENTUM STOCKS</div>
                <div style={{ background: "rgba(16,185,129,0.06)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 16, fontSize: 11, color: "#86efac" }}>
                  ⚡ Equal-weight allocation · {equalWeight}% per stock · Rebalance: Monthly
                </div>
                {TOP20.map((s, i) => {
                  const barW = Math.min(100, Math.max(10, s.composite));
                  return (
                    <div key={s.symbol} style={{ display: "flex", alignItems: "center", gap: 14, padding: "12px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <div style={{ fontSize: 11, color: "#10b981", minWidth: 24, fontWeight: 700 }}>{i+1}</div>
                      <div style={{ minWidth: 110 }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#f1f5f9" }}>{s.symbol}</div>
                        <div style={{ fontSize: 10, color: "#475569" }}>{s.sector}</div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ background: "rgba(255,255,255,0.06)", borderRadius: 4, height: 8, overflow: "hidden" }}>
                          <div style={{ width: barW + "%", height: "100%", background: "linear-gradient(90deg, #10b981, #6366f1)", borderRadius: 4, transition: "width 1s ease" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 20, fontSize: 11 }}>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#64748b" }}>RSI</div>
                          <div style={{ color: rsiColor(s.rsi), fontWeight: 700 }}>{s.rsi}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#64748b" }}>3M ROC</div>
                          <div style={{ color: rocColor(s.roc3m), fontWeight: 700 }}>{fmtPct(s.roc3m)}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ color: "#64748b" }}>WEIGHT</div>
                          <div style={{ color: "#e2e8f0", fontWeight: 700 }}>{equalWeight}%</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Sidebar */}
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 16 }}>PORTFOLIO STATS</div>
                  {[
                    { label: "Avg Momentum Score", value: (TOP20.reduce((a,s)=>a+s.composite,0)/20).toFixed(1) + "/100", color: "#10b981" },
                    { label: "Avg RSI", value: (TOP20.reduce((a,s)=>a+s.rsi,0)/20).toFixed(1), color: "#f59e0b" },
                    { label: "Avg 1M ROC", value: fmtPct(TOP20.reduce((a,s)=>a+s.roc1m,0)/20), color: "#22c55e" },
                    { label: "Avg 3M ROC", value: fmtPct(TOP20.reduce((a,s)=>a+s.roc3m,0)/20), color: "#22c55e" },
                    { label: "Avg 6M ROC", value: fmtPct(TOP20.reduce((a,s)=>a+s.roc6m,0)/20), color: "#22c55e" },
                    { label: "Bullish MA Signals", value: TOP20.filter(s=>s.maSignal).length + " / 20", color: "#6366f1" },
                  ].map(item => (
                    <div key={item.label} style={{ display: "flex", justifyContent: "space-between", padding: "9px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                      <span style={{ fontSize: 11, color: "#64748b" }}>{item.label}</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: item.color }}>{item.value}</span>
                    </div>
                  ))}
                </div>

                <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20 }}>
                  <div style={{ fontSize: 11, color: "#64748b", letterSpacing: 2, marginBottom: 14 }}>STRATEGY RULES</div>
                  {[
                    "RSI between 50–75 (strong momentum)",
                    "Price within 20% of 52W high",
                    "50-DMA > 200-DMA (golden cross)",
                    "Positive 3M Rate of Change",
                    "Equal weight · 5% per stock",
                    "Monthly rebalancing",
                    "Exit: RSI drops below 40",
                  ].map((r, i) => (
                    <div key={i} style={{ display: "flex", gap: 10, fontSize: 11, color: "#94a3b8", marginBottom: 9, alignItems: "flex-start" }}>
                      <span style={{ color: "#10b981", marginTop: 1 }}>▸</span>{r}
                    </div>
                  ))}
                </div>

                <div style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", borderRadius: 10, padding: 14, fontSize: 10, color: "#818cf8", lineHeight: 1.6 }}>
                  ⚠️ This is a simulation using synthetic data for illustrative purposes only. Not financial advice. Always conduct due diligence before investing.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
