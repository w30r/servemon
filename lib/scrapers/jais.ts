import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";

const JAIS_LISTING = "https://e-khutbah.jais.gov.my/senarai-khutbah-jumaat/";
const BASE_URL = "https://e-khutbah.jais.gov.my";
const STATE = "Selangor";

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

function parseDate(raw: string): string | null {
  // Accept DD/MM/YYYY and DD.MM.YYYY; normalize to DD/MM/YYYY
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

type Lang = "jawi" | "rumi" | "english" | "manual" | "slide" | "unknown";

function classify(url: string): Lang {
  const name = decodeURIComponent(url.split("/").pop() || "").toLowerCase();
  if (name.startsWith("s-") || name.includes("slide")) return "slide";
  if (name.includes("manual")) return "manual";
  if (name.includes("jawi")) return "jawi";
  if (name.includes("rumi")) return "rumi";
  if (name.includes("english") || name.includes("inggeris")) return "english";
  return "unknown";
}

function extractPdfLinks(html: string): string[] {
  const $ = cheerio.load(html);
  const links: string[] = [];
  $("a[href]").each((_i, a) => {
    const href = $(a).attr("href") || "";
    if (!href.toLowerCase().endsWith(".pdf")) return;
    const abs = new URL(href, BASE_URL).href;
    if (!links.includes(abs)) links.push(abs);
  });
  return links;
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
  let skipped = 0;

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

    // Dedupe duplicate rows (same sermon listed multiple times)
    if (seen.has(href)) return;
    seen.add(href);

    rows.push({ date, title, detailUrl: new URL(href, BASE_URL).href });
  });

  for (const row of rows) {
    let detailHtml: string;
    try {
      const dr = await fetch(row.detailUrl);
      if (!dr.ok) {
        skipped++;
        errors.push(`Detail fetch ${dr.status}: ${row.detailUrl}`);
        continue;
      }
      detailHtml = await dr.text();
    } catch (e) {
      skipped++;
      errors.push(`Detail fetch error: ${row.detailUrl} — ${(e as Error).message}`);
      continue;
    }

    const pdfs: PdfSet = { jawi: null, rumi: null, english: null };
    const order: ("jawi" | "rumi" | "english")[] = ["jawi", "rumi", "english"];

    for (const url of extractPdfLinks(detailHtml)) {
      const lang = classify(url);
      if (lang === "jawi" || lang === "rumi" || lang === "english") {
        if (!pdfs[lang]) pdfs[lang] = url;
      } else if (lang === "unknown") {
        for (const slot of order) {
          if (!pdfs[slot]) {
            pdfs[slot] = url;
            break;
          }
        }
      }
    }

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