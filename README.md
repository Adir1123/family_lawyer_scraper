# Family Lawyer Lead Scraper

**Automated lead generation pipeline that scrapes Facebook groups, uses AI to qualify leads, and serves them through a real-time dashboard.**

Built for family law firms in Israel — scrapes Hebrew & English posts, scores relevance with Claude AI, and delivers qualified leads to a management dashboard.

![Tech Stack](https://img.shields.io/badge/Next.js-14-black?logo=next.js) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript) ![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase) ![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-black?logo=vercel)

---

## How It Works

```mermaid
flowchart LR
    A["⏰ Trigger.dev\n(Cron)"] --> B["🕷️ Apify\n(Scrape)"]
    B --> C{"🔄 Dedup\nEngine"}
    C -->|New Post| D["🤖 Claude AI\n(Score 0-1)"]
    C -->|Already Seen| E["⏭️ Skip"]
    D -->|≥ 0.60| F["✅ Lead\n(Supabase)"]
    D -->|< 0.60| G["🗑️ Trash\n(Audit)"]
    F --> H["📊 Dashboard\n(Next.js)"]

    style A fill:#6366f1,stroke:#4f46e5,color:#fff
    style B fill:#f59e0b,stroke:#d97706,color:#fff
    style C fill:#8b5cf6,stroke:#7c3aed,color:#fff
    style D fill:#ec4899,stroke:#db2777,color:#fff
    style F fill:#10b981,stroke:#059669,color:#fff
    style G fill:#ef4444,stroke:#dc2626,color:#fff
    style H fill:#3b82f6,stroke:#2563eb,color:#fff
    style E fill:#6b7280,stroke:#4b5563,color:#fff
```

1. **Trigger.dev** runs a scheduled cron job (configurable: hourly to daily)
2. **Apify** scrapes configured Facebook groups for new posts
3. **Deduplication engine** filters out already-processed posts
4. **Claude AI (Sonnet)** analyzes each post with a niche-specific prompt — scores relevance 0-1
5. **Supabase** stores qualified leads, trash (for auditing), and run metrics
6. **Dashboard** lets operators manage leads through a sales pipeline

## Key Features

### AI-Powered Lead Qualification
- Claude AI scores each post's likelihood of needing a family lawyer (0.0 - 1.0)
- Hebrew & English support — handles slang, abbreviations, and mixed-language posts
- Few-shot prompting with real examples for high accuracy
- Configurable confidence thresholds (high / medium / trash)
- Trash table preserved for auditing false negatives and tuning

### Lead Lifecycle

```mermaid
stateDiagram-v2
    direction LR
    [*] --> New: AI qualifies
    New --> Viewed
    Viewed --> Contacted
    Contacted --> Handled
    Handled --> Archived
    Archived --> [*]
    New --> Archived: Dismissed
```

### Real-Time Dashboard
- **Leads view** — filterable by status, source group, and confidence score
- **Sales pipeline** — track leads through: New → Viewed → Contacted → Handled → Archived
- **Analytics** — 30-day charts for scrape volume, lead conversion, and AI token usage
- **Settings panel** — configure groups, schedule, AI thresholds, and data retention
- **Manual controls** — trigger runs on demand, cancel active runs
- Responsive design (table on desktop, cards on mobile)

### Production-Grade Pipeline
- Deduplication registry — never processes the same post twice
- Age filtering — rejects old posts resurfacing from new comments
- Active hours scheduling — run only during business hours
- Auto-archive handled leads after N days
- Auto-delete trash after N days
- Per-run metrics: posts scraped, leads found, tokens used, errors

## Tech Stack

| Layer | Technology |
|---|---|
| **Orchestration** | Trigger.dev v3 — cron scheduling, retry logic, 900s max duration |
| **Scraping** | Apify — `facebook-groups-scraper` actor |
| **AI** | Anthropic Claude Sonnet — structured JSON scoring with reasoning |
| **Database** | Supabase (PostgreSQL) — RLS-secured, indexed for dashboard queries |
| **Dashboard** | Next.js 14 (App Router) + Tailwind CSS + shadcn/ui + Recharts |
| **Auth** | Supabase Auth — session-based, SSR-compatible |
| **Deployment** | Vercel (dashboard) + Trigger.dev Cloud (backend) |

## Demo

### Leads Dashboard
<img src="docs/gifs/leads-tab.gif" alt="Leads Dashboard" width="600">

### Settings & Configuration
<img src="docs/gifs/settings-tab.gif" alt="Settings" width="600">

## Getting Started

### Prerequisites
- Node.js 20+
- Supabase project
- Apify account
- Anthropic API key
- Trigger.dev account

### Setup

```bash
# Clone and install
git clone https://github.com/Adir1123/family_lawyer_scraper.git
cd family-lawyer-scraper
npm install

# Configure environment
cp .env.example .env
# Fill in your API keys

# Apply database schema
# Run supabase/migrations/001_initial_schema.sql against your Supabase project

# Add Facebook group URLs to scraper_config table in Supabase

# Start development
npx trigger.dev dev        # Backend pipeline
cd dashboard && npm run dev # Dashboard at localhost:3000
```

### Environment Variables

| Variable | Description |
|---|---|
| `APIFY_TOKEN` | Apify API token |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `TRIGGER_SECRET_KEY` | Trigger.dev secret key |

## Project Structure

```
family-lawyer-scraper/
├── backend/
│   ├── src/
│   │   ├── config/          # Niche-specific keywords & signals
│   │   ├── services/        # Apify, AI filter, Supabase clients
│   │   ├── trigger/         # Scheduled task definitions
│   │   ├── prompts/         # Claude system prompt
│   │   └── types/           # TypeScript interfaces
│   └── trigger.config.ts
├── dashboard/
│   ├── app/                 # Next.js App Router pages
│   ├── components/          # UI components (shadcn/ui)
│   └── lib/                 # Supabase client setup
└── supabase/
    └── migrations/          # Database schema
```

## License

MIT
