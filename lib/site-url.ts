import "server-only";
import { headers } from "next/headers";

/**
 * Absolute origin for share links. Prefers an explicit env value, then the
 * proxy headers Coolify sets, then the raw host. Never trusts the host header
 * for anything except building a public URL.
 */
export async function getSiteUrl(): Promise<string> {
  const env = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "");
  if (env) return env;

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto =
    h.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");

  return `${proto}://${host}`;
}
