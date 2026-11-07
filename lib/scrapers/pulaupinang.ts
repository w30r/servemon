import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";

const BASE_URL = "https://jaipp.penang.gov.my";
const STATE = "Pulau Pinang";

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

const MONTH_SLUGS = [
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

function isWithinWindow(dateStr: string): boolean {
  const [day, month, year] = dateStr.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  return d >= CUTOFF;
}

function wantedMonths(): Set<string> {
  const now = new Date();
  const months = new Set<string>();
  for (let i = 0; i <= Math.min(SCRAPE_MONTHS, 11); i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.add(MONTH_SLUGS[d.getMonth()]);
  }
  return months;
}

type Entry = {
  date: string;
  title: string;
  jawi: string | null;
  rumi: string | null;
};

function parseTitle(raw: string): { title: string; date: string } | null {
  // "JAWI  Teks Khutbah 02 10 2026  Bersih Diri, Hormati Rumah Allah"
  const m = raw.match(/(\d{1,2})\s+(\d{1,2})\s+(\d{4})\s*(.*)$/);
  if (!m) return null;
  const date = `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[3]}`;
  const title = m[4].replace(/\s+/g, " ").trim();
  return { title, date };
}

export async function runPulauPinangScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  const year = new Date().getFullYear();
  const wanted = wantedMonths();
  const monthPages = new Set<string>();

  try {
    const yearPage = cheerio.load(
      await fetchText(`${BASE_URL}/index.php/teks-khutbah/${year}`)
    );
    yearPage(`a[href*="/teks-khutbah/${year}/"]`).each((_i, a) => {
      const href = yearPage(a).attr("href") || "";
      const m = href.match(/\/teks-khutbah\/\d{4}\/(?:teks-)?khutbah-([a-z]+)-\d{4}$/i);
      if (!m) return;
      if (!wanted.has(m[1].toLowerCase())) return;
      monthPages.add(new URL(href, BASE_URL).href);
    });
  } catch (e) {
    return {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [`Year listing: ${(e as Error).message}`],
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

    $('a[href*="/file"]').each((_i, a) => {
      const label = $(a).attr("data-title") || $(a).attr("title") || "";
      const href = $(a).attr("href");
      if (!href || !label) return;

      const lang = /^jawi\b/i.test(label)
        ? "jawi"
        : /^rumi\b/i.test(label)
          ? "rumi"
          : null;
      if (!lang) {
        skipped++;
        return;
      }

      const parsed = parseTitle(label);
      if (!parsed || !isWithinWindow(parsed.date)) {
        skipped++;
        return;
      }

      const entry = entries.get(parsed.date) ?? {
        date: parsed.date,
        title: parsed.title,
        jawi: null,
        rumi: null,
      };
      entry[lang] = new URL(href, BASE_URL).href;
      if (parsed.title) entry.title = parsed.title;
      entries.set(parsed.date, entry);
    });
  }

  for (const entry of entries.values()) {
    if (!entry.jawi && !entry.rumi) {
      skipped++;
      continue;
    }

    const pdfs: PdfSet = { jawi: entry.jawi, rumi: entry.rumi, english: null };
    const { status, errors: persistErrors } = await persistSermon({
      id: `${STATE.toLowerCase().replace(/\s+/g, "-")}-${entry.date.replace(/\//g, "-")}`,
      title: entry.title || "Khutbah Jumaat",
      state: STATE,
      date: entry.date,
      detailUrl: `${BASE_URL}/index.php/teks-khutbah/${year}#${entry.date}`,
      pdfs,
    });
    errors.push(...persistErrors);
    if (status === "added") added++;
    else updated++;
  }

  return { added, updated, skipped, errors };
}
