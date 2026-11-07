import { NextResponse } from "next/server";
import { getSermon, getSermonSummary } from "@/lib/db";
import {
  ensureSummary,
  SummaryBusyError,
  SummaryLimitError,
  SummaryUnavailableError,
} from "@/lib/summaries";
import {
  isSummaryLang,
  parseStoredSummary,
  type SummaryLang,
} from "@/lib/summary";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS = 10;
const buckets = new Map<string, { count: number; resetAt: number }>();

function clientIp(req: Request): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(ip);
  if (!bucket || bucket.resetAt < now) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  bucket.count++;
  return bucket.count > MAX_REQUESTS;
}

function langFrom(req: Request): SummaryLang | null {
  const value = new URL(req.url).searchParams.get("lang") ?? "ms";
  return isSummaryLang(value) ? value : null;
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lang = langFrom(req);
  if (!lang) {
    return NextResponse.json({ error: "invalid language" }, { status: 400 });
  }

  const row = getSermonSummary(id, lang);
  return NextResponse.json({
    status: row?.status ?? "none",
    summary: parseStoredSummary(row),
  });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const lang = langFrom(req);
  if (!lang) {
    return NextResponse.json({ error: "invalid language" }, { status: 400 });
  }

  const sermon = getSermon(id);
  if (!sermon) {
    return NextResponse.json({ error: "sermon not found" }, { status: 404 });
  }
  if (lang === "ms" && !sermon.pdf_rumi) {
    return NextResponse.json({ error: "no_rumi_pdf" }, { status: 400 });
  }

  if (rateLimited(clientIp(req))) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  try {
    const row = await ensureSummary(sermon, lang);
    return NextResponse.json({
      status: row.status,
      summary: parseStoredSummary(row),
    });
  } catch (e) {
    if (e instanceof SummaryBusyError) {
      return NextResponse.json({ status: "running" }, { status: 202 });
    }
    if (e instanceof SummaryLimitError) {
      return NextResponse.json(
        { error: "daily_limit_reached" },
        { status: 429 }
      );
    }
    if (e instanceof SummaryUnavailableError) {
      return NextResponse.json(
        { error: "summary_unavailable", detail: e.message },
        { status: 400 }
      );
    }
    console.error("Summary generation failed:", e);
    return NextResponse.json(
      { error: "generation_failed", detail: (e as Error).message },
      { status: 500 }
    );
  }
}
