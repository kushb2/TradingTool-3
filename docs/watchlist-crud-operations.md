# Watchlist CRUD Operations

Recommended entry point: `WatchlistService`
- File: `src/application/services/watchlist_service.py`

## Stocks
- `create_stock`
- `get_stock_by_id`
- `get_stock_by_nse_symbol`
- `list_stocks`
- `update_stock`
- `delete_stock`

## Watchlists
- `create_watchlist`
- `get_watchlist_by_id`
- `get_watchlist_by_name`
- `list_watchlists`
- `update_watchlist`
- `delete_watchlist`

## Watchlist Stocks (mapping)
- `create_watchlist_stock`
- `get_watchlist_stock`
- `list_stocks_for_watchlist`
- `update_watchlist_stock`
- `delete_watchlist_stock`

## Table Accessibility Check
- `check_tables_access`
- CLI: `python -m src.presentation.cli.supabase_cli tables`

DAO layer (query-only) has matching method names in:
- `src/infrastructure/repositories/watchlist_dao.py`
