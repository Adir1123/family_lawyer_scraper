export type LeadStatus = 'new' | 'viewed' | 'contacted' | 'handled' | 'archived';

export interface ScraperConfig {
  id: string;
  group_urls: string[];
  cron_schedule: string;
  max_posts: number;
  lookback_hours: number;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProcessedPost {
  id: string;
  post_id: string;
  group_url: string;
  first_seen: string;
}

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
  created_at: string;
  updated_at: string;
}

export interface TrashPost {
  id: string;
  post_id: string;
  confidence: number;
  reasoning: string;
  created_at: string;
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
