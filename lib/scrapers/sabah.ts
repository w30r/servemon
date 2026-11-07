import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";

const BASE_URL = "https://jheains.sabah.gov.my";
const LISTING_URL = `${BASE_URL}/khutbah-jumaat`;
const STATE = "Sabah";
const MAX_PAGES = 20;

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

function isoToDmy(iso: string): string | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (!m) return null;
  return `${m[3]}/${m[2]}/${m[1]}`;
}

function isWithinWindow(dateStr: string): boolean {
  const [day, month, year] = dateStr.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  return d >= CUTOFF;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^["'“”]+|["'“”]+$/g, "")
    .trim();
}

export async function runSabahScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  const entries = new Map<
    string,
    { date: string; title: string; pdf: string }
  >();

  let reachedCutoff = false;

  for (let page = 0; page < MAX_PAGES && !reachedCutoff; page++) {
    const url = page === 0 ? LISTING_URL : `${LISTING_URL}?page=${page}`;

    let $: ReturnType<typeof cheerio.load>;
    try {
      $ = cheerio.load(await fetchText(url));
    } catch (e) {
      errors.push(`Listing page ${page}: ${(e as Error).message}`);
      break;
    }

    const items = $("li").filter((_i, li) => $(li).find("time[datetime]").length > 0);
    if (items.length === 0) break;

    items.each((_i, li) => {
      const iso = $(li).find("time[datetime]").first().attr("datetime") || "";
      const date = isoToDmy(iso);
      const link = $(li).find('h2 a[href$=".pdf"]').first();
      const href = link.attr("href");
      const title = cleanTitle(link.text());

      if (!date || !href || !title) {
        skipped++;
        return;
      }
      if (!isWithinWindow(date)) {
        reachedCutoff = true;
        skipped++;
        return;
      }

      const key = date;
      if (!entries.has(key)) {
        entries.set(key, {
          date,
          title,
          pdf: new URL(href, BASE_URL).href,
        });
      }
    });
  }

  for (const entry of entries.values()) {
    const pdfs: PdfSet = { jawi: null, rumi: entry.pdf, english: null };
    const { status, errors: persistErrors } = await persistSermon({
      id: `${STATE.toLowerCase()}-${entry.date.replace(/\//g, "-")}`,
      title: entry.title,
      state: STATE,
      date: entry.date,
      detailUrl: `${LISTING_URL}#${entry.date}`,
      pdfs,
    });
    errors.push(...persistErrors);
    if (status === "added") added++;
    else updated++;
  }

  return { added, updated, skipped, errors };
}
