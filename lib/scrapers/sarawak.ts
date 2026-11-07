import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";
import { MONTHS } from "./months";

const BASE_URL = "https://mis.sarawak.gov.my";
const LIST_URL = `${BASE_URL}/web/subpage/announcement_list`;
const STATE = "Sarawak";

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

function isWithinWindow(dateStr: string): boolean {
  const [day, month, year] = dateStr.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  return d >= CUTOFF;
}

function cleanTitle(raw: string): string {
  return raw
    .replace(/&nbsp;/g, " ")
    .replace(/["'“”]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function runSarawakScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  const skipped = 0;

  // MIS only publishes the current week's khutbah as an announcement, so this
  // scraper captures each new week going forward (no deep archive).
  let detailUrl: string | null = null;
  try {
    const $list = cheerio.load(await fetchText(LIST_URL));
    const link = $list(".post-title a")
      .filter((_i, a) => /^KHUTBAH\s+JUMAAT/i.test($list(a).text().trim()))
      .first();
    detailUrl = link.attr("href") ?? null;
  } catch (e) {
    return {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [`Listing: ${(e as Error).message}`],
    };
  }

  if (!detailUrl) {
    return { added: 0, updated: 0, skipped: 0, errors: [] };
  }

  let $: ReturnType<typeof cheerio.load>;
  try {
    $ = cheerio.load(await fetchText(detailUrl));
  } catch (e) {
    return {
      added: 0,
      updated: 0,
      skipped: 0,
      errors: [`Detail: ${(e as Error).message}`],
    };
  }

  const heading = $(".list-title h1").first().text().trim();
  const dm = heading.match(
    /KHUTBAH\s+JUMAAT\s+(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/i
  );
  const month = dm ? MONTHS[dm[2].toLowerCase()] : undefined;
  if (!dm || !month) {
    return { added: 0, updated: 0, skipped: 1, errors: ["Sarawak: date not found"] };
  }

  const date = `${dm[1].padStart(2, "0")}/${month}/${dm[3]}`;
  if (!isWithinWindow(date)) {
    return { added: 0, updated: 0, skipped: 1, errors: [] };
  }

  const pdfLink = $(".list-content a[href*='attachment/show']").first();
  const href = pdfLink.attr("href");
  if (!href) {
    return { added: 0, updated: 0, skipped: 1, errors: ["Sarawak: PDF not found"] };
  }

  const title = cleanTitle(pdfLink.text()) || "Khutbah Jumaat";
  const pdfs: PdfSet = {
    jawi: null,
    rumi: new URL(href, BASE_URL).href,
    english: null,
  };

  const result = await persistSermon({
    id: `${STATE.toLowerCase()}-${date.replace(/\//g, "-")}`,
    title,
    state: STATE,
    date,
    detailUrl,
    pdfs,
  });
  errors.push(...result.errors);
  if (result.status === "added") added++;
  else updated++;

  return { added, updated, skipped, errors };
}
