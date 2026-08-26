import { cookies } from "next/headers";
import type { Lang } from "@/lib/i18n";

export async function getLang(): Promise<Lang> {
  const store = await cookies();
  const v = store.get("lang")?.value;
  return v === "en" || v === "bm" || v === "ta" || v === "zh" ? v : "en";
}
