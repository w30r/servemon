import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";

const JAIS_LISTING = "https://e-khutbah.jais.gov.my/senarai-khutbah-jumaat/";
const BASE_URL = "https://e-khutbah.jais.gov.my";
const UPLOADS = "https://e-khutbah.jais.gov.my/wp-content/uploads";
const STATE = "Selangor";

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

function parseDate(raw: string): string | null {
  const m = raw.trim().match(/^(\d{1,2})[./](\d{1,2})[./](\d{4})$/);
  if (!m) return null;
  const d = m[1].padStart(2, "0");
  const mo = m[2].padStart(2, "0");
  return `${d}/${mo}/${m[3]}`;
}

function isWithinWindow(dateStr: string): boolean {
  const [day, month, year] = dateStr.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  return d >= CUTOFF;
}

function constructPdfUrls(
  date: string,
  title: string
): PdfSet {
  const [day, month, year] = date.split("/");
  const dotDate = `${day}.${month}.${year}`;
  const mm = month;

  // JAWI/RUMI: ALL-CAPS with hyphens replacing spaces
  const upperTitle = title.toUpperCase().replace(/\s+/g, "-");
  // English: Title-Case with hyphens
  const titleCase = title
    .split(/[\s:]+/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join("-");

  return {
    jawi: `${UPLOADS}/${year}/${mm}/${dotDate}-JAWI-${upperTitle}.pdf`,
    rumi: `${UPLOADS}/${year}/${mm}/${dotDate}-RUMI-${upperTitle}.pdf`,
    english: `${UPLOADS}/${year}/${mm}/${titleCase}-${dotDate}-english.pdf`,
  };
}

export async function runJaisScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  const skipped = 0;

  const res = await fetch(JAIS_LISTING);
  if (!res.ok) {
    return { added: 0, updated: 0, skipped: 0, errors: [`Listing fetch failed: ${res.status}`] };
  }
  const html = await res.text();
  const $ = cheerio.load(html);

  type Row = { date: string; title: string; detailUrl: string };
  const seen = new Set<string>();
  const rows: Row[] = [];

  $("table tr").each((_i, el) => {
    const tds = $(el).find("td");
    if (tds.length < 4) return;

    const date = parseDate($(tds[2]).text());
    if (!date || !isWithinWindow(date)) return;

    const a = $(tds[3]).find("a").first();
    const href = a.attr("href");
    const title = a.text().trim();
    if (!href || !title) return;

    if (seen.has(href)) return;
    seen.add(href);

    rows.push({ date, title, detailUrl: new URL(href, BASE_URL).href });
  });

  for (const row of rows) {
    const pdfs = constructPdfUrls(row.date, row.title);

    const id = `${STATE.toLowerCase()}-${row.date.replace(/\//g, "-")}`;
    const { status, errors: persistErrors } = await persistSermon({
      id,
      title: row.title,
      state: STATE,
      date: row.date,
      detailUrl: row.detailUrl,
      pdfs,
    });
    errors.push(...persistErrors);
    if (status === "added") added++;
    else updated++;
  }

  return { added, updated, skipped, errors };
}