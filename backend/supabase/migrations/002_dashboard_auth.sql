-- Dashboard Authentication & Authorization
-- Run this AFTER 001_initial_schema.sql
-- Enables Supabase Auth users to access the dashboard

-- RLS policies for leads table (RLS already enabled in 001)
CREATE POLICY "Authenticated users can view leads"
  ON leads FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can update lead status"
  ON leads FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Enable RLS on run_metrics and add read policy
ALTER TABLE run_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view run metrics"
  ON run_metrics FOR SELECT
  TO authenticated
  USING (true);

-- RPC function for daily lead counts (used by the stats chart)
CREATE OR REPLACE FUNCTION leads_per_day(days_back INTEGER DEFAULT 30)
RETURNS TABLE(day DATE, count BIGINT)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT
    date_trunc('day', created_at)::date AS day,
    count(*) AS count
  FROM leads
  WHERE created_at >= NOW() - (days_back || ' days')::INTERVAL
  GROUP BY day
  ORDER BY day;
$$;
