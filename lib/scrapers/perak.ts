import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";
import { MONTHS } from "./months";

const BASE_URL = "https://jaipk.perak.gov.my";
const ARCHIVE_URL = `${BASE_URL}/index.php/sumber/arkib-khutbah-jumaat-2026`;
const STATE = "Perak";

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

function isWithinWindow(dateStr: string): boolean {
  const [day, month, year] = dateStr.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  return d >= CUTOFF;
}

/** Month slugs to scan, e.g. "september", "oktober", "november". */
function monthsInWindow(): Set<string> {
  const now = new Date();
  const names = [
    "januari",
    "februari",
    "mac",
    "april",
    "mei",
    "jun",
    "julai",
    "ogos",
    "september",
    "oktober",
    "november",
    "disember",
  ];
  const months = new Set<string>();
  for (let i = 0; i <= Math.min(SCRAPE_MONTHS, 11); i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.add(names[d.getMonth()]);
  }
  return months;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/^KHUTBAH\s+JUMAAT\s+MINGGU\s+\d+\s*-\s*/i, "")
    .replace(/\s*\((JAWI|RUMI)\)\s*$/i, "")
    .trim();
}

type Entry = {
  date: string;
  title: string;
  jawi: string | null;
  rumi: string | null;
};

export async function runPerakScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  const wanted = monthsInWindow();
  const monthPages = new Set<string>();

  try {
    const archive = cheerio.load(await fetchText(ARCHIVE_URL));
    archive('a[href*="/index.php/muat-turun/"]').each((_i, a) => {
      const href = archive(a).attr("href") || "";
      const m = href.match(/muat-turun\/\d+-khutbah-jumaat-\d{4}\/(\d+)-([a-z]+)$/i);
      if (!m) return;
      if (!wanted.has(m[2].toLowerCase())) return;
      monthPages.add(new URL(href, BASE_URL).href);
    });
  } catch (e) {
    return {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [`Archive fetch: ${(e as Error).message}`],
    };
  }

  const entries = new Map<string, Entry>();

  for (const pageUrl of monthPages) {
    let $: ReturnType<typeof cheerio.load>;
    try {
      $ = cheerio.load(await fetchText(pageUrl));
    } catch (e) {
      errors.push(`Month page: ${(e as Error).message}`);
      continue;
    }

    $(".pd-filenamebox-bt").each((_i, box) => {
      const title = $(box).find(".pd-title").text().trim();
      const link = $(box).find('a[href*="download="]').first();
      const href = link.attr("href");
      const filename = link.text().trim();
      if (!href || !filename) return;

      const lang = /\(JAWI\)\s*$/i.test(title)
        ? "jawi"
        : /\(RUMI\)\s*$/i.test(title)
          ? "rumi"
          : null;
      if (!lang) {
        skipped++;
        return;
      }

      const dm = filename.match(/Khutbah\s+Jumaat\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i);
      const month = dm ? MONTHS[dm[2].toLowerCase()] : undefined;
      if (!dm || !month) {
        skipped++;
        return;
      }
      const date = `${dm[1].padStart(2, "0")}/${month}/${dm[3]}`;
      if (!isWithinWindow(date)) {
        skipped++;
        return;
      }

      const entry = entries.get(date) ?? {
        date,
        title: cleanTitle(title),
        jawi: null,
        rumi: null,
      };
      entry[lang] = new URL(href, BASE_URL).href;
      if (!entry.title) entry.title = cleanTitle(title);
      entries.set(date, entry);
    });
  }

  for (const entry of entries.values()) {
    if (!entry.jawi && !entry.rumi) {
      skipped++;
      continue;
    }

    const pdfs: PdfSet = {
      jawi: entry.jawi,
      rumi: entry.rumi,
      english: null,
    };
    const detailUrl = `${BASE_URL}/index.php/sumber/arkib-khutbah-jumaat-2026`;
    const { status, errors: persistErrors } = await persistSermon({
      id: `${STATE.toLowerCase()}-${entry.date.replace(/\//g, "-")}`,
      title: entry.title || "Khutbah Jumaat",
      state: STATE,
      date: entry.date,
      detailUrl: `${detailUrl}#${entry.date}`,
      pdfs,
    });
    errors.push(...persistErrors);
    if (status === "added") added++;
    else updated++;
  }

  return { added, updated, skipped, errors };
}
