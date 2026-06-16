-- ============================================================
-- Add is_default column to watchlists table
-- ============================================================
ALTER TABLE watchlists ADD COLUMN is_default BOOLEAN DEFAULT FALSE;
