-- Schedule time window columns
ALTER TABLE scraper_config
  ADD COLUMN IF NOT EXISTS schedule_frequency INTEGER DEFAULT 4;
ALTER TABLE scraper_config
  ADD COLUMN IF NOT EXISTS schedule_from INTEGER DEFAULT 0;
ALTER TABLE scraper_config
  ADD COLUMN IF NOT EXISTS schedule_to INTEGER DEFAULT 23;
