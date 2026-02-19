# SupabaseSkill

## Metadata
* **Scope:** Infrastructure Layer (Database Access)
* **Target Stack:** Supabase (PostgreSQL) + JDBI3 + Dropwizard

## Purpose
Standardize database access using JDBI3 with Supabase-hosted PostgreSQL. Keep all SQL in DAO interfaces, return typed Kotlin data classes.

## Setup

### Environment Variables
```
DATABASE_URL=jdbc:postgresql://<host>:<port>/<db>?user=<user>&password=<pass>
```

### Dropwizard Config (`config.yml`)
```yaml
database:
  driverClass: org.postgresql.Driver
  url: ${DATABASE_URL}
  validationQuery: "SELECT 1"
```

## Core Rules

### 1. JDBI3 Declarative DAOs
Use interface-based DAOs with annotations — no raw JDBC.

```kotlin
interface WatchlistDao {
    @SqlQuery("SELECT * FROM watchlists WHERE id = :id")
    fun findById(@Bind("id") id: Long): Watchlist?

    @SqlUpdate("INSERT INTO watchlists (name) VALUES (:name)")
    @GetGeneratedKeys
    fun insert(@Bind("name") name: String): Long
}
```

### 2. Kotlin Data Classes for Mapping
Use `@ColumnName` for snake_case columns:

```kotlin
data class Watchlist(
    val id: Long,
    val name: String,
    @ColumnName("created_at") val createdAt: Instant,
    @ColumnName("updated_at") val updatedAt: Instant
)
```

### 3. Register Kotlin Mappers
In your Dropwizard Application:

```kotlin
jdbi.installPlugin(KotlinPlugin())
jdbi.installPlugin(KotlinSqlObjectPlugin())
```

### 4. Migrations
- Store SQL migrations in `db/migrations/`
- Name format: `001_create_watchlists.sql`, `002_add_stocks.sql`
- Run manually or via Flyway

## Database Conventions
- Table names: `snake_case`, plural (`watchlists`, `stocks`)
- Column names: `snake_case`
- Always include `created_at TIMESTAMPTZ DEFAULT NOW()`
- Always include `updated_at TIMESTAMPTZ DEFAULT NOW()`
- Use `BIGSERIAL` for primary keys

## Anti-Patterns
- No raw `connection.prepareStatement()` — use JDBI3
- No returning `Map<String, Any>` — always return data classes
- No SQL strings in service layer — keep in DAO
