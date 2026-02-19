# ArchitectureSkill

## Goal
Define a simple, maintainable architecture for a single-user Python trading tool.

## Architecture Rules
1. Dependencies point inward: `presentation -> application -> domain`.
2. `domain` stays pure Python (no DB, HTTP, framework imports).
3. `application` defines ports (`Protocol`) and use cases.
4. `infrastructure` implements ports and owns external integrations.
5. All functions and methods use explicit type hints.

## Current Structure (Phase 1.5: Telegram + Supabase Watchlists)
This is the real structure today. `application` is now used for watchlist use-case validation, while `domain` is still intentionally deferred (YAGNI).

```text
TradingTool-2/
├── src/
│   ├── main.py
│   ├── application/
│   │   └── services/
│   │       └── watchlist_service.py
│   ├── presentation/
│   │   ├── api/
│   │   │   └── telegram_webhook_app.py
│   │   └── cli/
│   │       ├── telegram_cli.py
│   │       ├── telegram_webhook_cli.py
│   │       └── supabase_cli.py
│   └── infrastructure/
│       ├── database/
│       │   ├── models.py
│       │   ├── tables.sql
│       │   └── indexes.sql
│       ├── repositories/
│       │   └── watchlist_dao.py
│       ├── supabase/
│       │   └── client.py
│       └── telegram/
│           ├── client.py
│           ├── config.py
│           ├── models.py
│           └── module.py
├── tests/
├── SKILLS/
│   └── ArchitectureSkill.md
└── pyproject.toml
```

## Layer Responsibilities (Current)
### `src/application`
- Owns use-case orchestration and validation.
- Calls DAO/repository code after normalization.
- No direct framework I/O concerns.

### `src/presentation`
- Owns I/O concerns (CLI args, HTTP request/response handling).
- Delegates business/use-case logic to `application` services.
- Must not hold persistence rules.

### `src/infrastructure`
- Owns external integrations (Telegram + Supabase) and SQL assets.
- Owns DAO query implementations and row mapping.
- Contains integration-specific models/config.
- Keeps external API details out of presentation code.

## Target Structure (Phase 2+)
When trading logic is implemented, introduce `application` and `domain`:

```text
src/
├── presentation/
├── application/
│   ├── ports/
│   └── services/
├── domain/
│   ├── entities/
│   ├── value_objects/
│   └── rules/
└── infrastructure/
```

## Migration Plan
1. Add `domain` models first (`symbol`, `price`, `trade`) with validation.
2. Add `application` use cases and `Protocol` ports.
3. Move trading workflows from presentation into application services.
4. Keep infrastructure as adapter implementations for those ports.
5. Add unit tests for domain/application and integration tests for infrastructure.

## Coding Conventions
- Mandatory type hints for args and returns.
- Avoid `Any`; prefer concrete models or `Protocol`.
- Keep functions short and readable.
- Readability over optimization.
- Add complexity only when currently needed (YAGNI).
