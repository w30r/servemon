import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";

const BASE_URL = "https://ekhutbah.ns.gov.my";
const STATE = "Negeri Sembilan";

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

const MONTH_ROUTES = [
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

/** Archive routes only take a month name, so scan the months in the window. */
function monthsInWindow(): string[] {
  const now = new Date();
  const months = new Set<string>();
  // +1 because the cutoff usually lands mid-month, so the partial month counts.
  for (let i = 0; i <= Math.min(SCRAPE_MONTHS, 11); i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    months.add(MONTH_ROUTES[d.getMonth()]);
  }
  return [...months];
}

function isWithinWindow(dateStr: string): boolean {
  const [day, month, year] = dateStr.split("/").map(Number);
  const d = new Date(year, month - 1, day);
  return d >= CUTOFF;
}

type Detail = {
  date: string;
  title: string;
  category: string;
  pdfHref: string | null;
};

function parseDetail(html: string): Detail | null {
  const $ = cheerio.load(html);

  const fields = new Map<string, string>();
  $("table tr").each((_i, tr) => {
    const tds = $(tr).find("td");
    if (tds.length < 2) return;
    const label = $(tds[0]).text().trim().toLowerCase();
    const value = $(tds[1]).text().trim();
    if (label) fields.set(label, value);
  });

  const rawDate = fields.get("tarikh") || "";
  const m = rawDate.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (!m) return null;
  const date = `${m[1].padStart(2, "0")}/${m[2].padStart(2, "0")}/${m[3]}`;

  const title = fields.get("tajuk") || "";
  const category = fields.get("kategori") || "";

  // Sidebar links to "khutbah kedua" PDFs share the same /upload/ prefix.
  const pdfHref =
    $('a[href*="/upload/"]')
      .map((_i, a) => $(a).attr("href") || "")
      .get()
      .find((href) => href && !href.includes("/upload/khutbah_kedua/")) ?? null;

  return {
    date,
    title,
    category,
    pdfHref: pdfHref ? new URL(pdfHref, BASE_URL).href : null,
  };
}

export async function runNegeriSembilanScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  const detailIds = new Set<string>();

  for (const month of monthsInWindow()) {
    let html: string;
    try {
      html = await fetchText(`${BASE_URL}/index.php?r=khutbah/${month}`);
    } catch (e) {
      errors.push(`Listing ${month}: ${(e as Error).message}`);
      continue;
    }

    const $ = cheerio.load(html);
    $('a[href*="khutbah/papar"]').each((_i, a) => {
      const href = $(a).attr("href") || "";
      const m = href.match(/id=(\d+)/);
      if (m) detailIds.add(m[1]);
    });
  }

  for (const id of detailIds) {
    const detailUrl = `${BASE_URL}/index.php?r=khutbah/papar&id=${id}`;

    let detail: Detail | null;
    try {
      detail = parseDetail(await fetchText(detailUrl));
    } catch (e) {
      skipped++;
      errors.push(`Detail ${id}: ${(e as Error).message}`);
      continue;
    }

    if (!detail || !detail.title || !detail.pdfHref) {
      skipped++;
      continue;
    }
    // MVP covers Friday sermons only; strip out khas / raya entries.
    if (detail.category.toLowerCase() !== "jumaat") {
      skipped++;
      continue;
    }
    if (!isWithinWindow(detail.date)) {
      skipped++;
      continue;
    }

    const pdfs: PdfSet = { jawi: null, rumi: detail.pdfHref, english: null };
    const { status, errors: persistErrors } = await persistSermon({
      id: `${STATE.toLowerCase().replace(/\s+/g, "-")}-${detail.date.replace(/\//g, "-")}`,
      title: detail.title,
      state: STATE,
      date: detail.date,
      detailUrl,
      pdfs,
    });
    errors.push(...persistErrors);
    if (status === "added") added++;
    else updated++;
  }

  return { added, updated, skipped, errors };
}
