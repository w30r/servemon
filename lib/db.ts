import Database from "better-sqlite3";
import path from "path";
import { homedir } from "os";
import { mkdirSync } from "fs";

const DATA_DIR = process.env.DATA_DIR || path.join(homedir(), ".servemon", "data");
mkdirSync(DATA_DIR, { recursive: true });

export const db = new Database(path.join(DATA_DIR, "servemon.db"));

// Enable WAL mode for concurrent reads
db.pragma("journal_mode = WAL");

// Schema — idempotent on (source_id, date)
db.exec(`
  CREATE TABLE IF NOT EXISTS sermons (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    state TEXT NOT NULL,
    states TEXT,
    date TEXT NOT NULL,
    pdf_jawi TEXT,
    pdf_rumi TEXT,
    pdf_english TEXT,
    language TEXT DEFAULT 'Rumi',
    source_url TEXT,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE UNIQUE INDEX IF NOT EXISTS idx_sermons_source_date ON sermons(source_url, date);

  CREATE TABLE IF NOT EXISTS sermon_summaries (
    id TEXT PRIMARY KEY,
    sermon_id TEXT NOT NULL,
    lang TEXT NOT NULL,
    source_pdf_hash TEXT,
    source_kind TEXT,
    tldr TEXT,
    points_json TEXT,
    dalils_json TEXT,
    model TEXT,
    prompt_version TEXT,
    verified INTEGER DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'pending',
    error TEXT,
    tokens_in INTEGER,
    tokens_out INTEGER,
    started_at TEXT,
    generated_at TEXT,
    UNIQUE(sermon_id, lang)
  );

  CREATE INDEX IF NOT EXISTS idx_summaries_sermon ON sermon_summaries(sermon_id);
`);

// Migration: add pdf_jawi to pre-existing tables
try {
  db.exec("ALTER TABLE sermons ADD COLUMN pdf_jawi TEXT");
} catch {
  // column already exists
}
try {
  db.exec("ALTER TABLE sermons ADD COLUMN states TEXT");
} catch {
  // column already exists
}

export function insertSermon({
  id,
  title,
  state,
  states,
  date,
  pdfJawi,
  pdfRumi,
  pdfEnglish,
  language,
  sourceUrl,
}: {
  id: string;
  title: string;
  state: string;
  states?: string[];
  date: string;
  pdfJawi?: string | null;
  pdfRumi?: string | null;
  pdfEnglish?: string | null;
  language?: string;
  sourceUrl: string;
}) {
  const stmt = db.prepare(`
    INSERT OR IGNORE INTO sermons (id, title, state, states, date, pdf_jawi, pdf_rumi, pdf_english, language, source_url)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    id,
    title,
    state,
    states && states.length ? states.join(",") : null,
    date,
    pdfJawi,
    pdfRumi,
    pdfEnglish,
    language,
    sourceUrl
  );
}

export type DbSermon = {
  id: string;
  title: string;
  state: string;
  states: string | null;
  date: string;
  pdf_jawi: string | null;
  pdf_rumi: string | null;
  pdf_english: string | null;
  language: string | null;
  source_url: string | null;
  created_at: string;
};

export function listSermons(filters?: {
  state?: string;
  q?: string;
  startDate?: string;
  endDate?: string;
}): DbSermon[] {
  let sql = `SELECT * FROM sermons WHERE 1=1`;
  const params: string[] = [];

  if (filters?.state) {
    // Match primary state OR any of the comma-separated `states` list (e.g. JAKIM -> KL/Putrajaya/Labuan)
    sql += " AND (state = ? OR (states IS NOT NULL AND states LIKE ?))";
    params.push(filters.state, `%${filters.state}%`);
  }
  if (filters?.q) {
    sql += " AND (title LIKE ? OR state LIKE ?)";
    const q = `%${filters.q}%`;
    params.push(q, q);
  }
  if (filters?.startDate) {
    sql += " AND date >= ?";
    params.push(filters.startDate);
  }
  if (filters?.endDate) {
    sql += " AND date <= ?";
    params.push(filters.endDate);
  }

  sql += " ORDER BY date DESC";
  const stmt = db.prepare(sql);
  return stmt.all(...params) as DbSermon[];
}

export function getSermon(id: string): DbSermon | null {
  const stmt = db.prepare("SELECT * FROM sermons WHERE id = ?");
  return (stmt.get(id) as DbSermon | undefined) ?? null;
}

export type SummaryStatus = "pending" | "running" | "ready" | "failed";

export type DbSummary = {
  id: string;
  sermon_id: string;
  lang: string;
  source_pdf_hash: string | null;
  source_kind: string | null;
  tldr: string | null;
  points_json: string | null;
  dalils_json: string | null;
  model: string | null;
  prompt_version: string | null;
  verified: number;
  status: SummaryStatus;
  error: string | null;
  tokens_in: number | null;
  tokens_out: number | null;
  started_at: string | null;
  generated_at: string | null;
};

export function getSermonSummary(
  sermonId: string,
  lang: string
): DbSummary | null {
  const stmt = db.prepare(
    "SELECT * FROM sermon_summaries WHERE sermon_id = ? AND lang = ?"
  );
  return (stmt.get(sermonId, lang) as DbSummary | undefined) ?? null;
}

/**
 * Single-flight claim. Returns "ready" when a cached summary for this PDF
 * already exists, "busy" when another request is generating it, and
 * "claimed" when the caller now owns the job.
 */
export function claimSermonSummary(
  sermonId: string,
  lang: string,
  pdfHash: string
): "ready" | "busy" | "claimed" {
  const existing = getSermonSummary(sermonId, lang);

  if (existing?.status === "ready" && existing.source_pdf_hash === pdfHash) {
    return "ready";
  }

  if (existing?.status === "running") {
    const started = existing.started_at
      ? new Date(existing.started_at).getTime()
      : 0;
    // Reclaim jobs stuck for more than five minutes (server restart, crash).
    if (Date.now() - started < 5 * 60 * 1000) return "busy";
  }

  if (existing) {
    db.prepare(
      `UPDATE sermon_summaries
       SET status = 'running', error = NULL, source_pdf_hash = ?,
           started_at = ?, tldr = NULL, points_json = NULL, dalils_json = NULL
       WHERE sermon_id = ? AND lang = ?`
    ).run(pdfHash, new Date().toISOString(), sermonId, lang);
  } else {
    db.prepare(
      `INSERT INTO sermon_summaries
         (id, sermon_id, lang, status, source_pdf_hash, started_at)
       VALUES (?, ?, ?, 'running', ?, ?)`
    ).run(
      `summary-${sermonId}-${lang}`,
      sermonId,
      lang,
      pdfHash,
      new Date().toISOString()
    );
  }

  return "claimed";
}

export function saveSermonSummary({
  sermonId,
  lang,
  sourceKind,
  tldr,
  points,
  dalils,
  model,
  promptVersion,
  verified,
  tokensIn,
  tokensOut,
}: {
  sermonId: string;
  lang: string;
  sourceKind: string;
  tldr: string;
  points: string[];
  dalils: unknown[];
  model: string;
  promptVersion: string;
  verified: boolean;
  tokensIn: number | null;
  tokensOut: number | null;
}): void {
  db.prepare(
    `UPDATE sermon_summaries
     SET source_kind = ?, tldr = ?, points_json = ?, dalils_json = ?,
         model = ?, prompt_version = ?, verified = ?, status = 'ready',
         error = NULL, tokens_in = ?, tokens_out = ?, generated_at = ?
     WHERE sermon_id = ? AND lang = ?`
  ).run(
    sourceKind,
    tldr,
    JSON.stringify(points),
    JSON.stringify(dalils),
    model,
    promptVersion,
    verified ? 1 : 0,
    tokensIn,
    tokensOut,
    new Date().toISOString(),
    sermonId,
    lang
  );
}

export function failSermonSummary(
  sermonId: string,
  lang: string,
  error: string
): void {
  db.prepare(
    `UPDATE sermon_summaries
     SET status = 'failed', error = ?
     WHERE sermon_id = ? AND lang = ?`
  ).run(error.slice(0, 500), sermonId, lang);
}

export function countSummariesToday(): number {
  const row = db
    .prepare(
      `SELECT COUNT(*) AS n FROM sermon_summaries
       WHERE status = 'ready' AND date(generated_at) = date('now')`
    )
    .get() as { n: number };
  return row.n;
}

export function resetForTests(): void {
  db.exec("DROP TABLE IF EXISTS sermon_summaries");
  db.exec("DROP TABLE IF EXISTS sermons");
  db.exec(`
    CREATE TABLE sermons (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      state TEXT NOT NULL,
      states TEXT,
      date TEXT NOT NULL,
      pdf_jawi TEXT,
      pdf_rumi TEXT,
      pdf_english TEXT,
      source_url TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );
    CREATE UNIQUE INDEX IF NOT EXISTS idx_sermons_source_date ON sermons(source_url, date);

    CREATE TABLE sermon_summaries (
      id TEXT PRIMARY KEY,
      sermon_id TEXT NOT NULL,
      lang TEXT NOT NULL,
      source_pdf_hash TEXT,
      source_kind TEXT,
      tldr TEXT,
      points_json TEXT,
      dalils_json TEXT,
      model TEXT,
      prompt_version TEXT,
      verified INTEGER DEFAULT 0,
      status TEXT NOT NULL DEFAULT 'pending',
      error TEXT,
      tokens_in INTEGER,
      tokens_out INTEGER,
      started_at TEXT,
      generated_at TEXT,
      UNIQUE(sermon_id, lang)
    );
  `);
}