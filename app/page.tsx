import { listSermons } from "@/lib/db";
import Link from "next/link";
import SermonCard from "@/components/sermon-card";
import HeroVisual from "@/components/hero-visual";
import { compareDatesDesc, isUpcoming } from "@/lib/format";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

function SparkIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M12 3v4M12 17v4M3 12h4M17 12h4M5.6 5.6l2.8 2.8M15.6 15.6l2.8 2.8M18.4 5.6l-2.8 2.8M8.4 15.6l-2.8 2.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="12" r="2.6" fill="currentColor" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <path
        d="M9.5 6C6.9 7 5.5 8.9 5.5 11.5V18h5v-6H7.8c0-2 .7-3.3 2.3-4L9.5 6Zm9 0C15.9 7 14.5 8.9 14.5 11.5V18h5v-6h-2.7c0-2 .7-3.3 2.3-4L18.5 6Z"
        fill="currentColor"
      />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-5 w-5">
      <rect
        x="4.5"
        y="10"
        width="15"
        height="10"
        rx="2.5"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M8 10V7.5a4 4 0 0 1 8 0V10"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="12" cy="15" r="1.4" fill="currentColor" />
    </svg>
  );
}

export default async function Home() {
  const lang = await getLang();
  const sermons = listSermons();

  // Some authorities publish the whole year ahead (Johor), so exclude future
  // Fridays here — otherwise the latest section is always them.
  const latest = [...sermons]
    .filter((s) => !isUpcoming(s.date))
    .sort((a, b) => compareDatesDesc(a.date, b.date))
    .slice(0, 6);

  // Prefer a recent sermon that can actually be summarised (Rumi PDF), so the
  // CTA never lands on a Jawi-only paper where the feature is unavailable.
  const summaryDemo = latest.find((s) => s.pdf_rumi) ?? latest[0];
  const tryHref = summaryDemo ? `/sermons/${summaryDemo.id}` : "/sermons";

  const aiPoints = [
    {
      icon: <SparkIcon />,
      title: t(lang, "home.ai.point1Title"),
      body: t(lang, "home.ai.point1Body"),
    },
    {
      icon: <QuoteIcon />,
      title: t(lang, "home.ai.point2Title"),
      body: t(lang, "home.ai.point2Body"),
    },
    {
      icon: <LockIcon />,
      title: t(lang, "home.ai.point3Title"),
      body: t(lang, "home.ai.point3Body"),
    },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4">
      <section className="py-12 sm:py-16 lg:py-24">
        <div className="grid items-center gap-8 lg:grid-cols-[1.15fr_1fr] lg:gap-10">
          <div className="text-center lg:text-left">
            <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-mint-light">
              {t(lang, "hero.badge")}
            </span>
            <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-tight">
              {t(lang, "hero.title1")}{" "}
              <span className="bg-gradient-to-r from-glow to-[#ffdf6d] bg-clip-text text-transparent">
                {t(lang, "hero.titleHighlight")}
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-lg text-mint lg:mx-0">
              {t(lang, "hero.subtitle")}
            </p>
            <div className="mx-auto mt-9 flex max-w-xs flex-col gap-3 sm:max-w-none sm:flex-row sm:justify-center sm:gap-4 lg:justify-start">
              <Link
                href="/sermons"
                className="btn-gold rounded-full px-7 py-3 text-center font-semibold"
              >
                {t(lang, "hero.browse")}
              </Link>
              <Link
                href="/about"
                className="glass rounded-full px-7 py-3 text-center font-medium text-white transition-colors hover:bg-white/20"
              >
                {t(lang, "hero.learn")}
              </Link>
            </div>
          </div>
          <div className="mx-auto w-full max-w-sm lg:max-w-none">
            <HeroVisual />
          </div>
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
            {t(lang, "list.empty")}
          </div>
        ) : (
          <div className="mt-6 grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
            {latest.map((s) => (
              <SermonCard
                key={s.id}
                sermon={s}
                weekLabel={t(lang, "list.thisWeek")}
              />
            ))}
          </div>
        )}
      </section>

      <section className="pb-20">
        <div className="glass relative overflow-hidden rounded-3xl p-7 sm:p-10">
          <div
            className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-glow/10 blur-3xl"
            aria-hidden="true"
          />
          <span className="badge-current inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
            {t(lang, "home.ai.badge")}
          </span>
          <h2 className="mt-4 max-w-xl text-2xl font-semibold tracking-tight sm:text-3xl">
            {t(lang, "home.ai.title")}
          </h2>
          <p className="mt-3 max-w-2xl leading-relaxed text-mint-light/90">
            {t(lang, "home.ai.body")}
          </p>

          <ul className="mt-8 grid gap-4 sm:grid-cols-3">
            {aiPoints.map((point) => (
              <li
                key={point.title}
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
              >
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-glow/10 text-glow">
                  {point.icon}
                </span>
                <h3 className="mt-3 text-sm font-semibold text-white">
                  {point.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-mint">
                  {point.body}
                </p>
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href={tryHref}
              className="btn-gold rounded-full px-6 py-2.5 text-sm font-semibold"
            >
              {t(lang, "home.ai.cta")}
            </Link>
            <Link
              href="/sermons"
              className="glass rounded-full px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
            >
              {t(lang, "home.ai.ctaAll")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
