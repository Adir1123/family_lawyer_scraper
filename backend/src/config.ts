import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  APIFY_TOKEN: z.string().min(1, 'APIFY_TOKEN is required'),
  ANTHROPIC_API_KEY: z.string().min(1, 'ANTHROPIC_API_KEY is required'),
  SUPABASE_URL: z.string().url('SUPABASE_URL must be a valid URL'),
  SUPABASE_SERVICE_KEY: z.string().min(1, 'SUPABASE_SERVICE_KEY is required'),
  TRIGGER_SECRET_KEY: z.string().min(1, 'TRIGGER_SECRET_KEY is required'),
  SCRAPER_MAX_POSTS: z.coerce.number().int().positive().default(50),
  SCRAPER_LOOKBACK_HOURS: z.coerce.number().int().positive().default(24),
  AI_CONFIDENCE_HIGH: z.coerce.number().min(0).max(1).default(0.85),
  AI_CONFIDENCE_LOW: z.coerce.number().min(0).max(1).default(0.60),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Environment validation failed:');
  for (const issue of parsed.error.issues) {
    console.error(`  ${issue.path.join('.')}: ${issue.message}`);
  }
  process.exit(1);
}

export const config = parsed.data;
