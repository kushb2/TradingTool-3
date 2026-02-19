# TradingTool-3

Kotlin migration bootstrap for the TradingTool backend.

## Module layout

- `cron-job`: scheduled/background jobs (empty scaffold)
- `core`: core business logic and shared domain (empty scaffold)
- `service`: API/service layer (active module with current Ktor app)
- `event-service`: event-driven processing module (empty scaffold)

## Stack

- Kotlin 2.3.10
- JDK 21
- Maven
- Ktor 3.4.0

## Run locally

```bash
mvn clean test
mvn -pl service -am exec:java -Dexec.mainClass=com.tradingtool.ApplicationKt
```

Server settings are in:

- `service/src/main/resources/serverConfig.yml`
- Environment variables override YAML values when both are present.

Health checks:

```bash
curl http://localhost:8080/
curl http://localhost:8080/health
curl http://localhost:8080/health/config
```

## Kotlin migration docs

- `docs/kotlin-migration-plan.md`
- `docs/kotlin-dependencies.md`
- `docs/intellij-maven-kotlin-setup.md`

## Migrated keys

The full migrated key set is documented in:

- `.env.example`

Current key groups:

- Telegram: `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`, `TELEGRAM_WEBHOOK_SECRET`, `TELEGRAM_DOWNLOAD_DIR`, timeout/retry keys
- Supabase: `SUPABASE_URL`, `SUPABASE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_PUBLISHABLE_KEY`
- Deployment: `RENDER_EXTERNAL_URL`, `GITHUB_PAGES_URL`, `CORS_ALLOWED_ORIGINS`

Set these as real environment variables in your shell/CI/Render runtime.
