import { runJaisScraper } from "../lib/scrapers/jais";
import { runJakimScraper } from "../lib/scrapers/jakim";
import { runJohorScraper } from "../lib/scrapers/johor";
import { runKedahScraper } from "../lib/scrapers/kedah";
import { db, listSermons } from "../lib/db";

async function main() {
  const jais = await runJaisScraper();
  console.log("JAIS RESULT:", JSON.stringify(jais, null, 2));

  const jakim = await runJakimScraper();
  console.log("JAKIM RESULT:", JSON.stringify(jakim, null, 2));

  const johor = await runJohorScraper();
  console.log("JOHOR RESULT:", JSON.stringify(johor, null, 2));

  const kedah = await runKedahScraper();
  console.log("KEDAH RESULT:", JSON.stringify(kedah, null, 2));

  const rows = listSermons();
  console.log("DB ROWS:", rows.length);
  db.close();
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
