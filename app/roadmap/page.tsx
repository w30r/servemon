import type { Metadata } from "next";
import StateFlag from "@/components/state-flag";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";
import {
  BLOCKED_STATES,
  FEDERAL_TERRITORIES,
  ROADMAP_COPY,
  ROADMAP_LOCALES,
  SHIPPED_STATES,
  TIMELINE,
  TODOS,
  pick,
  type TodoStatus,
} from "@/lib/roadmap";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, "nav.roadmap"),
  };
}

const STATUS_CLASS: Record<TodoStatus, string> = {
  next: "badge-current",
  exploring: "border border-white/20 text-mint",
  blocked: "badge-accent",
};

function formatRoadmapDate(iso: string, locale: string): string {
  const date = new Date(`${iso}T00:00:00Z`);
  return date.toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

export default async function RoadmapPage() {
  const lang = await getLang();
  const locale = ROADMAP_LOCALES[lang];

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 pb-24">
      <section className="text-center">
        <span className="glass inline-block rounded-full px-4 py-1.5 text-xs font-medium tracking-wide text-mint-light">
          {pick(lang, ROADMAP_COPY.badge)}
        </span>
        <h1 className="mx-auto mt-6 max-w-2xl text-4xl font-bold leading-tight tracking-tight sm:text-5xl sm:leading-tight">
          {pick(lang, ROADMAP_COPY.title)}
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg text-mint">
          {pick(lang, ROADMAP_COPY.subtitle)}
        </p>
      </section>

      <section className="glass mt-12 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="text-xl font-semibold">
            {pick(lang, ROADMAP_COPY.coverageTitle)}
          </h2>
          <span className="badge-current rounded-full px-2.5 py-1 text-[11px] font-semibold">
            {pick(lang, ROADMAP_COPY.liveLabel)}
          </span>
        </div>
        <p className="mt-3 text-sm leading-relaxed text-mint-light/90">
          {pick(lang, ROADMAP_COPY.coverageBody)}
        </p>

        <ul className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {[...SHIPPED_STATES, ...FEDERAL_TERRITORIES].map((state) => (
            <li
              key={state}
              className="flex items-center gap-2 rounded-xl bg-white/5 px-3 py-2 text-[13px] leading-tight text-mint-light sm:text-sm"
            >
              <StateFlag state={state} />
              <span className="min-w-0">{state}</span>
            </li>
          ))}
        </ul>

        <h3 className="mt-8 text-base font-semibold text-white">
          {pick(lang, ROADMAP_COPY.unavailableLabel)}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-mint-light/90">
          {pick(lang, ROADMAP_COPY.unavailableBody)}
        </p>

        <ul className="mt-4 space-y-3">
          {BLOCKED_STATES.map((state) => (
            <li
              key={state.name}
              className="rounded-2xl border border-accent/30 bg-accent/5 p-4"
            >
              <div className="flex flex-wrap items-center gap-2">
                <StateFlag state={state.name} />
                <span className="font-semibold text-white">{state.name}</span>
                <span className="badge-accent rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                  {pick(lang, ROADMAP_COPY.statuses.blocked)}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-mint">
                {pick(lang, state.reason)}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          {pick(lang, ROADMAP_COPY.shippedTitle)}
        </h2>
        <ol className="mt-6 space-y-3">
          {TIMELINE.map((entry) => (
            <li
              key={`${entry.date}-${pick(lang, entry.title)}`}
              className="glass rounded-2xl p-5 sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-2 text-xs text-mint">
                <time dateTime={entry.date}>
                  {formatRoadmapDate(entry.date, locale)}
                </time>
                <span
                  className="h-1 w-1 rounded-full bg-mint/40"
                  aria-hidden="true"
                />
                <span className="rounded-full border border-white/15 px-2 py-0.5 text-[10px] uppercase tracking-wide">
                  {pick(lang, ROADMAP_COPY.areas[entry.area])}
                </span>
              </div>
              <h3 className="mt-2 font-semibold text-white">
                {pick(lang, entry.title)}
              </h3>
              <p className="mt-1.5 text-sm leading-relaxed text-mint">
                {pick(lang, entry.body)}
              </p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-12">
        <h2 className="text-xl font-semibold">
          {pick(lang, ROADMAP_COPY.nextTitle)}
        </h2>
        <ul className="mt-6 grid gap-3 sm:grid-cols-2">
          {TODOS.map((todo) => (
            <li
              key={pick(lang, todo.title)}
              className="glass flex flex-col rounded-2xl p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-semibold text-white">
                  {pick(lang, todo.title)}
                </h3>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${STATUS_CLASS[todo.status]}`}
                >
                  {pick(lang, ROADMAP_COPY.statuses[todo.status])}
                </span>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-mint">
                {pick(lang, todo.body)}
              </p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
