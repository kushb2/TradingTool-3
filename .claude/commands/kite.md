# /kite — Kite Connect Development Skill

Use this skill for any task involving Kite Connect integration in TradingTool-3.

## What this skill covers

- Adding new Kite Connect API calls
- Writing KiteTicker (WebSocket) streaming code
- Backtesting: fetching historical data + feeding ta4j
- Instrument lookup and caching
- Auth/token refresh logic
- Order placement, portfolio reads, GTT orders
- Error handling for KiteException types

## Before writing any code, always read

1. `docs/kite-connect-api.md` — full API reference, rate limits, module placement decisions
2. `docs/kotlin-migration-plan.md` — understand which phase the work belongs to
3. The target file(s) in the relevant module (read before editing)

## Module placement rules (enforced)

| What you are writing | Where it goes |
|---|---|
| `KiteConnect` client wrapper, auth logic | `core/src/main/kotlin/com/tradingtool/kite/` |
| `InstrumentCache` | `core/src/main/kotlin/com/tradingtool/kite/` |
| Historical data fetch, ta4j bridge | `core/src/main/kotlin/com/tradingtool/kite/` |
| `KiteTicker` WebSocket streaming | `event-service/src/main/kotlin/com/tradingtool/event/` |
| Daily token refresh cron | `cron-job/src/main/kotlin/com/tradingtool/cron/` |
| REST endpoints that expose Kite data | `resources/src/main/kotlin/com/tradingtool/resources/` |
| Request/response models | `Models/src/main/kotlin/com/tradingtool/models/` |

## Coding rules (project-wide — always apply)

- Max 200 lines per class, max 50 lines per function
- No `AbstractFactoryStrategyBuilder` patterns — keep it simple
- Wrap all blocking Kite SDK calls in `withContext(Dispatchers.IO)` when called from coroutine context
- Always use `Constants.*` instead of raw strings for exchange, product, order type, variety
- Always handle `KiteException` — check `e.code` and branch on 403 vs 429 vs 4xx vs 5xx
- Register `SessionExpiryHook` on the `KiteConnect` instance so 403s auto-trigger re-login

## Rate limit rules (always enforce)

- Historical data: max 3 req/s → add `Thread.sleep(350)` between calls in loops
- Market quotes: max 1 req/s
- Fetch instruments list only once at startup + once daily via cron, never per-request

## Common tasks this skill handles

### Add a new Kite API call to the service layer

1. Read `docs/kite-connect-api.md` section for that API.
2. Add the method to the appropriate wrapper class in `core/`.
3. Wrap in `withContext(Dispatchers.IO)`.
4. Add a Dropwizard resource method in `resources/` that calls the service.
5. Write a unit test for the service layer.

### Fetch historical data for backtesting

1. Look up `instrument_token` from `InstrumentCache` using exchange + symbol.
2. Determine the interval and calculate how many chunks are needed (see rate limit table in `docs/kite-connect-api.md`).
3. Use the `chunkedHistorical()` pattern from the doc to handle chunking + throttling.
4. Convert candles to ta4j `BarSeries` using `candlesToBarSeries()`.
5. Run your ta4j strategy on the `BarSeries`.

### Add a new WebSocket subscription

1. All ticker code lives in `event-service`.
2. Read current `KiteTicker` setup in `event-service/`.
3. Add the new `instrument_token` to the subscription list.
4. Choose the right mode (`modeLTP`, `modeQuote`, `modeFull`) — use the cheapest mode that meets your needs.

### Handle a new Kite error type

1. Catch `KiteException`.
2. Branch on `e.code`: 403 → re-login, 429 → backoff+retry, 400 → log + surface to caller, 5xx → retry with backoff.
3. Do not swallow exceptions — always log or rethrow.

## Dependencies

Ensure these exist in `core/pom.xml` before writing Kite code:

```xml
<dependency>
    <groupId>com.zerodhatech.kiteconnect</groupId>
    <artifactId>kiteconnect</artifactId>
    <version>3.5.1</version>
</dependency>
<dependency>
    <groupId>org.ta4j</groupId>
    <artifactId>ta4j-core</artifactId>
    <version>0.17</version>
</dependency>
```

## Environment variables required

```
KITE_API_KEY=
KITE_API_SECRET=
KITE_USER_ID=
KITE_REDIRECT_URL=
```

## Key gotchas (do not forget)

- Access token expires at 6 AM IST every day — `cron-job` must handle this
- WebSocket tick prices are in **paise** (divide by 100) — REST API prices are already in INR
- `instrument_token` (Long) is needed for historical data and WebSocket — NOT `tradingsymbol`
- Bracket orders are discontinued — never use `VARIETY_BO`
- No sandbox/paper trading mode exists — all calls hit live markets