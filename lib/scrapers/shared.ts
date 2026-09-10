import { downloadPdf, pdfPath, pdfUrl } from "../storage";
import { existsSync } from "fs";
import { db } from "../db";

export type PdfSet = {
  jawi: string | null;
  rumi: string | null;
  english: string | null;
};

const findStmt = db.prepare<[string], { id: string }>(
  "SELECT id FROM sermons WHERE source_url = ?"
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
  const errors: string[] = [];
  const language = languageLabel(pdfs);
  const statesSql = states && states.length ? states.join(",") : null;
  const local = (lang: keyof PdfSet) => (pdfs[lang] ? pdfUrl(state, date, lang) : null);

  const existing = findStmt.get(detailUrl);
  if (existing) {
    updateStmt.run(
      title,
      statesSql,
      local("jawi"),
      local("rumi"),
      local("english"),
      language,
      existing.id
    );
    for (const lang of ["jawi", "rumi", "english"] as const) {
      const url = pdfs[lang];
      if (!url) continue;
      const dest = pdfPath(state, date, lang);
      if (existsSync(dest)) continue;
      const ok = await downloadPdf(url, dest);
      if (!ok) errors.push(`${lang} PDF download failed: ${title}`);
    }
    return { status: "updated", errors };
  }

  insertStmt.run(
    id,
    title,
    state,
    statesSql,
    date,
    local("jawi"),
    local("rumi"),
    local("english"),
    language,
    detailUrl
  );

  for (const lang of ["jawi", "rumi", "english"] as const) {
    const url = pdfs[lang];
    if (!url) continue;
    const ok = await downloadPdf(url, pdfPath(state, date, lang));
    if (!ok) errors.push(`${lang} PDF download failed: ${title}`);
  }

  return { status: "added", errors };
}
