import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";

const JAIS_LISTING = "https://e-khutbah.jais.gov.my/senarai-khutbah-jumaat/";
const BASE_URL = "https://e-khutbah.jais.gov.my";
const WP_MEDIA = "https://e-khutbah.jais.gov.my/wp-json/wp/v2/media";
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

type Media = { date: string; source_url: string };

function tokens(s: string): Set<string> {
  return new Set(
    s
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, " ")
      .split(" ")
      .filter((w) => w.length > 2)
  );
}

function classifyName(name: string): "jawi" | "rumi" | "english" | null {
  const n = name.toLowerCase();
  if (!n.endsWith(".pdf")) return null;
  if (n.startsWith("manual")) return null; // manual, not khutbah text
  if (n.includes("jawi")) return "jawi";
  if (n.includes("rumi")) return "rumi";
  if (n.includes("english") || n.includes("inggeris")) return "english";
  return null;
}

function isSlide(name: string): boolean {
  return name.toLowerCase().startsWith("s-");
}

function matchesTitle(name: string, title: string): boolean {
  const nameTokens = tokens(name);
  let overlap = 0;
  for (const t of tokens(title)) if (nameTokens.has(t)) overlap++;
  return overlap >= 2;
}

async function fetchMediaWindow(date: string): Promise<Media[]> {
  const [day, month, year] = date.split("/").map(Number);
  const iso = (d: Date) => d.toISOString().slice(0, 19);
  const after = new Date(year, month - 1, day - 3);
  const before = new Date(year, month - 1, day + 2);
  const url = `${WP_MEDIA}?after=${iso(after)}&before=${iso(before)}&per_page=100&orderby=date&order=desc`;
  try {
    const res = await fetch(url);
    if (!res.ok) return [];
    return (await res.json()) as Media[];
  } catch {
    return [];
  }
}

async function findPdfs(date: string, title: string): Promise<PdfSet> {
  const media = await fetchMediaWindow(date);
  const pdfs: PdfSet = { jawi: null, rumi: null, english: null };
  for (const m of media) {
    const name = decodeURIComponent(m.source_url.split("/").pop() || "");
    const lang = classifyName(name);
    if (!lang) continue;
    if (!matchesTitle(name, title)) continue;
    const current = pdfs[lang];
    // Prefer the plain khutbah file over the "S-" (slide) variant when both exist.
    if (!current || (isSlide(current) && !isSlide(name))) {
      pdfs[lang] = m.source_url;
    }
  }
  return pdfs;
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
    const pdfs = await findPdfs(row.date, row.title);

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