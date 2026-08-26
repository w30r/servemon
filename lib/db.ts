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

export function resetForTests(): void {
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
  `);
}