-- Add close position tracking to trades table.
-- close_price NULL  => position is still OPEN
-- close_price NOT NULL => position has been CLOSED
--
-- close_date is optional; defaults to the date the update happened if not provided.

ALTER TABLE trades
  ADD COLUMN close_price NUMERIC(12,2) NULL,
  ADD COLUMN close_date  DATE          NULL;
