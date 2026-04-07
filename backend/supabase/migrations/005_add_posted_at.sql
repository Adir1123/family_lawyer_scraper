-- Add posted_at column to store the original Facebook post timestamp
ALTER TABLE leads ADD COLUMN posted_at TIMESTAMPTZ;

-- Backfill existing rows with created_at (best we can do for historical data)
UPDATE leads SET posted_at = created_at WHERE posted_at IS NULL;

-- Now make it required with a default
ALTER TABLE leads ALTER COLUMN posted_at SET NOT NULL;
ALTER TABLE leads ALTER COLUMN posted_at SET DEFAULT NOW();
