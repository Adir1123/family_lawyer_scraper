-- Add max_post_age column for server-side post age filtering.
-- This is a hard filter applied after Apify returns posts,
-- rejecting any post whose creation timestamp is older than N hours.
ALTER TABLE scraper_config
ADD COLUMN max_post_age INTEGER NOT NULL DEFAULT 48;
