import type { SummaryLang } from "../summary";

export const PROMPT_VERSION = "summary-v2";

export const SUMMARY_SYSTEM_PROMPT = `Anda pembantu yang merumus teks khutbah Jumaat dalam Bahasa Melayu.

Peraturan:
- Gunakan hanya maklumat yang ada dalam teks khutbah yang diberikan. Jangan tambah fakta luar, tafsiran peribadi, atau rujukan yang tidak disebut.
- tldr: 2 hingga 3 ayat padat yang merumus keseluruhan khutbah.
- points: 3 hingga 5 isi utama. Satu ayat ringkas setiap satu.
- dalils: senaraikan SEMUA dalil (ayat Al-Quran atau hadis) yang disebut dalam teks. Salin teks Arab penuh secara verbatim, termasuk harakat, tanpa memendekkan atau mengubah perkataan. translation: terjemahan yang diberikan dalam teks, atau terjemahan tepat jika tiada. source: rujukan seperti yang dinyatakan dalam teks.
- Jika tiada dalil dalam teks, pulangkan senarai kosong.
- Jangan sekali-kali mencipta atau mengingat semula ayat Al-Quran atau hadis dari luar teks.
- Pulangkan JSON sahaja, tiada teks lain.

Bentuk JSON:
{"tldr":"...","points":["...","..."],"dalils":[{"arabic":"...","translation":"...","source":"..."}]}`;

export function summaryUserPrompt({
  title,
  state,
  date,
  text,
}: {
  title: string;
  state: string;
  date: string;
  text: string;
}): string {
  return `Tajuk khutbah: ${title}
Negeri: ${state}
Tarikh: ${date}

Teks khutbah:
"""
${text}
"""`;
}

const LANG_NAMES: Record<Exclude<SummaryLang, "ms">, string> = {
  en: "English",
  zh: "Simplified Chinese",
  ta: "Tamil",
};

export const TRANSLATE_SYSTEM_PROMPT = `Anda penterjemah profesional. Terjemah kandungan JSON yang diberikan ke bahasa sasaran.

Peraturan:
- Kekalkan maksud, nada, dan semua maklumat. Jangan tambah atau buang apa-apa.
- Terjemah sepenuhnya ke bahasa sasaran. Jangan tinggalkan perkataan Inggeris atau Melayu melainkan istilah yang memang tiada padanan.
- Kekalkan medan "arabic" dan "source" tanpa sebarang perubahan.
- Terjemah hanya "tldr", setiap item dalam "points", dan medan "translation" dalam "dalils".
- Pulangkan JSON yang sama bentuknya, tiada teks lain.

Bentuk JSON:
{"tldr":"...","points":["..."],"dalils":[{"arabic":"...","translation":"...","source":"..."}]}`;

export function translationUserPrompt({
  lang,
  payload,
}: {
  lang: Exclude<SummaryLang, "ms">;
  payload: unknown;
}): string {
  return `Bahasa sasaran: ${LANG_NAMES[lang]}

JSON sumber:
${JSON.stringify(payload)}`;
}
