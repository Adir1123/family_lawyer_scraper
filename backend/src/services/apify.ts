import { ApifyClient } from 'apify-client';
import { config } from '../config.js';
import type { RawFacebookPost, FacebookPost } from '../types/facebook-post.js';

const client = new ApifyClient({ token: config.APIFY_TOKEN });

export async function scrapeGroups(
  groupUrls: string[],
  maxPosts: number = config.SCRAPER_MAX_POSTS,
  lookbackHours: number = config.SCRAPER_LOOKBACK_HOURS
): Promise<FacebookPost[]> {
  const run = await client.actor('apify/facebook-groups-scraper').call(
    {
      startUrls: groupUrls.map((url) => ({ url })),
      resultsLimit: maxPosts,
      maxPostDate: new Date(
        Date.now() - lookbackHours * 60 * 60 * 1000
      ).toISOString(),
    },
    { timeout: 600 }
  );

  const { items } = await client.dataset(run.defaultDatasetId).listItems();
  return (items as RawFacebookPost[]).map(mapPost);
}

function mapPost(raw: RawFacebookPost): FacebookPost {
  return {
    postId: raw.postId ?? raw.id ?? `unknown-${Date.now()}`,
    authorName: raw.authorName ?? raw.user?.name ?? 'Unknown',
    text: raw.text ?? raw.message ?? '',
    timestamp: raw.timestamp ?? raw.date ?? new Date().toISOString(),
    url: raw.url ?? raw.postUrl ?? '',
    reactions: raw.likesCount ?? raw.reactions ?? 0,
    comments: raw.commentsCount ?? raw.comments ?? 0,
    groupUrl: raw.groupUrl ?? '',
  };
}
