import { downloadPdf, pdfPath, pdfUrl } from "../storage";
import { existsSync } from "fs";
import { db } from "../db";

export type PdfSet = {
  jawi: string | null;
  rumi: string | null;
  english: string | null;
};

type StoredPdfs = {
  id: string;
  pdf_jawi: string | null;
  pdf_rumi: string | null;
  pdf_english: string | null;
};

const PDF_LANGS = ["jawi", "rumi", "english"] as const;

const findStmt = db.prepare<[string], StoredPdfs>(
  "SELECT id, pdf_jawi, pdf_rumi, pdf_english FROM sermons WHERE source_url = ?"
);
const insertStmt = db.prepare(
  `INSERT INTO sermons (id, title, state, states, date, pdf_jawi, pdf_rumi, pdf_english, language, source_url)
   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
);
const updateStmt = db.prepare(
  `UPDATE sermons SET title = ?, states = ?, pdf_jawi = ?, pdf_rumi = ?, pdf_english = ?, language = ? WHERE id = ?`
);

function languageLabel(pdfs: PdfSet): string {
  const labels: string[] = [];
  if (pdfs.jawi) labels.push("Jawi");
  if (pdfs.rumi) labels.push("Rumi");
  if (pdfs.english) labels.push("English");
  return labels.length ? labels.join(" / ") : "Rumi";
}

/**
 * Download every PDF that is not on disk yet. Returns which languages are
 * actually available, so we never store a URL that points at a failed
 * download.
 */
async function savePdfs(
  pdfs: PdfSet,
  state: string,
  date: string,
  title: string
): Promise<{ saved: Record<(typeof PDF_LANGS)[number], boolean>; errors: string[] }> {
  const saved = { jawi: false, rumi: false, english: false };
  const errors: string[] = [];

  for (const lang of PDF_LANGS) {
    const url = pdfs[lang];
    if (!url) continue;

    const dest = pdfPath(state, date, lang);
    if (existsSync(dest)) {
      saved[lang] = true;
      continue;
    }

    const ok = await downloadPdf(url, dest);
    if (ok) {
      saved[lang] = true;
    } else {
      errors.push(`${lang} PDF download failed: ${title}`);
    }
  }

  return { saved, errors };
}

export async function persistSermon({
  id,
  title,
  state,
  states,
  date,
  detailUrl,
  pdfs,
}: {
  id: string;
  title: string;
  state: string;
  states?: string[];
  date: string;
  detailUrl: string;
  pdfs: PdfSet;
}): Promise<{ status: "added" | "updated"; errors: string[] }> {
  const statesSql = states && states.length ? states.join(",") : null;
  const existing = findStmt.get(detailUrl);
  const { saved, errors } = await savePdfs(pdfs, state, date, title);

  const local = (lang: keyof PdfSet) =>
    saved[lang] ? pdfUrl(state, date, lang) : null;

  if (existing) {
    // Keep a previously working URL only if its file is still on disk.
    const keep = (lang: keyof PdfSet, old: string | null) =>
      local(lang) ??
      (old && existsSync(pdfPath(state, date, lang)) ? old : null);

    const effective: PdfSet = {
      jawi: keep("jawi", existing.pdf_jawi),
      rumi: keep("rumi", existing.pdf_rumi),
      english: keep("english", existing.pdf_english),
    };

    updateStmt.run(
      title,
      statesSql,
      effective.jawi,
      effective.rumi,
      effective.english,
      languageLabel(effective),
      existing.id
    );
    return { status: "updated", errors };
  }

  const effective: PdfSet = {
    jawi: local("jawi"),
    rumi: local("rumi"),
    english: local("english"),
  };

  insertStmt.run(
    id,
    title,
    state,
    statesSql,
    date,
    effective.jawi,
    effective.rumi,
    effective.english,
    languageLabel(effective),
    detailUrl
  );

  return { status: "added", errors };
}
