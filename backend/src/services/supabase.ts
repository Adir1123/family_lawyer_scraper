import { createClient } from '@supabase/supabase-js';
import { config } from '../config.js';
import type { LeadStatus } from '../types/database.js';

const supabase = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY);

export async function checkProcessed(postIds: string[]): Promise<Set<string>> {
  const { data } = await supabase
    .from('processed_posts')
    .select('post_id')
    .in('post_id', postIds);
  return new Set((data ?? []).map((r) => r.post_id));
}

export async function insertProcessed(
  posts: { postId: string; groupUrl: string }[]
) {
  await supabase.from('processed_posts').upsert(
    posts.map((p) => ({ post_id: p.postId, group_url: p.groupUrl })),
    { onConflict: 'post_id' }
  );
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
  await supabase.from('leads').insert(leads);
}

export async function insertTrash(
  items: { post_id: string; confidence: number; reasoning: string }[]
) {
  await supabase.from('trash').insert(items);
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
  await supabase.from('run_metrics').insert(metrics);
}

export async function updateLeadStatus(leadId: string, status: LeadStatus) {
  await supabase
    .from('leads')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', leadId);
}

export async function getActiveConfig() {
  const { data } = await supabase
    .from('scraper_config')
    .select('*')
    .eq('active', true)
    .limit(1)
    .single();
  return data;
}

export async function archiveOldLeads(olderThanDays: number = 30) {
  const cutoff = new Date(
    Date.now() - olderThanDays * 24 * 60 * 60 * 1000
  ).toISOString();
  await supabase
    .from('leads')
    .update({ status: 'archived' as LeadStatus })
    .eq('status', 'handled')
    .lt('updated_at', cutoff);
}

export async function cleanOldTrash(olderThanDays: number = 7) {
  const cutoff = new Date(
    Date.now() - olderThanDays * 24 * 60 * 60 * 1000
  ).toISOString();
  await supabase.from('trash').delete().lt('created_at', cutoff);
}
