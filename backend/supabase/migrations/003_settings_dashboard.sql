-- ============================================================
-- 003: Settings Dashboard — RLS policies + schedule tracking
-- ============================================================

-- Allow authenticated dashboard users to read scraper config
CREATE POLICY "Authenticated users can view scraper config"
  ON scraper_config FOR SELECT
  TO authenticated
  USING (true);

-- Allow authenticated dashboard users to update scraper config
CREATE POLICY "Authenticated users can update scraper config"
  ON scraper_config FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Store the Trigger.dev schedule ID for programmatic updates
ALTER TABLE scraper_config
  ADD COLUMN IF NOT EXISTS trigger_schedule_id TEXT;

-- AI confidence thresholds (moved from env vars to DB for dashboard control)
ALTER TABLE scraper_config
  ADD COLUMN IF NOT EXISTS confidence_high REAL DEFAULT 0.85;
ALTER TABLE scraper_config
  ADD COLUMN IF NOT EXISTS confidence_low REAL DEFAULT 0.60;

-- Cleanup settings (previously hardcoded in cleanup task)
ALTER TABLE scraper_config
  ADD COLUMN IF NOT EXISTS archive_days INTEGER DEFAULT 30;
ALTER TABLE scraper_config
  ADD COLUMN IF NOT EXISTS trash_days INTEGER DEFAULT 7;
