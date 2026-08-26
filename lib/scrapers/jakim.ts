import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";

const JAKIM_LISTING = "https://www.islam.gov.my/ms/e-khutbah";
const BASE_URL = "https://www.islam.gov.my";
// JAKIM publishes the federal reference khutbah used in all three federal territories
const STATE = "Kuala Lumpur";
const STATES = ["Kuala Lumpur", "Putrajaya", "Labuan"];
const PAGE_SIZE = 10;

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));
const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mac: "03", apr: "04", mei: "05", jun: "06",
  jul: "07", julai: "07", ogos: "08", sep: "09", sept: "09", okt: "10",
  nov: "11", dis: "12", disember: "12",
};

function parseDateFromUrl(url: string): string | null {
  // .../khutbah-jumaat-21-ogos-2026-sedar-sebelum-sesal
  const m = url.match(/khutbah-jumaat-(\d{1,2})-([a-z]+)-(\d{4})/);
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

function extractDetailUrls(html: string, $: ReturnType<typeof cheerio.load>): string[] {
  const urls: string[] = [];
  $("a[href]").each((_i, a) => {
    const href = $(a).attr("href") || "";
    if (!/\/ms\/e-khutbah\/\d+-khutbah-jumaat-/.test(href)) return;
    const abs = new URL(href, BASE_URL).href;
    if (!urls.includes(abs)) urls.push(abs);
  });
  return urls;
}

function classify(url: string): keyof PdfSet | null {
  const name = decodeURIComponent(url.split("/").pop() || "").toLowerCase();
  if (name.includes("jawi")) return "jawi";
  if (name.includes("khutbah")) return "rumi";
  return null;
}

export async function runJakimScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  let start = 0;
  let reachedCutoff = false;

  while (!reachedCutoff) {
    let pageHtml: string;
    try {
      pageHtml = await fetchText(`${JAKIM_LISTING}?start=${start}`);
    } catch (e) {
      errors.push(`Listing page ${start}: ${(e as Error).message}`);
      break;
    }

    const $ = cheerio.load(pageHtml);
    const urls = extractDetailUrls(pageHtml, $);
    if (urls.length === 0) break;

    let pageHasWindowed = false;

    for (const detailUrl of urls) {
      const date = parseDateFromUrl(detailUrl);
      if (!date) {
        skipped++;
        continue;
      }
      if (!isWithinWindow(date)) {
        reachedCutoff = true; // pages are newest-first; stop at first out-of-window
        continue;
      }
      pageHasWindowed = true;

      let detailHtml: string;
      try {
        detailHtml = await fetchText(detailUrl);
      } catch (e) {
        skipped++;
        errors.push(`Detail fetch error: ${detailUrl} — ${(e as Error).message}`);
        continue;
      }

      const dl = cheerio.load(detailHtml);
      const pdfs: PdfSet = { jawi: null, rumi: null, english: null };

      dl("a[href]").each((_i, a) => {
        const href = dl(a).attr("href") || "";
        if (!href.toLowerCase().endsWith(".pdf")) return;
        const lang = classify(new URL(href, BASE_URL).href);
        if (lang) {
          const abs = new URL(href, BASE_URL).href;
          if (!pdfs[lang]) pdfs[lang] = abs;
        }
      });

      const title = dl('meta[property="og:title"]').attr("content") ||
        dl("title").text().replace(/^Portal Rasmi JAKIM - /, "").trim();
      const cleanTitle = (title || detailUrl.split("/").pop() || "")
        .replace(/^KHUTBAH JUMAAT \d{1,2} [A-Z]+ \d{4} - /i, "")
        .trim();

      const id = `kuala-lumpur-${date.replace(/\//g, "-")}`;
      const { status, errors: persistErrors } = await persistSermon({
        id,
        title: cleanTitle || title,
        state: STATE,
        states: STATES,
        date,
        detailUrl,
        pdfs,
      });
      errors.push(...persistErrors);
      if (status === "added") added++;
      else updated++;
    }

    if (!pageHasWindowed) reachedCutoff = true;
    start += PAGE_SIZE;
  }

  return { added, updated, skipped, errors };
}
