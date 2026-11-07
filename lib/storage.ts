import { mkdirSync, existsSync, writeFileSync, readFileSync } from "fs";
import path from "path";
import { homedir } from "os";
import { fetchBuffer } from "@/lib/scrapers/http";

const DATA_DIR = process.env.DATA_DIR || path.join(homedir(), ".servemon", "data");
export const PDF_DIR = process.env.PDF_DIR || path.join(DATA_DIR, "pdfs");
mkdirSync(PDF_DIR, { recursive: true });

export function pdfPath(
  state: string,
  date: string,
  lang: "jawi" | "rumi" | "english"
): string {
  const slug = `${state.toLowerCase()}-${date.replace(/\//g, "-")}-${lang}`;
  return path.join(PDF_DIR, state, `${slug}.pdf`);
}

export function pdfUrl(
  state: string,
  date: string,
  lang: "jawi" | "rumi" | "english"
): string {
  const slug = `${state.toLowerCase()}-${date.replace(/\//g, "-")}-${lang}`;
  return `/api/pdf/${state}/${slug}.pdf`;
}

export function resolvePdfPath(segments: string[]): string | null {
  if (!segments.length) return null;
  const resolved = path.resolve(PDF_DIR, ...segments);
  const allowed = path.resolve(PDF_DIR) + path.sep;
  if (!resolved.startsWith(allowed)) return null;
  return resolved;
}

export function readPdf(segments: string[]): Buffer | null {
  const abs = resolvePdfPath(segments);
  if (!abs) return null;
  try {
    return readFileSync(abs);
  } catch {
    return null;
  }
}

export async function downloadPdf(url: string, destPath: string): Promise<boolean> {
  const buffer = await fetchBuffer(url);
  if (!buffer) return false;
  // Reject HTML error pages / NAS share pages masquerading as a file.
  if (!buffer.subarray(0, 1024).toString("latin1").includes("%PDF-")) return false;
  const dir = path.dirname(destPath);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(destPath, buffer);
  return true;
}
