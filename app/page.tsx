import { listSermons } from "@/lib/db";
import Link from "next/link";
import SermonCard from "@/components/sermon-card";
import { compareDatesDesc } from "@/lib/format";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function Home() {
  const lang = await getLang();
  const sermons = listSermons();

  const latest = [...sermons]
    .sort((a, b) => compareDatesDesc(a.date, b.date))
    .slice(0, 6);

  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-16 text-center sm:py-24">
        <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-mint-light">
          {t(lang, "hero.badge")}
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-tight">
          {t(lang, "hero.title1")}{" "}
          <span className="bg-gradient-to-r from-glow to-[#ffdf6d] bg-clip-text text-transparent">
            {t(lang, "hero.titleHighlight")}
          </span>
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-mint">
          {t(lang, "hero.subtitle")}
        </p>
        <div className="mt-9 flex justify-center gap-4">
          <Link
            href="/sermons"
            className="btn-gold rounded-full px-7 py-3 font-semibold"
          >
            {t(lang, "hero.browse")}
          </Link>
          <Link
            href="/about"
            className="glass rounded-full px-7 py-3 font-medium text-white transition-colors hover:bg-white/20"
          >
            {t(lang, "hero.learn")}
          </Link>
        </div>
      </section>

      <section className="pb-16">
        <div className="flex items-end justify-between">
          <h2 className="text-xl font-semibold">{t(lang, "latest.title")}</h2>
          <Link
            href="/sermons"
            className="text-sm font-medium text-glow hover:underline"
          >
            {t(lang, "latest.viewall")}
          </Link>
        </div>
        {latest.length === 0 ? (
          <div className="glass mt-6 rounded-3xl p-12 text-center text-mint">
            No sermons yet. Check back soon!
          </div>
        ) : (
          <div className="mt-6 grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((s) => (
              <SermonCard key={s.id} sermon={s} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
