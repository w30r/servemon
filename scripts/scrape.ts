import { runJaisScraper } from "../lib/scrapers/jais";
import { runJakimScraper } from "../lib/scrapers/jakim";
import { runJohorScraper } from "../lib/scrapers/johor";
import { runKedahScraper } from "../lib/scrapers/kedah";
import { runKelantanScraper } from "../lib/scrapers/kelantan";
import { runNegeriSembilanScraper } from "../lib/scrapers/negerisembilan";
import { runPerakScraper } from "../lib/scrapers/perak";
import { runPerlisScraper } from "../lib/scrapers/perlis";
import { runPulauPinangScraper } from "../lib/scrapers/pulaupinang";
import { runSabahScraper } from "../lib/scrapers/sabah";
import { runSarawakScraper } from "../lib/scrapers/sarawak";
import { runTerengganuScraper } from "../lib/scrapers/terengganu";
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

  const kelantan = await runKelantanScraper();
  console.log("KELANTAN RESULT:", JSON.stringify(kelantan, null, 2));

  const negerisembilan = await runNegeriSembilanScraper();
  console.log("NEGERI SEMBILAN RESULT:", JSON.stringify(negerisembilan, null, 2));

  const perak = await runPerakScraper();
  console.log("PERAK RESULT:", JSON.stringify(perak, null, 2));

  const perlis = await runPerlisScraper();
  console.log("PERLIS RESULT:", JSON.stringify(perlis, null, 2));

  const pulaupinang = await runPulauPinangScraper();
  console.log("PULAU PINANG RESULT:", JSON.stringify(pulaupinang, null, 2));

  const sabah = await runSabahScraper();
  console.log("SABAH RESULT:", JSON.stringify(sabah, null, 2));

  const sarawak = await runSarawakScraper();
  console.log("SARAWAK RESULT:", JSON.stringify(sarawak, null, 2));

  const terengganu = await runTerengganuScraper();
  console.log("TERENGGANU RESULT:", JSON.stringify(terengganu, null, 2));

  const rows = listSermons();
  console.log("DB ROWS:", rows.length);
  db.close();
}

main().catch((e) => {
  console.error("FAILED:", e);
  process.exit(1);
});
