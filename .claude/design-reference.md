---
name: Design Reference
description: UI/UX design assets and trading strategy visual blueprints for TradingTool-3
type: reference
---

# Design Reference — TradingTool-3

All design assets live in `/designs/` at the project root. These are the source-of-truth visual and strategic blueprints for the frontend.

## Design Assets

### 1. **alpha10.jsx** — Alpha-10 Strategy Dashboard
**Purpose:** Core strategy component showcasing the Alpha-10 momentum trade dashboard
**Key Features:**
- Stock universe screening (Nifty 500 sample)
- Real-time momentum calculation
- Trade entry/exit signals
- Risk:reward visualization

**Frontend Implementation Notes:**
- Use as reference for component layout and data structure
- Integrate with `lightweight-charts` for historical price display
- Build momentum calculation logic into backend API
- Implement trade signal triggers on frontend

---

### 2. **momentum-screener.jsx** — Momentum Screener Interface
**Purpose:** Stock screening tool for identifying momentum breakouts
**Key Features:**
- Universe filtering (customizable)
- Momentum rank/score display
- Sortable results table
- Price action visualization

**Frontend Implementation Notes:**
- Create Ant Design table component for stock results
- Fetch screener data from backend `/api/screener` endpoint
- Add column filters and sorting (by momentum, price, volatility)
- Link rows to individual stock details page

---

### 3. **weekend-investing.jsx** — Weekend Investing Plan
**Purpose:** Weekend batch trading strategy with pre-planned trade universe
**Key Features:**
- Pre-screened stock universe (Nifty LargeMidcap 250)
- Batch trade setup and rules
- Position sizing calculator
- Trade journal template

**Frontend Implementation Notes:**
- Implement as a batch trade planner component
- Allow users to upload/manage watchlists
- Calculate position sizes based on risk parameters
- Export trade plans as JSON/CSV

---

### 4. **netweb-trading-plan.html** — Netweb Technologies Swing Plan
**Purpose:** Detailed tactical plan for Netweb (NSE: NETWEB) cyclical swing setup
**Design System Reference:**
- **Color Scheme:**
  - Primary Accent: `#00ff9d` (Green) — entry/bullish signals
  - Secondary Accent: `#4fa3ff` (Blue) — neutral/hold signals
  - Warning: `#ffb830` (Amber) — targets/caution
  - Danger: `#ff3d5a` (Red) — stops/bearish signals
  - Background: `#0a0c10` (Dark navy)

- **Typography:**
  - Headlines: Syne (800 weight, tight letter-spacing)
  - Monospace: Space Mono (code/labels/metrics)

- **Layout Pattern:**
  - Card-based sections with border-left accents
  - Step numbering (01, 02, etc.)
  - Price level diagrams with connector lines
  - Checklist patterns

**HTML Structure Features to Adopt:**
- Cycle timeline bar showing entry/hold/exit phases
- 6-step action card grid (scan → entry → TP → SL → size → exit)
- Price levels map with relative percentages
- Risk:reward math cards
- Non-negotiable rules panel with icons
- Pre-trade checklist (✓ format)

---

### 5. **netweb-improved-plan.html** — Netweb Plan (Improved Version)
**Purpose:** Enhanced version of the Netweb swing plan with refinements
**Key Improvements:**
- Cleaner visual hierarchy
- Expanded rule descriptions
- Better mobile responsiveness
- Integrated performance metrics

**Frontend Implementation Notes:**
- Use this as the final design template for trade plan pages
- Adapt color scheme to match trading strategy type (Alpha-10, Momentum, Swing)
- Create reusable Ant Design component library based on this structure

---

## Design System Guidelines

### Color Palette
```
Primary Colors:
  --accent-green: #00ff9d    (Entry, Bullish, Positive)
  --accent-red: #ff3d5a      (Stop-Loss, Risk, Negative)
  --accent-amber: #ffb830    (Targets, Caution, Neutral)
  --accent-blue: #4fa3ff     (Hold, Info, Neutral)

Background:
  --bg: #0a0c10              (Main background)
  --surface: #111318         (Card surfaces)
  --border: #1e2230          (Borders)

Text:
  --text-primary: #eef0f5    (Main text)
  --text-muted: #6b7280      (Secondary text)
  --text-dim: #3a3f4f        (Dimmed/disabled)
```

### Component Patterns

#### Price Level Diagram
- Vertical connector lines with colored dots
- Labels, descriptions, and percentage badges
- Used for: entry levels, targets, stop-losses, resistance zones

#### Action Cards Grid
- 2-column grid (1-column on mobile)
- Colored top border (corresponds to card type)
- Icon + heading + description + tag
- Step number in bottom-right (large, low opacity)

#### Cycle Timeline Bar
- Horizontal segmented bar
- Color-coded phases (entry/hold/exit)
- Day labels and brief descriptions

#### Rules Block
- Icon + title + description format
- Hover highlight on rows
- Consistent spacing and typography

### Spacing & Sizing
- Card padding: 22–32px
- Gap between sections: 40–50px
- Border radius: 6–8px (no sharp corners)
- Animation: 0.7s ease with staggered delays

---

## Implementation Checklist

- [ ] Extract Ant Design component library from HTML designs
- [ ] Set up CSS color variables in frontend
- [ ] Create reusable Card, PriceLevel, and Timeline components
- [ ] Implement responsive grid layouts (mobile-first)
- [ ] Add animations (fadeIn, slideUp) using CSS or Framer Motion
- [ ] Test typography scaling on all breakpoints
- [ ] Create Storybook docs for each component
- [ ] Document icon usage (emoji vs. SVG decision)

---

## File Locations

```
designs/
├── alpha10.jsx                    (Strategy component)
├── momentum-screener.jsx          (Screening interface)
├── weekend-investing.jsx          (Batch planner)
├── netweb-trading-plan.html       (Full plan reference)
└── netweb-improved-plan.html      (Improved template)
```

To view the HTML designs in a browser, open them directly in your browser or spin up a simple HTTP server:
```bash
cd designs/
python3 -m http.server 8000
# Visit http://localhost:8000/netweb-trading-plan.html
```

---

## References
- See `docs/watchlist-api.md` for backend schema used by these UIs
- See `docs/kotlin-migration-plan.md` for API contract these designs depend on
