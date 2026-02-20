# Frontend Dashboard

Single-page trading dashboard built with React + Ant Design (dark theme).

## Layout

```
┌─────────────┬──────────────────────────────────────────┐
│  Watchlist  │        Stock Data Grid                   │
│  Sidebar    │                                          │
│  (200px)    │  Symbol │ Price │ RSI │ 15D │ 100D ...  │
│             │  RELIANCE│ 1234 │ 45  │ 38  │ 32  ...  │
│  + button   │                                          │
│  ○ Nifty50  │                                  [💬]   │
│  ● My List  │                                          │
└─────────────┴──────────────────────────────────────────┘
```

- **Left**: Fixed 200px sidebar — watchlist list
- **Center**: Full-height stock data grid
- **Bottom-right**: Floating Telegram chat widget (FAB)

---

## Files

| File | Purpose |
|------|---------|
| `src/App.tsx` | Root layout, ConfigProvider dark theme, state wiring |
| `src/types.ts` | Shared TypeScript types: `Watchlist`, `Stock`, `WatchlistStock` |
| `src/utils/api.ts` | Typed fetch helpers: `getJson`, `postJson`, `patchJson`, `deleteJson` |
| `src/hooks/useWatchlists.ts` | Fetch/create/rename/delete watchlists from backend |
| `src/hooks/useWatchlistStocks.ts` | Fetch stocks for selected watchlist, join with all stocks |
| `src/components/WatchlistSidebar.tsx` | Sidebar with create/rename/delete watchlist actions |
| `src/components/StockDataGrid.tsx` | Main 13-column data table |
| `src/components/TelegramChatWidget.tsx` | Floating chat FAB wired to `POST /api/telegram/send/text` |

---

## API Calls

| Hook | Endpoint | Method |
|------|----------|--------|
| `useWatchlists` | `/api/watchlist/lists?limit=200` | GET |
| `useWatchlists` | `/api/watchlist/lists` | POST |
| `useWatchlists` | `/api/watchlist/lists/{id}` | PATCH |
| `useWatchlists` | `/api/watchlist/lists/{id}` | DELETE |
| `useWatchlistStocks` | `/api/watchlist/lists/{id}/items` | GET |
| `useWatchlistStocks` | `/api/watchlist/stocks?limit=500` | GET |
| `TelegramChatWidget` | `/api/telegram/send/text` | POST |

---

## Components

### WatchlistSidebar

- Lists all watchlists fetched from the backend
- Hover over an item to reveal **Edit** (pencil) and **Delete** (trash) icon buttons
- Active watchlist has a teal left-border accent
- `+` button in header opens a modal to create a new watchlist

### StockDataGrid

13 columns, all sortable:

| Column | Source |
|--------|--------|
| Symbol | Backend |
| Price | Mocked (deterministic by symbol) |
| Prev Close | Mocked |
| RSI | Mocked |
| 15D Min RSI | Mocked |
| 100D Min RSI | Mocked |
| 200D Min RSI | Mocked |
| R1 / R2 / R3 | Mocked |
| Mean Rev Baseline | Mocked |
| Drawdown | Mocked |
| Max Drawdown | Mocked |

**Conditional formatting:**
- RSI cell turns green with subtle background when it approaches any of the Min RSI levels
- Drawdown cells use red gradient backgrounds based on severity (>5%, >10%, >20%)

> Mocked columns use a deterministic hash of the stock symbol — same symbol always shows the same value across renders. To wire real data, update `toStockRow()` in `useWatchlistStocks.ts`.

### TelegramChatWidget

- Fixed position bottom-right (z-index 1000)
- Click FAB to open a 340×400 chat window
- Messages are colour-coded: blue (you), teal (bot response), red (error)
- Calls `POST /api/telegram/send/text` with `{ text: string }` body

---

## Theme

Dark mode via Ant Design `ConfigProvider`:

```tsx
<ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
```

Color palette used throughout:

| Token | Value | Use |
|-------|-------|-----|
| `bg` | `#0a0a0a` | Page background |
| `panel` | `#141414` | Component background |
| `border` | `#1f1f1f` | Borders |
| `up` | `#26a69a` | Gains, RSI near min |
| `down` | `#ef5350` | Losses, drawdown |
| `text` | `#ccc` | Body text |
| `label` | `#888` | Muted labels |

All numerical data uses `Roboto Mono` / `JetBrains Mono` for decimal alignment.
