import { NextResponse } from "next/server";
import { runJaisScraper } from "@/lib/scrapers/jais";
import { runJakimScraper } from "@/lib/scrapers/jakim";
import { runJohorScraper } from "@/lib/scrapers/johor";
import { runKedahScraper } from "@/lib/scrapers/kedah";

const CRON_SECRET = process.env.CRON_SECRET;

export const POST = async (req: Request) => {
  // Simple secret check
  const authHeader = req.headers.get("x-cron-secret");
  if (authHeader !== CRON_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const [jais, jakim, johor, kedah] = await Promise.all([
      runJaisScraper(),
      runJakimScraper(),
      runJohorScraper(),
      runKedahScraper(),
    ]);
    return NextResponse.json({ jais, jakim, johor, kedah });
  } catch (e) {
    console.error("Cron job error:", e);
    return NextResponse.json(
      { error: "internal error", detail: (e as Error).message },
      { status: 500 }
    );
  }
};