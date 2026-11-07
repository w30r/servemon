import * as cheerio from "cheerio";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";
import { MONTHS } from "./months";
import { pdfPath } from "../storage";

const BASE_URL = "https://masjid.e-maik.my";
const LIST_URL = `${BASE_URL}/public-khutbah`;
const STATE = "Kelantan";
const MAX_PAGES = 20;

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
    .replace(/^Siri\s+\d+\s*\/\s*\d{4}\s*-\s*/i, "")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Khutbah PDFs are hosted on a Synology NAS. A share page is HTML; the actual
 * file needs a `sharing_sid` cookie from the sharing login API, then
 * /fsdownload/<shareId>/<filename>.
 */
async function fetchNasPdf(
  shareId: string
): Promise<{ buffer: Buffer; filename: string } | null> {
  const api = "https://cloud.e-maik.my/webapi/entry.cgi";

  const sessionRes = await fetch(
    `${api}?api=SYNO.Core.Sharing.Session&version=1&method=get&sharing_id=%22${shareId}%22&sharing_status=%22none%22`
  );
  if (!sessionRes.ok) return null;
  const sessionText = await sessionRes.text();

  const filenameMatch = sessionText.match(/"filename"\s*:\s*"([^"]+)"/);
  if (!filenameMatch) return null;
  const filename = filenameMatch[1];

  const loginRes = await fetch(
    `${api}?api=SYNO.Core.Sharing.Login&version=1&method=login&sharing_id=%22${shareId}%22`,
    { redirect: "manual" }
  );
  const cookies =
    typeof loginRes.headers.getSetCookie === "function"
      ? loginRes.headers.getSetCookie()
      : [loginRes.headers.get("set-cookie") ?? ""];
  const sid = cookies
    .join(";")
    .match(/sharing_sid=([^;]+)/)?.[1];
  if (!sid) return null;

  const fileRes = await fetch(
    `https://cloud.e-maik.my/fsdownload/${shareId}/${encodeURIComponent(filename)}`,
    { headers: { cookie: `sharing_sid=${sid}` } }
  );
  if (!fileRes.ok) return null;

  const buffer = Buffer.from(await fileRes.arrayBuffer());
  if (!buffer.subarray(0, 1024).toString("latin1").includes("%PDF-")) {
    return null;
  }
  return { buffer, filename };
}

type Entry = {
  date: string;
  title: string;
  shareId: string;
  url: string;
};

export async function runKelantanScraper(): Promise<{
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
}> {
  const errors: string[] = [];
  let added = 0;
  let updated = 0;
  let skipped = 0;

  const entries = new Map<string, Entry>();
  const seenShares = new Set<string>();

  for (let page = 0; page < MAX_PAGES; page++) {
    const url = page === 0 ? LIST_URL : `${LIST_URL}?page=${page + 1}`;

    let $: ReturnType<typeof cheerio.load>;
    try {
      $ = cheerio.load(await fetchText(url));
    } catch (e) {
      errors.push(`Listing page ${page + 1}: ${(e as Error).message}`);
      break;
    }

    const rows = $(".row.border-bottom");
    if (rows.length === 0) break;

    let newOnPage = 0;

    rows.each((_i, row) => {
      const links = $(row)
        .find('a[href*="cloud.e-maik.my/sharing/"]')
        .toArray();
      const link =
        links.find((a) => !/multimedia/i.test($(a).text())) ?? links[0];
      const href = link ? $(link).attr("href") : null;
      if (!href) {
        skipped++;
        return;
      }

      const shareId = href.match(/\/sharing\/([A-Za-z0-9_-]+)/)?.[1];
      if (!shareId) {
        skipped++;
        return;
      }
      if (seenShares.has(shareId)) return;
      seenShares.add(shareId);
      newOnPage++;

      const rowText = $(row).text();
      const dm = rowText.match(
        /Bacaan\s+pada\s*:\s*(\d{1,2})-([A-Za-z]+)-(\d{4})/i
      );
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

      const rawTitle = $(row)
        .find("p")
        .filter((_j, p) => /Siri\s+\d+/i.test($(p).text()))
        .first()
        .text();
      const title = cleanTitle(rawTitle);

      entries.set(date, {
        date,
        title: title || "Khutbah Jumaat",
        shareId,
        url: href.startsWith("http") ? href : new URL(href, BASE_URL).href,
      });
    });

    if (newOnPage === 0) break;
  }

  for (const entry of entries.values()) {
    let pdf = null;
    try {
      pdf = await fetchNasPdf(entry.shareId);
    } catch (e) {
      errors.push(`NAS ${entry.shareId}: ${(e as Error).message}`);
    }

    if (!pdf) {
      skipped++;
      errors.push(`PDF download failed: ${entry.title}`);
      continue;
    }

    const dest = pdfPath(STATE, entry.date, "rumi");
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, pdf.buffer);

    const pdfs: PdfSet = { jawi: null, rumi: entry.url, english: null };
    const { status, errors: persistErrors } = await persistSermon({
      id: `${STATE.toLowerCase()}-${entry.date.replace(/\//g, "-")}`,
      title: entry.title,
      state: STATE,
      date: entry.date,
      detailUrl: entry.url,
      pdfs,
    });
    errors.push(...persistErrors);
    if (status === "added") added++;
    else updated++;
  }

  return { added, updated, skipped, errors };
}
