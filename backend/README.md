# Family Lawyer Scraper

Automated Facebook group lead scraper for the family law niche. Scrapes posts, filters them with AI, and stores qualified leads in a database with a client dashboard.

## Architecture

```
Trigger.dev cron (every 6h)
    │
    ▼
Apify (scrape Facebook groups)
    │
    ▼
Dedup check (Supabase processed_posts)
    │
    ▼
Claude AI filter (Hebrew-aware relevance scoring)
    │
    ├──▶ Leads table (confidence ≥ 0.60)
    │       └── new → viewed → contacted → handled → archived
    │
    ├──▶ Trash table (confidence < 0.60)
    │
    ▼
Run metrics recorded

Client Dashboard (Next.js on Vercel)
    │
    ▼
Supabase Auth (email/password)
    ├──▶ View leads (filtered, sorted, paginated)
    ├──▶ Update lead status
    └──▶ View run stats + leads-over-time chart
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Scheduling | Trigger.dev v3 |
| Scraping | Apify (`facebook-groups-scraper`) |
| AI Filtering | Claude claude-sonnet-4-5-20250929 |
| Database | Supabase (PostgreSQL) |
| Dashboard | Next.js 14 + Vercel |
| Dashboard Auth | Supabase Auth + RLS |
| Language | TypeScript (strict) |

## Setup

See `docs/deployment-guide.pdf` for complete setup and deployment instructions.
