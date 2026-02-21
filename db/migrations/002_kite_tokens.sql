-- Migration: 002_kite_tokens
-- Persists Kite Connect access tokens across service restarts.
-- Only the latest row is used; older rows are kept for audit trail.
-- Tokens expire at 6:00 AM IST daily — the cron-job refreshes them via /kite/callback.

CREATE TABLE IF NOT EXISTS public.kite_tokens (
    id           SERIAL PRIMARY KEY,
    access_token TEXT        NOT NULL,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
