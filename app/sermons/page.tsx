import SermonList from "@/components/sermon-list";
import SermonFilters, {
  type FilterState,
  type SortOrder,
} from "@/components/sermon-filters";
import { listSermons, type DbSermon } from "@/lib/db";
import { compareDatesDesc, dateSortValue } from "@/lib/format";
import { MALAYSIAN_STATES } from "@/lib/types";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

type SearchParams = Promise<{
  state?: string;
  states?: string;
  q?: string;
  from?: string;
  to?: string;
  lang?: string;
  sort?: string;
}>;

const LANGS = ["jawi", "rumi", "english"] as const;

function isISODate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function matchesState(sermon: DbSermon, state: string): boolean {
  if (sermon.state === state) return true;
  if (!sermon.states) return false;
  return sermon.states
    .split(",")
    .map((s) => s.trim())
    .includes(state);
}

function hasLang(sermon: DbSermon, lang: string): boolean {
  if (lang === "jawi") return !!sermon.pdf_jawi;
  if (lang === "rumi") return !!sermon.pdf_rumi;
  if (lang === "english") return !!sermon.pdf_english;
  return false;
}

export default async function SermonsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const lang = await getLang();
  const sp = await searchParams;

  const q = sp.q ?? "";
  const statesParam = sp.states ?? sp.state ?? "";
  const selectedStates = statesParam
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is string =>
      (MALAYSIAN_STATES as readonly string[]).includes(s)
    );
  const from = isISODate(sp.from) ? sp.from : "";
  const to = isISODate(sp.to) ? sp.to : "";
  const selectedLangs = (sp.lang ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is (typeof LANGS)[number] =>
      (LANGS as readonly string[]).includes(s)
    );
  const sort: SortOrder = sp.sort === "oldest" ? "oldest" : "newest";

  const current: FilterState = {
    states: selectedStates,
    from,
    to,
    langs: selectedLangs,
    sort,
    q,
  };

  const all = listSermons();
  const query = q.toLowerCase();

  const base = all.filter((s) => {
    if (query && !(s.title ?? "").toLowerCase().includes(query)) return false;
    const date = dateSortValue(s.date);
    if (from && date < from) return false;
    if (to && date > to) return false;
    if (
      selectedLangs.length &&
      !selectedLangs.some((l) => hasLang(s, l))
    )
      return false;
    return true;
  });

  const counts: Record<string, number> = {};
  for (const st of MALAYSIAN_STATES) {
    counts[st] = base.filter((s) => matchesState(s, st)).length;
  }

  const filtered = (
    selectedStates.length
      ? base.filter((s) =>
          selectedStates.some((st) => matchesState(s, st))
        )
      : base
  ).sort((a, b) => {
    const cmp = compareDatesDesc(a.date, b.date);
    return sort === "oldest" ? -cmp : cmp;
  });

  const dateLabel =
    from && to
      ? `${from} – ${to}`
      : from
        ? `${t(lang, "filter.from")} ${from}`
        : to
          ? `${t(lang, "filter.to")} ${to}`
          : "";

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        {t(lang, "browse.title")}
      </h1>

      <div className="mt-6">
        <SermonFilters
          counts={counts}
          current={current}
          strings={{
            searchPlaceholder: t(lang, "search.placeholder"),
            searchButton: t(lang, "search.button"),
            button: t(lang, "filter.button"),
            state: t(lang, "filter.state"),
            date: t(lang, "filter.date"),
            language: t(lang, "filter.language"),
            sort: t(lang, "filter.sort"),
            apply: t(lang, "filter.apply"),
            reset: t(lang, "filter.reset"),
            allStates: t(lang, "filter.allStates"),
            allTime: t(lang, "filter.allTime"),
            thisWeek: t(lang, "filter.thisWeek"),
            thisMonth: t(lang, "filter.thisMonth"),
            last3Months: t(lang, "filter.last3Months"),
            thisYear: t(lang, "filter.thisYear"),
            custom: t(lang, "filter.custom"),
            from: t(lang, "filter.from"),
            to: t(lang, "filter.to"),
            newest: t(lang, "filter.newest"),
            oldest: t(lang, "filter.oldest"),
            jawi: t(lang, "filter.jawi"),
            rumi: t(lang, "filter.rumi"),
            english: t(lang, "filter.english"),
            clear: t(lang, "filter.clear"),
          }}
        />
      </div>

      <SermonList
        sermons={filtered}
        strings={{
          cards: t(lang, "list.cards"),
          list: t(lang, "list.list"),
          empty: t(lang, "list.empty"),
          upcoming: t(lang, "list.upcoming"),
          thisWeek: t(lang, "list.thisWeek"),
          summary: [
            t(lang, "list.summary", {
              n: String(filtered.length),
              s: filtered.length === 1 ? "" : "s",
            }),
            selectedStates.length
              ? t(lang, "list.summaryState", {
                  state: selectedStates.join(", "),
                })
              : "",
            dateLabel ? ` · ${dateLabel}` : "",
            q ? t(lang, "list.summaryQuery", { query: q }) : "",
          ]
            .filter(Boolean)
            .join(""),
        }}
      />
    </div>
  );
}
