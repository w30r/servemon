import { createHash } from "crypto";
import { existsSync, readFileSync } from "fs";
import {
  claimSermonSummary,
  countSummariesToday,
  failSermonSummary,
  getSermonSummary,
  saveSermonSummary,
  type DbSermon,
  type DbSummary,
} from "./db";
import { convertJson } from "./ai/parse";
import { deepseekJson, SUMMARY_MODEL } from "./ai/deepseek";
import {
  PROMPT_VERSION,
  SUMMARY_SYSTEM_PROMPT,
  TRANSLATE_SYSTEM_PROMPT,
  summaryUserPrompt,
  translationUserPrompt,
} from "./ai/prompts";
import { summaryContentSchema } from "./ai/schema";
import { verifyDalils } from "./arabic";
import { extractPdfText } from "./pdf-text";
import { pdfPath } from "./storage";
import type { SermonDalil, SummaryLang } from "./summary";

const DAILY_LIMIT = Math.max(
  0,
  Number(process.env.SUMMARY_DAILY_LIMIT || 60)
);

const MIN_TEXT_CHARACTERS = 400;

export class SummaryBusyError extends Error {
  constructor() {
    super("summary is already being generated");
  }
}

export class SummaryUnavailableError extends Error {}

export class SummaryLimitError extends Error {
  constructor() {
    super("daily summary limit reached");
  }
}

function pdfHash(sermon: DbSermon): string | null {
  const path = pdfPath(sermon.state, sermon.date, "rumi");
  if (!existsSync(path)) return null;
  try {
    return createHash("sha256").update(readFileSync(path)).digest("hex");
  } catch {
    return null;
  }
}

async function ensureMalay(sermon: DbSermon): Promise<DbSummary> {
  const hash = pdfHash(sermon);
  if (!hash) {
    throw new SummaryUnavailableError("no Rumi PDF for this sermon");
  }

  const cached = getSermonSummary(sermon.id, "ms");
  if (
    cached?.status === "ready" &&
    cached.source_pdf_hash === hash &&
    cached.prompt_version === PROMPT_VERSION
  ) {
    return cached;
  }

  if (DAILY_LIMIT > 0 && countSummariesToday() >= DAILY_LIMIT) {
    throw new SummaryLimitError();
  }

  const claim = claimSermonSummary(sermon.id, "ms", hash);
  if (claim === "ready") {
    const ready = getSermonSummary(sermon.id, "ms");
    if (ready) return ready;
  }
  if (claim === "busy") throw new SummaryBusyError();

  try {
    const path = pdfPath(sermon.state, sermon.date, "rumi");
    const { text, characters } = await extractPdfText(readFileSync(path));

    if (characters < MIN_TEXT_CHARACTERS) {
      throw new SummaryUnavailableError(
        "PDF text layer is empty or too short"
      );
    }

    const { raw, tokensIn, tokensOut } = await deepseekJson([
      { role: "system", content: SUMMARY_SYSTEM_PROMPT },
      {
        role: "user",
        content: summaryUserPrompt({
          title: sermon.title,
          state: sermon.state,
          date: sermon.date,
          text,
        }),
      },
    ]);

    const parsed = summaryContentSchema.safeParse(convertJson(raw));
    if (!parsed.success) {
      throw new Error("Model returned invalid summary JSON");
    }

    const { kept, dropped } = verifyDalils(parsed.data.dalils, text);

    saveSermonSummary({
      sermonId: sermon.id,
      lang: "ms",
      sourceKind: "text",
      tldr: parsed.data.tldr,
      points: parsed.data.points,
      dalils: kept,
      model: SUMMARY_MODEL,
      promptVersion: PROMPT_VERSION,
      verified: dropped === 0,
      tokensIn,
      tokensOut,
    });
  } catch (e) {
    failSermonSummary(sermon.id, "ms", (e as Error).message);
    throw e;
  }

  const saved = getSermonSummary(sermon.id, "ms");
  if (!saved || saved.status !== "ready") {
    throw new Error("summary was not saved");
  }
  return saved;
}

async function ensureTranslation(
  sermon: DbSermon,
  lang: Exclude<SummaryLang, "ms">,
  source: DbSummary
): Promise<DbSummary> {
  const hash = source.source_pdf_hash ?? "";
  const cached = getSermonSummary(sermon.id, lang);
  if (
    cached?.status === "ready" &&
    cached.source_pdf_hash === hash &&
    cached.prompt_version === PROMPT_VERSION
  ) {
    return cached;
  }

  if (DAILY_LIMIT > 0 && countSummariesToday() >= DAILY_LIMIT) {
    throw new SummaryLimitError();
  }

  const claim = claimSermonSummary(sermon.id, lang, hash);
  if (claim === "ready") {
    const ready = getSermonSummary(sermon.id, lang);
    if (ready) return ready;
  }
  if (claim === "busy") throw new SummaryBusyError();

  try {
    const points = JSON.parse(source.points_json ?? "[]") as string[];
    const dalils = JSON.parse(source.dalils_json ?? "[]") as SermonDalil[];
    const { raw, tokensIn, tokensOut } = await deepseekJson([
      { role: "system", content: TRANSLATE_SYSTEM_PROMPT },
      {
        role: "user",
        content: translationUserPrompt({
          lang,
          payload: { tldr: source.tldr, points, dalils },
        }),
      },
    ]);

    const parsed = summaryContentSchema.safeParse(convertJson(raw));
    if (!parsed.success) {
      throw new Error("Model returned invalid translation JSON");
    }
    if (
      parsed.data.points.length !== points.length ||
      parsed.data.dalils.length !== dalils.length
    ) {
      throw new Error("Translation changed the number of points or dalils");
    }

    const translatedDalils = dalils.map((dalil, i) => ({
      arabic: dalil.arabic,
      source: dalil.source,
      translation: parsed.data.dalils[i].translation,
    }));

    saveSermonSummary({
      sermonId: sermon.id,
      lang,
      sourceKind: "translation",
      tldr: parsed.data.tldr,
      points: parsed.data.points,
      dalils: translatedDalils,
      model: SUMMARY_MODEL,
      promptVersion: PROMPT_VERSION,
      verified: source.verified === 1,
      tokensIn,
      tokensOut,
    });
  } catch (e) {
    failSermonSummary(sermon.id, lang, (e as Error).message);
    throw e;
  }

  const saved = getSermonSummary(sermon.id, lang);
  if (!saved || saved.status !== "ready") {
    throw new Error("translation was not saved");
  }
  return saved;
}

export async function ensureSummary(
  sermon: DbSermon,
  lang: SummaryLang
): Promise<DbSummary> {
  if (lang === "ms") return ensureMalay(sermon);

  const source = await ensureMalay(sermon);
  return ensureTranslation(sermon, lang, source);
}
