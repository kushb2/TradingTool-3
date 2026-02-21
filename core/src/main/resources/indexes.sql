-- =============================================================
-- TradingTool-3 — All Indexes
-- Run this after tables.sql in Supabase SQL editor.
-- =============================================================

-- stocks
CREATE INDEX IF NOT EXISTS idx_stocks_symbol              ON public.stocks(symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_instrument_token    ON public.stocks(instrument_token);
CREATE INDEX IF NOT EXISTS idx_stocks_exchange_symbol     ON public.stocks(exchange, symbol);
CREATE INDEX IF NOT EXISTS idx_stocks_created_at          ON public.stocks(created_at DESC);

-- watchlist_stocks
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_wl        ON public.watchlist_stocks(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_stock     ON public.watchlist_stocks(stock_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_stocks_created   ON public.watchlist_stocks(created_at DESC);

-- tags
CREATE INDEX IF NOT EXISTS idx_tags_name                  ON public.tags(name);

-- stock_tags
CREATE INDEX IF NOT EXISTS idx_stock_tags_stock           ON public.stock_tags(stock_id);
CREATE INDEX IF NOT EXISTS idx_stock_tags_tag             ON public.stock_tags(tag_id);

-- watchlist_tags
CREATE INDEX IF NOT EXISTS idx_watchlist_tags_wl          ON public.watchlist_tags(watchlist_id);
CREATE INDEX IF NOT EXISTS idx_watchlist_tags_tag         ON public.watchlist_tags(tag_id);

-- stock_notes
CREATE INDEX IF NOT EXISTS idx_stock_notes_stock          ON public.stock_notes(stock_id);
CREATE INDEX IF NOT EXISTS idx_stock_notes_created        ON public.stock_notes(created_at DESC);
