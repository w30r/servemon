import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";

const BASE_URL = "https://ekhutbah.terengganu.gov.my";
const WEEKLY_URL = `${BASE_URL}/mingguan`;
const STATE = "Terengganu";

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

function isWithinWindow(dateStr: string): boolean {
  const [day, month, year] = dateStr.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  return d >= CUTOFF;
}

type Entry = { date: string; title: string; jawi: string | null; rumi: string | null };

function parseSection(
  html: string,
  lang: "jawi" | "rumi",
  entries: Map<string, Entry>
): number {
  let skipped = 0;
  const $ = cheerio.load(html);

  $(".row.boxi").each((_i, box) => {
    const header = $(box).find(".col-md-8").first();
    const rawTitle = header.find("b").text().replace(/^Tajuk\s+Khutbah\s*:\s*/i, "");
    const dateText = header.text().match(/Tarikh\s+Dibaca\s*:\s*(\d{1,2})-(\d{1,2})-(\d{4})/i);
    const href = $(box).find('a[href$=".pdf"]').first().attr("href");

    if (!dateText || !href) {
      skipped++;
      return;
    }

    const date = `${dateText[1].padStart(2, "0")}/${dateText[2].padStart(2, "0")}/${dateText[3]}`;
    if (!isWithinWindow(date)) {
      skipped++;
      return;
    }

    const entry = entries.get(date) ?? {
      date,
      title: rawTitle.replace(/\s+/g, " ").trim(),
      jawi: null,
      rumi: null,
    };
    entry[lang] = new URL(href, BASE_URL).href;
    if (!entry.title) entry.title = rawTitle.replace(/\s+/g, " ").trim();
    entries.set(date, entry);
  });

  return skipped;
}

export async function runTerengganuScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  // The weekly page publishes only the current khutbah, in a "Versi Jawi"
  // section followed by "Versi Rumi". The archive has no language labels, so
  // this scraper captures each new week instead of backfilling.
  let html: string;
  try {
    html = await fetchText(WEEKLY_URL);
  } catch (e) {
    return {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [`Weekly page: ${(e as Error).message}`],
    };
  }

  const rumiAt = html.search(/Versi\s+Rumi/i);
  const entries = new Map<string, Entry>();
  skipped += parseSection(rumiAt >= 0 ? html.slice(0, rumiAt) : html, "jawi", entries);
  if (rumiAt >= 0) skipped += parseSection(html.slice(rumiAt), "rumi", entries);

  for (const entry of entries.values()) {
    if (!entry.jawi && !entry.rumi) {
      skipped++;
      continue;
    }

    const pdfs: PdfSet = { jawi: entry.jawi, rumi: entry.rumi, english: null };
    const { status, errors: persistErrors } = await persistSermon({
      id: `${STATE.toLowerCase()}-${entry.date.replace(/\//g, "-")}`,
      title: entry.title || "Khutbah Jumaat",
      state: STATE,
      date: entry.date,
      detailUrl: `${WEEKLY_URL}#${entry.date}`,
      pdfs,
    });
    errors.push(...persistErrors);
    if (status === "added") added++;
    else updated++;
  }

  return { added, updated, skipped, errors };
}
