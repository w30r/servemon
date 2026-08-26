# Servemon

A searchable archive of Friday sermon (khutbah) PDFs from religious authorities across Malaysia. Built for Muslims who want to understand, study, and revisit the weekly khutbahs delivered at their local mosques.

Currently covering:
- **Selangor** — JAIS (Jabatan Agama Islam Selangor)
- **Kuala Lumpur, Putrajaya, Labuan** — JAKIM (Jabatan Kemajuan Islam Malaysia)

More states coming soon.

## Tech Stack

- **Next.js 16** (App Router) — `output: "standalone"`
- **Tailwind CSS 4** — glassmorphism theme
- **better-sqlite3** — local SQLite storage (sermons metadata)
- **cheerio** — HTML scraping
- **Docker** — multi-stage build for Coolify/arm64 & amd64 deployment

## Features

- Browse sermons by state with per-state counts and live search
- Cards/list view toggle (persisted in localStorage)
- Per-sermon PDF viewer with Jawi / Rumi / English tabs + zoom controls
- Download individual PDFs (Jawi, Rumi, English)
- WhatsApp share + copy-link on sermon detail pages
- 4-language UI: Bahasa Melayu, English, 中文, தமிழ் (cookie-based toggle)
- OpenGraph metadata + favicon
- Automatic scraping via cron trigger

## Architecture

```
app/
  page.tsx              Home — hero + latest sermons
  sermons/page.tsx      Browse — state filter + search + list/cards
  sermons/[id]/page.tsx Detail — PDF viewer + download + related
  about/page.tsx        About page (4 languages)
  api/cron/run/         POST cron trigger (runs both scrapers)
  api/pdf/[...path]/    PDF streaming from local disk
components/
  header, footer, lang-toggle, sermon-card/list/viewer,
  share-button, back-to-top, skeleton
lib/
  db.ts                 SQLite schema + queries
  storage.ts            PDF path/URL resolution (traversal-safe)
  scrapers/             jais.ts, jakim.ts, shared.ts, http.ts
  i18n.ts / i18n-server.ts  UI translations
scripts/scrape.ts       Manual scrape runner
```

**Data flow:** Scrapers fetch listings from official sites → parse sermon metadata + download PDFs to local disk (`DATA_DIR`) → upsert into SQLite. PDFs are served from disk via `/api/pdf/[...path]`, not external URLs (government sites can be unreliable during Friday prayers).

## Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000.

### Environment

| Variable | Default | Description |
|---|---|---|
| `DATA_DIR` | `~/.servemon/data` | Where PDFs + SQLite DB live |
| `CRON_SECRET` | — | Required for `POST /api/cron/run` (matches `x-cron-secret` header) |

## Scraping

Run both scrapers manually:

```bash
npm run scrape
```

Output JSON: `{ jais: {added, updated, skipped, errors}, jakim: {...} }`.

### Cron (production)

The scrape is triggered externally (not via a scheduler inside the container). Set up a crontab on the host:

```
0 */6 * * * curl -fsS -X POST -H "x-cron-secret: <SECRET>" https://<your-domain>/api/cron/run >> ~/servemon-cron.log 2>&1
```

`CRON_SECRET` must match the value set on the deployed app.

## Docker

Multi-stage build — deps stage installs `python3 make g++` (better-sqlite3 needs node-gyp source compile), runner stage adds `libstdc++6`.

```bash
docker build --platform linux/amd64 -t ghcr.io/w30r/servemon:latest .
docker push ghcr.io/w30r/servemon:latest
```

Production runs with a persistent volume mounted at `DATA_DIR=/data`.

## Acknowledgements

All sermon texts remain the property of their respective state religious councils and departments. Servemon simply makes them easier to find.
