import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";

const JOHOR_LISTING = "https://jainj.johor.gov.my/khutbah/";
const BASE_URL = "https://jainj.johor.gov.my";
const STATE = "Johor";

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mac: "03", apr: "04", mei: "05", jun: "06",
  jul: "07", julai: "07", ogos: "08", sep: "09", sept: "09", okt: "10",
  nov: "11", dis: "12", disember: "12",
};

function parseDate(raw: string): string | null {
  // "7 OGOS 2026" / "28 OGOS 2026" -> DD/MM/YYYY
  const m = raw.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})$/);
  if (!m) return null;
  const month = MONTHS[m[2].toLowerCase()];
  if (!month) return null;
  return `${m[1].padStart(2, "0")}/${month}/${m[3]}`;
}

function isWithinWindow(dateStr: string): boolean {
  const [day, month, year] = dateStr.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  return d >= CUTOFF;
}

export async function runJohorScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  const res = await fetch(JOHOR_LISTING);
  if (!res.ok) {
    return { added: 0, updated: 0, skipped: 0, errors: [`Listing fetch failed: ${res.status}`] };
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  type Row = { date: string; title: string; pdfUrl: string };
  const rows: Row[] = [];

  $("table tr").each((_i, el) => {
    const tds = $(el).find("td");
    if (tds.length < 4) return;

    const date = parseDate($(tds[1]).text());
    if (!date) return;

    const title = $(tds[2]).text().trim();
    const a = $(tds[3]).find("a").first();
    const href = a.attr("href");
    if (!href || !title) return;

    const pdfUrl = new URL(href, BASE_URL).href;
    // skip non-PDF (e.g. link-only placeholders)
    if (!pdfUrl.toLowerCase().endsWith(".pdf")) return;

    rows.push({ date, title, pdfUrl });
  });

  // Dedupe by pdfUrl; new first not guaranteed, but page is newest-ish
  const seen = new Set<string>();
  for (const row of rows) {
    if (!isWithinWindow(row.date)) {
      skipped++;
      continue;
    }
    if (seen.has(row.pdfUrl)) {
      skipped++;
      continue;
    }
    seen.add(row.pdfUrl);

    const pdfs: PdfSet = { jawi: row.pdfUrl, rumi: null, english: null };
    const id = `${STATE.toLowerCase()}-${row.date.replace(/\//g, "-")}`;
    const { status, errors: persistErrors } = await persistSermon({
      id,
      title: row.title,
      state: STATE,
      date: row.date,
      detailUrl: row.pdfUrl,
      pdfs,
    });
    errors.push(...persistErrors);
    if (status === "added") added++;
    else updated++;
  }

  return { added, updated, skipped, errors };
}
