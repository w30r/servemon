import type { DbSummary } from "./db";

export type SermonDalil = {
  arabic: string;
  translation: string;
  source: string;
};

export type SermonSummary = {
  tldr: string;
  points: string[];
  dalils: SermonDalil[];
  lang: string;
  verified: boolean;
  generatedAt: string | null;
};

export type SummaryLang = "ms" | "en" | "zh" | "ta";

export const SUMMARY_LANGS: SummaryLang[] = ["ms", "en", "zh", "ta"];

export function isSummaryLang(value: string | null): value is SummaryLang {
  return !!value && (SUMMARY_LANGS as string[]).includes(value);
}

function parseJsonArray<T>(raw: string | null): T[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export function parseStoredSummary(row: DbSummary | null): SermonSummary | null {
  if (!row || row.status !== "ready" || !row.tldr) return null;

  const points = parseJsonArray<string>(row.points_json).filter(
    (p): p is string => typeof p === "string" && p.length > 0
  );
  const dalils = parseJsonArray<SermonDalil>(row.dalils_json).filter(
    (d) =>
      d &&
      typeof d.arabic === "string" &&
      typeof d.translation === "string" &&
      typeof d.source === "string"
  );

  return {
    tldr: row.tldr,
    points,
    dalils,
    lang: row.lang,
    verified: row.verified === 1,
    generatedAt: row.generated_at,
  };
}
