import Link from "next/link";
import SermonList from "@/components/sermon-list";
import { listSermons } from "@/lib/db";
import { compareDatesDesc } from "@/lib/format";
import { MALAYSIAN_STATES } from "@/lib/types";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

type SearchParams = Promise<{ state?: string; q?: string }>;

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const lang = await getLang();
  const { state = "", q = "" } = await searchParams;

  const query = q.toLowerCase();
  const all = listSermons();

  const filtered = all
    .filter((s) => {
      if (state && !(s.state === state || (s.states && s.states.includes(state))))
        return false;
      if (query && !(s.title ?? "").toLowerCase().includes(query)) return false;
      return true;
    })
    .sort((a, b) => compareDatesDesc(a.date, b.date));

  function filterHref(next: { state?: string; q?: string }) {
    const params = new URLSearchParams();
    const s = next.state ?? state;
    const nq = next.q ?? q;
    if (s) params.set("state", s);
    if (nq) params.set("q", nq);
    const qs = params.toString();
    return qs ? `/sermons?${qs}` : "/sermons";
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t(lang, "browse.title")}
      </h1>

      <form action="/sermons" method="GET" className="mt-6 flex gap-2">
        {state && <input type="hidden" name="state" value={state} />}
        <input
          type="text"
          name="q"
          defaultValue={q}
          placeholder={t(lang, "search.placeholder")}
          className="glass w-full max-w-sm rounded-full px-5 py-2.5 text-sm text-white placeholder:text-mint/60 outline-none transition-colors focus:border-glow/50"
        />
        {q && (
          <Link
            href={filterHref({ q: "" })}
            className="glass rounded-full px-4 py-2.5 text-sm font-semibold text-mint transition-colors hover:bg-white/20 hover:text-white"
            aria-label="Clear search"
          >
            ×
          </Link>
        )}
        <button
          type="submit"
          className="btn-gold rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          {t(lang, "search.button")}
        </button>
      </form>

      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={filterHref({ state: "" })}
          className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
            !state
              ? "btn-gold border-transparent font-semibold"
              : "border-white/20 bg-white/5 text-mint hover:border-white/40 hover:text-white"
          }`}
        >
          {t(lang, "filter.all")}
        </Link>
        {MALAYSIAN_STATES.map((st) => {
          const count = all.filter(
            (s) => s.state === st || (s.states && s.states.includes(st)),
          ).length;
          return (
            <Link
              key={st}
              href={filterHref({ state: st })}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors ${
                state === st
                  ? "btn-gold border-transparent font-semibold"
                  : "border-white/20 bg-white/5 text-mint hover:border-white/40 hover:text-white"
              }`}
            >
              {st}
              {count > 0 && (
                <span className="ml-2 text-[11px] font-normal opacity-50">{count}</span>
              )}
            </Link>
          );
        })}
      </div>

      <SermonList
        sermons={filtered}
        strings={{
          cards: t(lang, "list.cards"),
          list: t(lang, "list.list"),
          empty: t(lang, "list.empty"),
          summary: [
            t(lang, "list.summary", {
              n: String(filtered.length),
              s: filtered.length === 1 ? "" : "s",
            }),
            state ? t(lang, "list.summaryState", { state }) : "",
            q ? t(lang, "list.summaryQuery", { query: q }) : "",
          ]
            .filter(Boolean)
            .join(""),
        }}
      />
    </div>
  );
}
