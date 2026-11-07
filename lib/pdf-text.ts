import { extractText } from "unpdf";

export type ExtractedPdf = {
  text: string;
  pages: number;
  characters: number;
};

/**
 * Reads the embedded text layer only. No OCR, no rendering. Khutbah PDFs are
 * small, so this is a few hundred milliseconds at worst.
 */
export async function extractPdfText(buffer: Buffer): Promise<ExtractedPdf> {
  const { text, totalPages } = await extractText(new Uint8Array(buffer), {
    mergePages: true,
  });

  const clean = text
    .replace(/\u0000/g, "")
    .replace(/\r/g, "")
    .replace(/[ \t]+\n/g, "\n")
    .trim();

  return {
    text: clean,
    pages: totalPages,
    characters: clean.replace(/\s+/g, "").length,
  };
}
