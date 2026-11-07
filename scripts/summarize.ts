import { db, getSermon, listSermons } from "../lib/db";
import { ensureSummary } from "../lib/summaries";
import {
  isSummaryLang,
  parseStoredSummary,
  type SummaryLang,
} from "../lib/summary";

async function main() {
  const id = process.argv[2];
  const langArg = process.argv[3] ?? "ms";

  if (!isSummaryLang(langArg)) {
    throw new Error(`Invalid language: ${langArg}. Use ms,en,zh,ta.`);
  }

  const sermon = id
    ? getSermon(id)
    : listSermons().find((s) => s.pdf_rumi);

  if (!sermon) throw new Error("Sermon not found");
  if (!sermon.pdf_rumi) throw new Error("Sermon has no Rumi PDF");

  const langs: SummaryLang[] = [langArg];
  for (const lang of langs) {
    console.log(`Generating ${lang} for ${sermon.id}…`);
    const started = Date.now();
    const row = await ensureSummary(sermon, lang);
    const summary = parseStoredSummary(row);
    console.log(`Done in ${((Date.now() - started) / 1000).toFixed(1)}s`);
    console.log(
      JSON.stringify(
        {
          tokens_in: row.tokens_in,
          tokens_out: row.tokens_out,
          verified: row.verified === 1,
          summary,
        },
        null,
        2
      )
    );
  }

  db.close();
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
