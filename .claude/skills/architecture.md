# ArchitectureSkill

## Goal
Define a simple, maintainable architecture for a single-user Kotlin trading tool using Dropwizard.

## Architecture Rules
1. Dependencies point inward: `resources -> services -> dao`.
2. `dao` owns database access (JDBI3), no business logic.
3. `services` own business logic and validation.
4. `resources` own HTTP concerns (request/response, status codes).
5. All functions use explicit types — avoid `Any`.

## Project Structure
```text
backend/
├── src/main/kotlin/com/tradingtool/
│   ├── TradingToolApplication.kt    # Dropwizard entry point
│   ├── TradingToolConfiguration.kt  # YAML config binding
│   ├── resources/                   # JAX-RS REST endpoints
│   │   ├── WatchlistResource.kt
│   │   └── TelegramResource.kt
│   ├── services/                    # Business logic
│   │   └── WatchlistService.kt
│   ├── dao/                         # JDBI3 data access
│   │   └── WatchlistDao.kt
│   └── models/                      # Data classes
│       ├── Watchlist.kt
│       └── Stock.kt
├── src/main/resources/
│   └── config.yml                   # Dropwizard config
└── pom.xml
```

## Layer Responsibilities

### `resources/` (Presentation)
- JAX-RS annotated classes (`@Path`, `@GET`, `@POST`)
- Parse request, call service, return response
- Handle HTTP status codes and error responses
- No business logic here

### `services/` (Application)
- Business logic and validation
- Orchestrate DAO calls
- Throw domain exceptions (caught by ExceptionMappers)

### `dao/` (Data Access)
- JDBI3 interfaces with `@SqlQuery`, `@SqlUpdate`
- Row mappers for converting DB rows to models
- No business logic — just CRUD

### `models/` (Domain)
- Kotlin data classes
- Request/response DTOs
- Database entity mappings

## Coding Conventions
- Use `data class` for models
- Prefer constructor injection for dependencies
- Keep resources thin — delegate to services
- Use JDBI3 declarative interfaces, not raw SQL strings in code
