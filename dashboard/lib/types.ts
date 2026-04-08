export type LeadStatus = "new" | "viewed" | "contacted" | "handled" | "archived";

export interface Lead {
  id: string;
  post_id: string;
  author_name: string;
  text: string;
  url: string;
  confidence: number;
  reasoning: string;
  category: string;
  status: LeadStatus;
  group_url: string;
  posted_at: string;
  created_at: string;
  updated_at: string;
}

export interface RunMetrics {
  id: string;
  run_id: string;
  started_at: string;
  completed_at: string | null;
  posts_scraped: number;
  posts_new: number;
  leads_found: number;
  trash_count: number;
  tokens_used: number;
  errors: string[];
  created_at: string;
}

export interface DailyLeadCount {
  day: string;
  count: number;
}

export interface ScraperConfig {
  id: string;
  group_urls: string[];
  cron_schedule: string;
  schedule_frequency: number;
  schedule_from: number;
  schedule_to: number;
  max_posts: number;
  lookback_hours: number;
  max_post_age: number;
  active: boolean;
  trigger_schedule_id: string | null;
  confidence_high: number;
  confidence_low: number;
  archive_days: number;
  trash_days: number;
  created_at: string;
  updated_at: string;
}
