import { NextResponse } from "next/server";
import { runJaisScraper } from "@/lib/scrapers/jais";
import { runJakimScraper } from "@/lib/scrapers/jakim";
import { runJohorScraper } from "@/lib/scrapers/johor";
import { runKedahScraper } from "@/lib/scrapers/kedah";
import { runKelantanScraper } from "@/lib/scrapers/kelantan";
import { runNegeriSembilanScraper } from "@/lib/scrapers/negerisembilan";
import { runPerakScraper } from "@/lib/scrapers/perak";
import { runPerlisScraper } from "@/lib/scrapers/perlis";
import { runPulauPinangScraper } from "@/lib/scrapers/pulaupinang";
import { runSabahScraper } from "@/lib/scrapers/sabah";
import { runSarawakScraper } from "@/lib/scrapers/sarawak";
import { runTerengganuScraper } from "@/lib/scrapers/terengganu";

const CRON_SECRET = process.env.CRON_SECRET;

export const POST = async (req: Request) => {
  // Simple secret check
  const authHeader = req.headers.get("x-cron-secret");
  if (authHeader !== CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [
      jais,
      jakim,
      johor,
      kedah,
      kelantan,
      negerisembilan,
      perak,
      perlis,
      pulaupinang,
      sabah,
      sarawak,
      terengganu,
    ] = await Promise.all([
      runJaisScraper(),
      runJakimScraper(),
      runJohorScraper(),
      runKedahScraper(),
      runKelantanScraper(),
      runNegeriSembilanScraper(),
      runPerakScraper(),
      runPerlisScraper(),
      runPulauPinangScraper(),
      runSabahScraper(),
      runSarawakScraper(),
      runTerengganuScraper(),
    ]);
    return NextResponse.json({
      jais,
      jakim,
      johor,
      kedah,
      kelantan,
      negerisembilan,
      perak,
      perlis,
      pulaupinang,
      sabah,
      sarawak,
      terengganu,
    });
  } catch (e) {
    console.error("Cron job error:", e);
    return NextResponse.json(
      { error: "internal error", detail: (e as Error).message },
      { status: 500 }
    );
  }
};