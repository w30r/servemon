import * as cheerio from "cheerio";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";
import { persistSermon, type PdfSet } from "./shared";
import { fetchText } from "./http";
import { MONTHS } from "./months";
import { pdfPath } from "../storage";

const BASE_URL = "https://muftiperlis.gov.my";
const LIST_URL = `${BASE_URL}/index.php/khutbah`;
const STATE = "Perlis";
const MAX_PAGES = 10;
const PAGE_SIZE = 20;

const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36";

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
    .replace(/\s*\([^)]*\d{4}\)\s*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseDate(text: string): string | null {
  const dm = text.match(/(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/);
  const month = dm ? MONTHS[dm[2].toLowerCase()] : undefined;
  if (!dm || !month) return null;
  return `${dm[1].padStart(2, "0")}/${month}/${dm[3]}`;
}

/**
 * Phoca Download hides the file behind a "license agree" POST form. The form
 * carries a CSRF token tied to a session cookie set on the detail page, so we
 * fetch the page, reuse its cookie + token, and post the form to get the PDF.
 */
async function fetchPerlisPdf(detailUrl: string): Promise<Buffer | null> {
  const pageRes = await fetch(detailUrl, {
    headers: { "user-agent": UA, accept: "text/html,*/*" },
    redirect: "follow",
  });
  if (!pageRes.ok) return null;
  const html = await pageRes.text();

  const setCookies =
    typeof pageRes.headers.getSetCookie === "function"
      ? pageRes.headers.getSetCookie()
      : [pageRes.headers.get("set-cookie") ?? ""];
  const cookie = setCookies
    .map((c) => c.split(";")[0].trim())
    .filter(Boolean)
    .join("; ");

  const form = html.match(/<form[^>]*phocadownloadform[\s\S]*?<\/form>/i)?.[0] ?? "";
  const token = form.match(
    /<input[^>]*type="hidden"[^>]*name="([0-9a-f]{32})"/i
  )?.[1];
  const fileId =
    form.match(/<input[^>]*name="download"[^>]*value="(\d+)"/i)?.[1] ??
    detailUrl.match(/\/file\/(\d+)-/)?.[1];
  if (!token || !fileId) return null;

  const body = new URLSearchParams({
    submit: "Download",
    license_agree: "1",
    download: fileId,
    [token]: "1",
  });

  const res = await fetch(detailUrl, {
    method: "POST",
    headers: {
      "user-agent": UA,
      "content-type": "application/x-www-form-urlencoded",
      referer: detailUrl,
      ...(cookie ? { cookie } : {}),
    },
    body: body.toString(),
    redirect: "follow",
  });
  if (!res.ok) return null;

  const buffer = Buffer.from(await res.arrayBuffer());
  if (!buffer.subarray(0, 1024).toString("latin1").includes("%PDF-")) {
    return null;
  }
  return buffer;
}

type Entry = {
  date: string;
  title: string;
  url: string;
};

export async function runPerlisScraper(): Promise<{
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
  const seen = new Set<string>();

  for (let page = 0; page < MAX_PAGES; page++) {
    const url =
      page === 0 ? LIST_URL : `${LIST_URL}?start=${page * PAGE_SIZE}`;

    let $: ReturnType<typeof cheerio.load>;
    try {
      $ = cheerio.load(await fetchText(url));
    } catch (e) {
      errors.push(`Listing page ${page + 1}: ${(e as Error).message}`);
      break;
    }

    const boxes = $(".pd-filebox");
    if (boxes.length === 0) break;

    let oldest = 0;

    boxes.each((_i, box) => {
      const link = $(box).find('a[href*="/index.php/khutbah/file/"]').first();
      const href = link.attr("href");
      if (!href) return;

      const absolute = new URL(href, BASE_URL).href;
      if (seen.has(absolute)) return;
      seen.add(absolute);

      const rawTitle = link.text().trim();
      const date = parseDate(rawTitle) ?? parseDate(href);
      if (!date) {
        skipped++;
        return;
      }

      const [day, month, year] = date.split("/").map(Number);
      const d = new Date(year, month - 1, day);
      if (!oldest || d.getTime() < oldest) oldest = d.getTime();

      if (!isWithinWindow(date)) {
        skipped++;
        return;
      }

      entries.set(date, {
        date,
        title: cleanTitle(rawTitle) || "Khutbah Jumaat",
        url: absolute,
      });
    });

    if (oldest && oldest < CUTOFF.getTime()) break;
  }

  for (const entry of entries.values()) {
    let buffer: Buffer | null = null;
    try {
      buffer = await fetchPerlisPdf(entry.url);
    } catch (e) {
      errors.push(`Download ${entry.title}: ${(e as Error).message}`);
    }

    if (!buffer) {
      skipped++;
      errors.push(`PDF download failed: ${entry.title}`);
      continue;
    }

    const dest = pdfPath(STATE, entry.date, "rumi");
    mkdirSync(path.dirname(dest), { recursive: true });
    writeFileSync(dest, buffer);

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
