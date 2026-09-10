import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { runJaisScraper } from "@/lib/scrapers/jais";
import { runJakimScraper } from "@/lib/scrapers/jakim";
import { runJohorScraper } from "@/lib/scrapers/johor";
import { runKedahScraper } from "@/lib/scrapers/kedah";

export type ScraperResult = {
  added: number;
  updated: number;
  skipped: number;
  errors: string[];
};

export type AllScrapersResult = {
  jais: ScraperResult;
  jakim: ScraperResult;
  johor: ScraperResult;
  kedah: ScraperResult;
};

const COOKIE_NAME = "devtool_auth";
const SESSION_TTL = 60 * 60; // 1h

function hmac(value: string): string {
  const secret = process.env.ADMIN_PASSWORD || "";
  return createHmac("sha256", secret).update(value).digest("hex");
}

export function verifyPassword(candidate: string): boolean {
  const expected = process.env.ADMIN_PASSWORD || "";
  if (!expected) return false;
  const a = Buffer.from(candidate);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function issueSession(): Promise<void> {
  const store = await cookies();
  const value = `${Date.now()}`;
  store.set(COOKIE_NAME, `${value}.${hmac(value)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL,
  });
}

export async function isAuthed(): Promise<boolean> {
  const store = await cookies();
  const raw = store.get(COOKIE_NAME)?.value;
  if (!raw) return false;
  const [value, sig] = raw.split(".");
  if (!value || !sig) return false;
  const expected = hmac(value);
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  const age = Date.now() - Number(value);
  return !Number.isNaN(age) && age > 0 && age < SESSION_TTL * 1000;
}

export async function runAllScrapers(): Promise<AllScrapersResult> {
  const [jais, jakim, johor, kedah] = await Promise.all([
    runJaisScraper(),
    runJakimScraper(),
    runJohorScraper(),
    runKedahScraper(),
  ]);
  return { jais, jakim, johor, kedah };
}
