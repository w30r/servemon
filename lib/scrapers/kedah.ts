import * as cheerio from "cheerio";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";

const KEDAH_PAGE = "https://dakwahjheaik.wixsite.com/home/copy-of-ebook";
const STATE = "Kedah";

const SCRAPE_MONTHS = Math.max(1, Number(process.env.SCRAPE_MONTHS || 3));

const CUTOFF = new Date();
CUTOFF.setMonth(CUTOFF.getMonth() - SCRAPE_MONTHS);
CUTOFF.setHours(0, 0, 0, 0);

const MONTHS: Record<string, string> = {
  jan: "01", feb: "02", mac: "03", apr: "04", mei: "05", jun: "06",
  jul: "07", julai: "07", ogos: "08", sep: "09", sept: "09", okt: "10",
  nov: "11", dis: "12", disember: "12",
};

function parseDate(text: string): string | null {
  // "28 OGOS 2026/15 RABIUL AWAL 1448H"
  const m = text.trim().match(/^(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
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

// Convert a Google Drive /view link to a direct download URL
function toDownloadUrl(driveUrl: string): string {
  const m = driveUrl.match(/\/file\/d\/([A-Za-z0-9_-]+)/);
  if (m) return `https://drive.google.com/uc?export=download&id=${m[1]}`;
  return driveUrl;
}

export async function runKedahScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  const skipped = 0;

  const html = await fetchText(KEDAH_PAGE);
  const $ = cheerio.load(html);
  const text = $("body").text();

  const dateMatch = text.match(/TARIKH\s*:\s*([^\n]+)/i) ||
    text.match(/TARIKH\s*:\s*(\d{1,2}\s+[A-Za-z]+\s+\d{4})/i);
  const rawDate = dateMatch ? dateMatch[1] : null;
  const date = rawDate ? parseDate(rawDate) : null;
  if (!date) {
    return { added: 0, updated: 0, skipped: 0, errors: ["Kedah: date not found on page"] };
  }
  if (!isWithinWindow(date)) {
    return { added: 0, updated: 0, skipped: 0, errors: [] };
  }

  let title = "Khutbah Jumaat Negeri Kedah";
  $("p, h1, h2, h3, span").each((_i, el) => {
    const t = $(el).text().trim();
    const m = t.match(/TAJUK\s*KUTBAH\s*:\s*(.+)/i);
    if (m) title = m[1].trim();
  });

  const driveUrls: string[] = [];
  $('a[href*="drive.google.com/file/d/"]').each((_i, a) => {
    const href = $(a).attr("href") || "";
    if (!driveUrls.includes(href)) driveUrls.push(href);
  });

  if (driveUrls.length === 0) {
    return { added: 0, updated: 0, skipped: 0, errors: ["Kedah: no drive links found"] };
  }

  // First drive link sits under the JAWI heading, second under RUMI
  const pdfs: PdfSet = { jawi: null, rumi: null, english: null };
  if (driveUrls[0]) pdfs.jawi = toDownloadUrl(driveUrls[0]);
  if (driveUrls[1]) pdfs.rumi = toDownloadUrl(driveUrls[1]);

  const id = `${STATE.toLowerCase()}-${date.replace(/\//g, "-")}`;
  const { status, errors: persistErrors } = await persistSermon({
    id,
    title,
    state: STATE,
    date,
    detailUrl: KEDAH_PAGE,
    pdfs,
  });
  errors.push(...persistErrors);
  if (status === "added") added++;
  else updated++;

  return { added, updated, skipped, errors };
}
