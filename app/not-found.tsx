import Link from "next/link";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export default async function NotFound() {
  const lang = await getLang();

  return (
    <div className="mx-auto max-w-2xl px-4 py-24 text-center">
      <div className="glass rounded-3xl p-12">
        <h1 className="text-3xl font-bold tracking-tight">
          {t(lang, "notfound.title")}
        </h1>
        <p className="mt-4 text-mint">{t(lang, "notfound.body")}</p>
        <Link
          href="/sermons"
          className="btn-gold mt-8 inline-block rounded-full px-6 py-3 font-semibold"
        >
          {t(lang, "notfound.browse")}
        </Link>
      </div>
    </div>
  );
}
