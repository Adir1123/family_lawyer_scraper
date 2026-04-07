# Family Lawyer Lead Scraper

Automated Facebook group lead generation for Family Lawyer businesses.

## Architecture

Trigger.dev (cron) → Apify (scrape) → Claude AI (filter) → Supabase (store)

## Tech Stack
- **Trigger.dev v3** — Scheduled task execution
- **Apify** — Facebook group scraping via `facebook-groups-scraper` actor
- **Claude AI (Sonnet)** — Hebrew-aware lead relevance scoring
- **Supabase** — PostgreSQL database + client dashboard

## Quick Start

1. `cp .env.example .env` and fill in API keys
2. `npm install`
3. Apply the Supabase migration: `supabase/migrations/001_initial_schema.sql`
4. Add Facebook group URLs to the `scraper_config` table in Supabase
5. `npx trigger.dev dev` (local) or `npx trigger.dev deploy` (production)

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| APIFY_TOKEN | Yes | Apify API token |
| ANTHROPIC_API_KEY | Yes | Anthropic API key for Claude |
| SUPABASE_URL | Yes | Supabase project URL |
| SUPABASE_SERVICE_KEY | Yes | Supabase service role key |
| TRIGGER_SECRET_KEY | Yes | Trigger.dev secret key |
| SCRAPER_MAX_POSTS | No | Max posts per scrape (default: 50) |
| SCRAPER_LOOKBACK_HOURS | No | Hours to look back (default: 24) |
| AI_CONFIDENCE_HIGH | No | High confidence threshold (default: 0.85) |
| AI_CONFIDENCE_LOW | No | Low confidence threshold (default: 0.60) |

## How AI Filtering Works

Each scraped post is analyzed by Claude AI using a Family Lawyer-specific prompt. The AI scores each post from 0 to 1 based on likelihood the poster needs a family lawyer. Posts scoring >=0.60 are saved as leads; below that goes to trash for auditing.

## File Structure

```
family-lawyer-scraper/
├── package.json
├── tsconfig.json
├── trigger.config.ts
├── .env.example
├── .gitignore
├── src/
│   ├── config.ts
│   ├── config/
│   │   └── niche.ts
│   ├── services/
│   │   ├── apify.ts
│   │   ├── ai-filter.ts
│   │   └── supabase.ts
│   ├── trigger/
│   │   ├── scrape-task.ts
│   │   └── cleanup-task.ts
│   ├── prompts/
│   │   └── system-prompt.ts
│   └── types/
│       ├── facebook-post.ts
│       └── database.ts
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── docs/
│   ├── setup-guide.md
│   └── operator-guide.md
└── README.md
```
