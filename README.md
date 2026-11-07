# Servemon

A searchable archive of Friday sermon (khutbah) PDFs from religious authorities across Malaysia. Built for Muslims who want to understand, study, and revisit the weekly khutbahs delivered at their local mosques.

Currently covering:
- **Selangor** — JAIS (Jabatan Agama Islam Selangor)
- **Kuala Lumpur, Putrajaya, Labuan** — JAKIM (Jabatan Kemajuan Islam Malaysia)
- **Johor** — JAINJ (Jabatan Agama Islam Negeri Johor, Jawi only)
- **Kedah** — JHEAIK (Jabatan Hal Ehwal Agama Islam Negeri Kedah, Jawi + Rumi)
- **Kelantan** — MAIK (Teks Khutbah, via masjid.e-maik.my)
- **Negeri Sembilan** — JHEAINS (Rumi)
- **Perak** — JAIPk (Jawi + Rumi)
- **Perlis** — MAIPs (Rumi)
- **Pulau Pinang** — JHEAIPP (Jawi + Rumi)
- **Sabah** — JHEAINS Sabah (Rumi)
- **Sarawak** — MIS (latest week only)
- **Terengganu** — JHEAT (Jawi + Rumi)

Two states (Melaka, Pahang) are still unreachable. See the Roadmap page for why and what is next.

## Tech Stack

- **Next.js 16** (App Router) — `output: "standalone"`
- **Tailwind CSS 4** — glassmorphism theme
- **better-sqlite3** — local SQLite storage (sermons metadata)
- **cheerio** — HTML scraping
- **Docker** — multi-stage build for Coolify/arm64 & amd64 deployment

## Features

- Browse sermons with multi-state, date-range, language and sort filters + title search
- Cards/list view toggle (persisted in localStorage)
- Per-sermon PDF viewer with Jawi / Rumi / English tabs + zoom controls
- One download button with a language picker, plus WhatsApp share + copy-link
- On-demand AI summaries (Malay, then translated to EN/ZH/TA) with verified dalils
- 4-language UI: Bahasa Melayu, English, 中文, தமிழ் (cookie-based toggle)
- Public roadmap page with coverage, shipped history and TODO list
- Split hero with a lazy-loaded three.js glass star (desktop only, reduced-motion fallback)
- Liquid-glass sticky navbar (vendored, trimmed React Bits Glass Surface)
- OpenGraph metadata, app icons generated from the Servemon mark
- Automatic scraping via cron trigger

## Architecture

```
app/
  page.tsx              Home — 3D hero, latest sermons, AI summary intro
  sermons/page.tsx      Browse — state filter + search + list/cards
  sermons/[id]/page.tsx Detail — PDF viewer + download + related
  about/page.tsx        About page (4 languages)
  roadmap/page.tsx      Roadmap — coverage, shipped history, TODO list
  api/cron/run/         POST cron trigger (runs all scrapers)
  api/pdf/[...path]/    PDF streaming from local disk
components/
  header, footer, lang-toggle, hero-visual, sermon-card/list/viewer,
  sermon-summary, sermon-filters, state-flag, download-button, share-button,
  back-to-top, skeleton
  ui/glass-surface.tsx  Refractive SVG-filter glass (trimmed React Bits port)
  lib/
  db.ts                 SQLite schema + queries
  storage.ts            PDF path/URL resolution (traversal-safe)
  scrapers/             jais.ts, jakim.ts, johor.ts, kedah.ts, kelantan.ts,
                        negerisembilan.ts, perak.ts, perlis.ts, pulaupinang.ts,
                        sabah.ts, sarawak.ts, terengganu.ts,
                        shared.ts, months.ts, http.ts
  i18n.ts / i18n-server.ts  UI translations
  about.ts              About page content (4 languages)
  roadmap.ts            Roadmap content (4 languages)
  ai/                   deepseek.ts, prompts.ts, schema.ts, parse.ts
  summaries.ts          Summary generation + translation orchestration
  pdf-text.ts           unpdf text extraction
  arabic.ts             Dalil normalization + verification
scripts/scrape.ts       Manual scrape runner
scripts/summarize.ts    Manual AI summary runner
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
| `NEXT_PUBLIC_SITE_URL` | request host | Optional canonical origin for share links |
| `DEEPSEEK_API_KEY` | — | Required to generate AI summaries |
| `SUMMARY_MODEL` | `deepseek-flash` | DeepSeek model for summaries/translations |
| `DEEPSEEK_BASE_URL` | `https://api.deepseek.com` | OpenAI-compatible API base |
| `SUMMARY_DAILY_LIMIT` | `60` | Max ready summary rows generated per UTC day (`0` = unlimited) |

## Scraping

Run both scrapers manually:

```bash
npm run scrape
```

Output JSON: `{ jais: {added, updated, skipped, errors}, jakim: {...}, johor: {...}, kedah: {...} }`.

### Cron (production)

The scrape is triggered externally (not via a scheduler inside the container). Set up a crontab on the host:

```
0 */6 * * * curl -fsS -X POST -H "x-cron-secret: <SECRET>" https://<your-domain>/api/cron/run >> ~/servemon-cron.log 2>&1
```

`CRON_SECRET` must match the value set on the deployed app.

## AI summaries

Summaries are generated on demand from the Rumi PDF, not during scraping. The
first click on a sermon calls DeepSeek, stores the result in SQLite, and later
views are cached. Translations to EN/ZH/TA are generated from the Malay summary
on first request.

Jawi-only sermons are skipped because their PDFs have no usable text layer.

Manual generation (outputs summary + token usage):

```bash
# one language (ms, en, zh, ta)
npx tsx --env-file=.env.local scripts/summarize.ts <sermon-id> ms
```

Dalil Arabic is only kept when it can be verified against the extracted PDF
text or its Malay translation; otherwise it is dropped rather than guessed.


## Docker

Multi-stage build — deps stage installs `python3 make g++` (better-sqlite3 needs node-gyp source compile), runner stage adds `libstdc++6`.

```bash
docker build --platform linux/amd64 -t ghcr.io/w30r/servemon:latest .
docker push ghcr.io/w30r/servemon:latest
```

Production runs with a persistent volume mounted at `DATA_DIR=/data`.

## Acknowledgements

All sermon texts remain the property of their respective state religious councils and departments. Servemon simply makes them easier to find.
