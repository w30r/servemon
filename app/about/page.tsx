import type { Metadata } from "next";
import Link from "next/link";
import StateFlag from "@/components/state-flag";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import {
  ABOUT_COPY,
  ABOUT_SOURCES,
  aboutPick as pick,
} from "@/lib/about";
import {
  FEDERAL_TERRITORIES,
  SHIPPED_STATES,
} from "@/lib/roadmap";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, "about.title"),
  };
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-4 w-4">
      <path
        d="m5 12.5 4.2 4.2L19 7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default async function About() {
  const lang = await getLang();

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 pb-24">
      <header className="text-center">
        <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-mint-light">
          {pick(lang, ABOUT_COPY.badge)}
        </span>
        <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
          {pick(lang, ABOUT_COPY.title)}
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-lg text-mint">
          {pick(lang, ABOUT_COPY.subtitle)}
        </p>
      </header>

      <section className="glass mt-10 rounded-3xl p-7 sm:p-9">
        <div className="space-y-4 leading-relaxed text-mint-light/90">
          {ABOUT_COPY.story[lang].map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          {pick(lang, ABOUT_COPY.insideTitle)}
        </h2>
        <ul className="mt-5 grid gap-4 sm:grid-cols-2">
          {ABOUT_COPY.inside.map((item) => (
            <li key={pick(lang, item.title)} className="glass rounded-2xl p-5">
              <h3 className="font-semibold text-white">
                {pick(lang, item.title)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-mint">
                {pick(lang, item.body)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="glass relative mt-12 overflow-hidden rounded-3xl p-7 sm:p-9">
        <div
          className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full bg-glow/10 blur-3xl"
          aria-hidden="true"
        />
        <span className="badge-current inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide">
          {t(lang, "home.ai.badge")}
        </span>
        <h2 className="mt-4 text-xl font-semibold">
          {pick(lang, ABOUT_COPY.aiTitle)}
        </h2>
        <p className="mt-3 leading-relaxed text-mint-light/90">
          {pick(lang, ABOUT_COPY.aiBody)}
        </p>
        <ul className="mt-5 space-y-2.5">
          {ABOUT_COPY.aiPoints[lang].map((point) => (
            <li key={point} className="flex gap-2.5 text-sm text-mint">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-glow/10 text-glow">
                <CheckIcon />
              </span>
              <span className="leading-relaxed">{point}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          {pick(lang, ABOUT_COPY.coverageTitle)}
        </h2>
        <p className="mt-3 leading-relaxed text-mint-light/90">
          {pick(lang, ABOUT_COPY.coverageBody)}
        </p>
        <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[...SHIPPED_STATES, ...FEDERAL_TERRITORIES].map((state) => (
            <li
              key={state}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-sm text-mint-light"
            >
              <StateFlag state={state} />
              <span className="truncate">{state}</span>
            </li>
          ))}
        </ul>
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <p className="text-sm text-mint">
            {pick(lang, ABOUT_COPY.coverageLink)}
          </p>
          <Link
            href="/roadmap"
            className="text-sm font-medium text-glow hover:underline"
          >
            {pick(lang, ABOUT_COPY.coverageCta)} →
          </Link>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          {pick(lang, ABOUT_COPY.sourcesTitle)}
        </h2>
        <p className="mt-3 leading-relaxed text-mint-light/90">
          {pick(lang, ABOUT_COPY.sourcesBody)}
        </p>
        <ul className="mt-5 grid gap-2 sm:grid-cols-2">
          {ABOUT_SOURCES.map((source) => (
            <li key={source.url}>
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2.5 text-sm text-mint-light transition-colors hover:bg-white/10 hover:text-white"
              >
                <span>{source.name}</span>
                <span
                  className="text-glow opacity-0 transition-opacity group-hover:opacity-100"
                  aria-hidden="true"
                >
                  ↗
                </span>
              </a>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          {pick(lang, ABOUT_COPY.ownershipTitle)}
        </h2>
        <p className="mt-3 leading-relaxed text-mint-light/90">
          {pick(lang, ABOUT_COPY.ownershipBody)}
        </p>
      </section>
    </div>
  );
}
