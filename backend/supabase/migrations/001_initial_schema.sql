-- Scraper configuration
CREATE TABLE scraper_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_urls TEXT[] NOT NULL DEFAULT '{}',
  cron_schedule TEXT NOT NULL DEFAULT '0 */6 * * *',
  max_posts INTEGER NOT NULL DEFAULT 50,
  lookback_hours INTEGER NOT NULL DEFAULT 24,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Insert default config row
INSERT INTO scraper_config (group_urls) VALUES ('{}');

-- Dedup registry: every post ever seen
CREATE TABLE processed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT UNIQUE NOT NULL,
  group_url TEXT NOT NULL,
  first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_processed_posts_post_id ON processed_posts(post_id);

-- Leads: relevant posts (client-facing)
CREATE TYPE lead_status AS ENUM ('new', 'viewed', 'contacted', 'handled', 'archived');

CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL REFERENCES processed_posts(post_id),
  author_name TEXT NOT NULL,
  text TEXT NOT NULL,
  url TEXT NOT NULL,
  confidence REAL NOT NULL,
  reasoning TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'medium',
  status lead_status NOT NULL DEFAULT 'new',
  group_url TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_created_at ON leads(created_at DESC);

-- Trash: irrelevant posts for audit/tuning
CREATE TABLE trash (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id TEXT NOT NULL REFERENCES processed_posts(post_id),
  confidence REAL NOT NULL,
  reasoning TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Run metrics: per-run stats
CREATE TABLE run_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  run_id TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL,
  completed_at TIMESTAMPTZ,
  posts_scraped INTEGER NOT NULL DEFAULT 0,
  posts_new INTEGER NOT NULL DEFAULT 0,
  leads_found INTEGER NOT NULL DEFAULT 0,
  trash_count INTEGER NOT NULL DEFAULT 0,
  tokens_used INTEGER NOT NULL DEFAULT 0,
  errors TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS policies (enable for client dashboard access)
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE scraper_config ENABLE ROW LEVEL SECURITY;
