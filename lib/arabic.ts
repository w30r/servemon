import type { SermonDalil } from "./summary";

/**
 * Strips harakat, tatweel, punctuation and repeated whitespace so a quote can
 * be compared against the extracted PDF text even when the model adds or drops
 * diacritics.
 */
export function normalizeArabic(input: string): string {
  return input
    .normalize("NFKC")
    .replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED]/g, "")
    .replace(/\u0640/g, "")
    .replace(/[\u200B-\u200D\uFEFF]/g, "")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function latinTokens(input: string): string[] {
  return input
    .toLowerCase()
    .normalize("NFKC")
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);
}

/**
 * Some PDFs store Arabic in visual order, so an exact Arabic substring match
 * fails even when the dalil is genuinely in the sermon. Verify in two ways:
 *
 * 1. Exact normalized Arabic substring (clean text layers).
 * 2. The Malay translation shares most of its content words with the source
 *    (garbled Arabic). This is the reliable signal for the PDFs we have seen.
 *
 * A dropped dalil is better than a mutated ayah.
 */
export function verifyDalils(
  dalils: SermonDalil[],
  sourceText: string
): { kept: SermonDalil[]; dropped: number } {
  const arabicHaystack = normalizeArabic(sourceText);
  const latinSet = new Set(latinTokens(sourceText));

  const kept = dalils.filter((dalil) => {
    const arabic = normalizeArabic(dalil.arabic);
    if (arabic.length < 8) return false;

    if (arabicHaystack.includes(arabic)) return true;

    const words = latinTokens(dalil.translation);
    if (words.length < 6) return false;

    const found = words.filter((word) => latinSet.has(word)).length;
    return found / words.length >= 0.75;
  });

  return { kept, dropped: dalils.length - kept.length };
}
