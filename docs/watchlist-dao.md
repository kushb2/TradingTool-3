# Watchlist Service + DAO

This feature is split into clear layers:

- Service layer: validation and use-case rules
- DAO layer: database queries only
- DB models: internal persistence models

## 1) Verify table access

```bash
./scripts/run-poetry.sh run python -m src.presentation.cli.supabase_cli tables
```

Expected: each table reports `"accessible": true`.

## 2) Python usage (recommended)

```python
from src.application.services import WatchlistService
from src.infrastructure.database import (
    CreateStockInput,
    CreateWatchlistInput,
    CreateWatchlistStockInput,
)

service = WatchlistService.from_env()

stock = service.create_stock(
    CreateStockInput(
        nse_symbol="reliance",
        company_name="Reliance Industries",
        tags=["LargeCap", "energy", "energy"],
    )
)

watchlist = service.create_watchlist(
    CreateWatchlistInput(name="swing-watchlist")
)

service.create_watchlist_stock(
    CreateWatchlistStockInput(
        watchlist_id=watchlist.id,
        stock_id=stock.id,
        notes="Breakout candidate",
    )
)
```

## 3) Files

- `src/application/services/watchlist_service.py`
- `src/infrastructure/repositories/watchlist_dao.py`
- `src/infrastructure/database/models.py`

## 4) Notes

- Service normalizes `nse_symbol` to uppercase and validates format.
- Service normalizes tags to lowercase and removes duplicates.
- DAO only executes queries and maps Supabase rows to typed DB models.
- Supabase/API/network errors are wrapped and propagated as service errors.
