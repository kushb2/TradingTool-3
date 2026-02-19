# Kotlin Dependency Standard (TradingTool-3)

Date: 2026-02-19  
Purpose: single source of truth for Kotlin/JVM dependencies used in migration.

## 1) Dependency Principles

- Keep runtime dependency count low.
- Prefer Kotlin-first libraries with coroutine support.
- One clear library per concern (no overlapping frameworks).
- Pin versions centrally.
- Avoid speculative dependencies (YAGNI).

## 2) Selected Stack (Pinned Baseline)

These versions are pinned as migration baseline as of 2026-02-19.

| Area | Dependency | Version | Why |
| --- | --- | --- | --- |
| Language | Kotlin | `2.3.10` | Latest stable Kotlin release line |
| Runtime | JDK | `21` | LTS baseline and ta4j requirement |
| Web/API | Ktor | `3.4.0` | Coroutines-first server/client |
| JSON | kotlinx.serialization | `1.10.0` | Native Kotlin serialization |
| Supabase | supabase-kt BOM | `3.3.0` | Typed Supabase access from Kotlin |
| Config | Hoplite | `2.9.0` | Typed config binding |
| Logging API | kotlin-logging-jvm | `8.0.01` | Idiomatic structured logging wrapper |
| Logging backend | logback-classic | `1.5.32` | Stable JVM logging backend |
| TA/Backtesting | ta4j-core | `0.22.2` | Indicators + backtest engine |
| CLI | Clikt | `5.1.0` | Kotlin CLI replacement for Python CLIs |
| Testing | JUnit | `6.0.3` | Main unit/integration test runner |
| Testing mocks | MockK | `1.14.9` | Kotlin-native mocking |
| Formatting/Lint | ktlint | `1.8.0` | Formatting + lint |
| Static analysis | detekt | `1.23.8` | Architecture/code smell checks |

## 3) Required vs Optional Dependencies

### Required in v1 migration

- Kotlin, JDK 21, Ktor, kotlinx.serialization
- supabase-kt (at least `postgrest-kt`)
- Hoplite
- kotlin-logging + logback
- ta4j-core
- JUnit + MockK
- ktlint + detekt

### Optional (add only when needed)

- `realtime-kt`, `storage-kt`, `auth-kt` (from supabase-kt)
- Caffeine cache
- Testcontainers for specific integration tests
- DataFrame/Multik for research workflows only

## 4) Python -> Kotlin Mapping

| Python dependency | Kotlin replacement |
| --- | --- |
| `fastapi`, `uvicorn` | `io.ktor:ktor-server-*` |
| `supabase` | `io.github.jan-tennert.supabase:*` |
| `python-dotenv` | Hoplite + env vars |
| `pydantic`, `pydantic-settings` | Kotlin data classes + `kotlinx.serialization` + Hoplite |
| `python-telegram-bot` | Ktor HTTP client with typed Telegram Bot API adapter |
| `growwapi` | Ktor HTTP/WebSocket client + custom typed adapter |
| `pandas`, `numpy` | ta4j-first strategy flow |
| `vectorbt`, `pandas-ta` | `org.ta4j:ta4j-core` |
| `mypy` | Kotlin compiler type system |
| `ruff` | ktlint + detekt |

## 5) Baseline Maven Dependency Block

```xml
<dependencies>
  <dependency>
    <groupId>io.ktor</groupId>
    <artifactId>ktor-server-core-jvm</artifactId>
  </dependency>
  <dependency>
    <groupId>io.ktor</groupId>
    <artifactId>ktor-server-netty-jvm</artifactId>
  </dependency>
  <dependency>
    <groupId>io.ktor</groupId>
    <artifactId>ktor-server-content-negotiation-jvm</artifactId>
  </dependency>
  <dependency>
    <groupId>io.ktor</groupId>
    <artifactId>ktor-serialization-kotlinx-json-jvm</artifactId>
  </dependency>
</dependencies>
```

## 6) Dependency Rules for This Repo

- Do not add Spring Boot for the migration baseline.
- Do not add ORM frameworks unless PostgREST approach is proven insufficient.
- Use Ktor client everywhere (no parallel OkHttp/Retrofit stack).
- Keep Telegram integration as a thin internal adapter over HTTP API.
- Add research-only libs under dedicated modules, not core runtime.
