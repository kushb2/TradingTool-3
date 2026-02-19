-- =================================================================
-- indexes.sql
--
-- Description: Extra indexes for watchlist feature queries.
-- Note: PK + UNIQUE indexes are auto-created by PostgreSQL.
-- =================================================================

-- Find all watchlists that include a given stock.
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_stock_id
    ON public.watchlist_stocks(stock_id);

-- Fast filter for stocks by tag values in v1 (tags is TEXT[]).
CREATE INDEX IF NOT EXISTS idx_stocks_tags_gin
    ON public.stocks USING GIN(tags);

-- Optional read optimization for recent additions to watchlists.
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_created_at
    ON public.watchlist_stocks(created_at DESC);
