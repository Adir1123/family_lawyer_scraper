import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import type { LeadStatus } from '../types/database.js';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

export async function checkProcessed(postIds: string[]): Promise<Set<string>> {
  const { data, error } = await supabase
    .from('processed_posts')
    .select('post_id')
    .in('post_id', postIds);
  if (error) throw new Error(`Failed to check processed posts: ${error.message}`);
  return new Set((data ?? []).map((r) => r.post_id));
}

export async function insertProcessed(
  posts: { postId: string; groupUrl: string }[]
) {
  const { error } = await supabase.from('processed_posts').upsert(
    posts.map((p) => ({ post_id: p.postId, group_url: p.groupUrl })),
    { onConflict: 'post_id' }
  );
  if (error) throw new Error(`Failed to insert processed posts: ${error.message}`);
}

export async function insertLeads(
  leads: {
    post_id: string;
    author_name: string;
    text: string;
    url: string;
    confidence: number;
    reasoning: string;
    category: string;
    status: 'new';
    group_url: string;
    posted_at: string;
  }[]
) {
  const { error } = await supabase.from('leads').insert(leads);
  if (error) throw new Error(`Failed to insert leads: ${error.message}`);
}

export async function insertTrash(
  items: { post_id: string; confidence: number; reasoning: string }[]
) {
  const { error } = await supabase.from('trash').insert(items);
  if (error) throw new Error(`Failed to insert trash: ${error.message}`);
}

export async function insertRunMetrics(metrics: {
  run_id: string;
  started_at: string;
  completed_at: string | null;
  posts_scraped: number;
  posts_new: number;
  leads_found: number;
  trash_count: number;
  tokens_used: number;
  errors: string[];
}) {
  const { error } = await supabase.from('run_metrics').insert(metrics);
  if (error) throw new Error(`Failed to insert run metrics: ${error.message}`);
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  const { error } = await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', leadId);
  if (error) throw new Error(`Failed to update lead status: ${error.message}`);
}

export async function getActiveConfig() {
  const { data, error } = await supabase
    .from('scraper_config')
    .select('*')
    .eq('active', true)
    .limit(1)
    .single();
  if (error) throw new Error(`Failed to load scraper config: ${error.message}`);
  return data;
}

export async function archiveOldLeads(olderThanDays: number = 30) {
  const cutoff = new Date(
    Date.now() - olderThanDays * 24 * 60 * 60 * 1000
  ).toISOString();
  const { error } = await supabase
    .from('leads')
    .update({ status: 'archived' as LeadStatus })
    .eq('status', 'handled')
    .lt('updated_at', cutoff);
  if (error) throw new Error(`Failed to archive old leads: ${error.message}`);
}

export async function cleanOldTrash(olderThanDays: number = 7) {
  const cutoff = new Date(
    Date.now() - olderThanDays * 24 * 60 * 60 * 1000
  ).toISOString();
  const { error } = await supabase.from('trash').delete().lt('created_at', cutoff);
  if (error) throw new Error(`Failed to clean old trash: ${error.message}`);
}
