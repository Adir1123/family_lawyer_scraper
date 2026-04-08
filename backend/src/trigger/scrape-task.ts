import { schedules, logger } from '@trigger.dev/sdk/v3';
import { scrapeGroups } from '../services/apify.js';
import { filterPosts } from '../services/ai-filter.js';
import { buildSystemPrompt } from '../prompts/system-prompt.js';
import {
  getActiveConfig,
  checkProcessed,
  insertProcessed,
  insertLeads,
  insertTrash,
  insertRunMetrics,
} from '../services/supabase.js';
import { nicheConfig } from '../config/niche.js';

export const scrapeTask = schedules.task({
  id: 'family-lawyer-scrape',
  maxDuration: 900,
  run: async () => {
    const runId = `run-${Date.now()}`;
    const startedAt = new Date().toISOString();
    const errors: string[] = [];
    let postsScraped = 0;
    let postsNew = 0;
    let leadsFound = 0;
    let trashCount = 0;
    let tokensUsed = 0;

    try {
      // 1. Load config from Supabase
      const cfg = await getActiveConfig();
      if (!cfg?.active) {
        logger.info('Scraper is inactive, skipping run');
        return;
      }
      if (cfg.group_urls.length === 0) {
        logger.warn('No group URLs configured');
        return;
      }

      // 2. Scrape Facebook groups via Apify
      logger.info(`Scraping ${cfg.group_urls.length} groups...`);
      const posts = await scrapeGroups(
        cfg.group_urls,
        cfg.max_posts,
        cfg.lookback_hours
      );
      postsScraped = posts.length;
      logger.info(`Scraped ${postsScraped} posts`);

      if (postsScraped === 0) return;

      // 3. Dedup against processed_posts
      const seen = await checkProcessed(posts.map((p) => p.postId));
      const newPosts = posts.filter((p) => !seen.has(p.postId));
      postsNew = newPosts.length;
      logger.info(`${postsNew} new posts after dedup`);

      if (postsNew === 0) return;

      // 3b. Filter out posts older than max_post_age
      const ageCutoff = new Date(Date.now() - (cfg.max_post_age ?? 48) * 60 * 60 * 1000);
      const freshPosts = newPosts.filter((p) => new Date(p.timestamp) >= ageCutoff);
      const staleCount = newPosts.length - freshPosts.length;
      if (staleCount > 0) {
        logger.info(`Filtered ${staleCount} posts older than ${cfg.max_post_age ?? 48}h`);
      }

      if (freshPosts.length === 0) {
        logger.info('No fresh posts after age filter');
        // Still mark as processed so we don't re-check them
        await insertProcessed(
          newPosts.map((p) => ({ postId: p.postId, groupUrl: p.groupUrl }))
        );
        return;
      }

      // 4. Mark all as processed (including stale ones to avoid re-checking)
      await insertProcessed(
        newPosts.map((p) => ({ postId: p.postId, groupUrl: p.groupUrl }))
      );

      // 5. AI filter with Claude (only fresh posts)
      const systemPrompt = buildSystemPrompt(nicheConfig);
      const results = await filterPosts(
        freshPosts,
        systemPrompt,
        cfg.confidence_high,
        cfg.confidence_low,
      );
      tokensUsed = results.reduce((sum, r) => sum + r.tokensUsed, 0);

      // 6. Sort into leads and trash
      const leads = results.filter((r) => r.category !== 'trash');
      const trash = results.filter((r) => r.category === 'trash');
      leadsFound = leads.length;
      trashCount = trash.length;

      // 7. Store leads
      if (leads.length > 0) {
        const postMap = new Map(freshPosts.map((p) => [p.postId, p]));
        await insertLeads(
          leads.map((r) => {
            const post = postMap.get(r.postId);
            if (!post) throw new Error(`Post not found for lead: ${r.postId}`);
            return {
              post_id: r.postId,
              author_name: post.authorName,
              text: post.text,
              url: post.url,
              confidence: r.confidence,
              reasoning: r.reasoning,
              category: r.category,
              status: 'new' as const,
              group_url: post.groupUrl,
              posted_at: post.timestamp,
            };
          })
        );
      }

      // 8. Store trash
      if (trash.length > 0) {
        await insertTrash(
          trash.map((r) => ({
            post_id: r.postId,
            confidence: r.confidence,
            reasoning: r.reasoning,
          }))
        );
      }

      logger.info(
        `Run complete: ${leadsFound} leads, ${trashCount} trash, ${tokensUsed} tokens`
      );
    } catch (error) {
      const msg =
        error instanceof Error ? error.message : 'Unknown error';
      errors.push(msg);
      logger.error(`Run failed: ${msg}`);
      throw error;
    } finally {
      await insertRunMetrics({
        run_id: runId,
        started_at: startedAt,
        completed_at: new Date().toISOString(),
        posts_scraped: postsScraped,
        posts_new: postsNew,
        leads_found: leadsFound,
        trash_count: trashCount,
        tokens_used: tokensUsed,
        errors,
      });
    }
  },
});
