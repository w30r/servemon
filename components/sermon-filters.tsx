"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import StateFlag from "./state-flag";
import { MALAYSIAN_STATES } from "@/lib/types";
import { currentFridayISO, todayISO } from "@/lib/format";

export type SortOrder = "newest" | "oldest";

export type FilterState = {
  states: string[];
  from: string;
  to: string;
  langs: string[];
  sort: SortOrder;
  q: string;
};

type Strings = {
  searchPlaceholder: string;
  searchButton: string;
  button: string;
  state: string;
  date: string;
  language: string;
  sort: string;
  apply: string;
  reset: string;
  allStates: string;
  allTime: string;
  thisWeek: string;
  thisMonth: string;
  last3Months: string;
  thisYear: string;
  custom: string;
  from: string;
  to: string;
  newest: string;
  oldest: string;
  jawi: string;
  rumi: string;
  english: string;
  clear: string;
};

type Preset = "all" | "week" | "month" | "3m" | "year" | "custom";

const LANGS = [
  { value: "jawi", key: "jawi" },
  { value: "rumi", key: "rumi" },
  { value: "english", key: "english" },
] as const;

function monthStartISO(iso: string): string {
  return `${iso.slice(0, 7)}-01`;
}

function yearStartISO(iso: string): string {
  return `${iso.slice(0, 4)}-01-01`;
}

function addMonthsISO(iso: string, months: number): string {
  const [y, m, d] = iso.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1 + months, d));
  return date.toISOString().slice(0, 10);
}

function presetRange(preset: Preset): { from: string; to: string } {
  const today = todayISO();
  switch (preset) {
    case "week": {
      const friday = currentFridayISO();
      return { from: friday, to: friday };
    }
    case "month":
      return { from: monthStartISO(today), to: today };
    case "3m":
      return { from: addMonthsISO(today, -3), to: today };
    case "year":
      return { from: yearStartISO(today), to: today };
    default:
      return { from: "", to: "" };
  }
}

function detectPreset(from: string, to: string): Preset {
  if (!from && !to) return "all";
  const today = todayISO();
  const friday = currentFridayISO();
  if (from === friday && to === friday) return "week";
  if (from === monthStartISO(today) && to === today) return "month";
  if (from === addMonthsISO(today, -3) && to === today) return "3m";
  if (from === yearStartISO(today) && to === today) return "year";
  return "custom";
}

function buildHref(state: FilterState): string {
  const params = new URLSearchParams();
  if (state.q) params.set("q", state.q);
  if (state.states.length) params.set("states", state.states.join(","));
  if (state.from) params.set("from", state.from);
  if (state.to) params.set("to", state.to);
  if (state.langs.length) params.set("lang", state.langs.join(","));
  if (state.sort !== "newest") params.set("sort", state.sort);
  const qs = params.toString();
  return qs ? `/sermons?${qs}` : "/sermons";
}

function toggle(list: string[], value: string): string[] {
  return list.includes(value)
    ? list.filter((v) => v !== value)
    : [...list, value];
}

function rangeLabel(
  from: string,
  to: string,
  strings: Pick<Strings, "from" | "to">
): string {
  if (from && to) return `${from} – ${to}`;
  if (from) return `${strings.from} ${from}`;
  return `${strings.to} ${to}`;
}

export default function SermonFilters({
  counts,
  current,
  strings,
}: {
  counts: Record<string, number>;
  current: FilterState;
  strings: Strings;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [draft, setDraft] = useState<FilterState>(current);
  const panelRef = useRef<HTMLDivElement>(null);

  const preset = customMode ? "custom" : detectPreset(draft.from, draft.to);
  const activeCount =
    current.states.length +
    (current.from || current.to ? 1 : 0) +
    current.langs.length +
    (current.sort !== "newest" ? 1 : 0);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    function onPointerDown(e: PointerEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

  function openPanel() {
    setDraft(current);
    setCustomMode(detectPreset(current.from, current.to) === "custom");
    setOpen((v) => !v);
  }

  function apply() {
    router.push(buildHref(draft));
    setOpen(false);
  }

  function reset() {
    router.push(buildHref({ ...current, states: [], from: "", to: "", langs: [], sort: "newest" }));
    setOpen(false);
  }

  function selectPreset(next: Preset) {
    if (next === "custom") {
      setCustomMode(true);
      return;
    }
    setCustomMode(false);
    const range = presetRange(next);
    setDraft((d) => ({ ...d, from: range.from, to: range.to }));
  }

  const presetButtons: { value: Preset; label: string }[] = [
    { value: "all", label: strings.allTime },
    { value: "week", label: strings.thisWeek },
    { value: "month", label: strings.thisMonth },
    { value: "3m", label: strings.last3Months },
    { value: "year", label: strings.thisYear },
    { value: "custom", label: strings.custom },
  ];

  const chips: { key: string; label: string; remove: FilterState; flag?: string }[] = [
    ...current.states.map((s) => ({
      key: `state-${s}`,
      label: s,
      flag: s,
      remove: { ...current, states: current.states.filter((v) => v !== s) },
    })),
    ...(current.from || current.to
      ? [
          {
            key: "date",
            label: rangeLabel(current.from, current.to, strings),
            remove: { ...current, from: "", to: "" },
          },
        ]
      : []),
    ...current.langs.map((l) => ({
      key: `lang-${l}`,
      label: strings[l as "jawi" | "rumi" | "english"],
      remove: { ...current, langs: current.langs.filter((v) => v !== l) },
    })),
    ...(current.sort !== "newest"
      ? [
          {
            key: "sort",
            label: strings.oldest,
            remove: { ...current, sort: "newest" as SortOrder },
          },
        ]
      : []),
  ];

  return (
    <div>
      <div className="flex flex-wrap items-center gap-2">
        <form
          action="/sermons"
          method="GET"
          className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
        >
          {current.states.length > 0 && (
          <input type="hidden" name="states" value={current.states.join(",")} />
        )}
        {current.from && <input type="hidden" name="from" value={current.from} />}
        {current.to && <input type="hidden" name="to" value={current.to} />}
        {current.langs.length > 0 && (
          <input type="hidden" name="lang" value={current.langs.join(",")} />
        )}
        {current.sort !== "newest" && (
          <input type="hidden" name="sort" value={current.sort} />
        )}
        <input
          type="text"
          name="q"
          defaultValue={current.q}
          placeholder={strings.searchPlaceholder}
          className="glass min-w-0 flex-1 basis-48 rounded-full px-5 py-2.5 text-sm text-white placeholder:text-mint/60 outline-none transition-colors focus:border-glow/50"
        />
        {current.q && (
          <Link
            href={buildHref({ ...current, q: "" })}
            className="glass rounded-full px-4 py-2.5 text-sm font-semibold text-mint transition-colors hover:bg-white/20 hover:text-white"
            aria-label={strings.clear}
          >
            ×
          </Link>
        )}
        <button
          type="submit"
          className="btn-gold rounded-full px-5 py-2.5 text-sm font-semibold"
        >
          {strings.searchButton}
        </button>
        </form>

        <div className="relative shrink-0" ref={panelRef}>
          <button
            type="button"
            onClick={openPanel}
            aria-expanded={open}
            aria-haspopup="dialog"
            className={`flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-semibold transition-colors ${
              activeCount > 0
                ? "border-glow/60 bg-glow/15 text-glow"
                : "glass text-white hover:bg-white/20"
            }`}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              aria-hidden="true"
              className="h-4 w-4"
            >
              <path d="M4 6h16M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            {strings.button}
            {activeCount > 0 && (
              <span className="badge-current rounded-full px-2 py-0.5 text-[11px] font-bold">
                {activeCount}
              </span>
            )}
          </button>

          {open && (
            <>
              <button
                type="button"
                aria-hidden="true"
                tabIndex={-1}
                onClick={() => setOpen(false)}
                className="fixed inset-0 z-40 cursor-default bg-black/50 sm:bg-transparent"
              />
              <div
                role="dialog"
                aria-label={strings.button}
                className="fixed inset-x-3 bottom-3 z-50 max-h-[85vh] overflow-y-auto rounded-3xl border border-white/20 bg-[#0f3835] p-5 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-[28rem]"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-semibold">{strings.button}</h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="rounded-full px-2 text-xl leading-none text-mint transition-colors hover:text-white"
                    aria-label={strings.clear}
                  >
                    ×
                  </button>
                </div>

                <section className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-mint">
                    {strings.state}
                  </h3>
                  <div className="mt-2 grid grid-cols-1 gap-1 sm:grid-cols-2">
                    <label className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-white/5">
                      <input
                        type="checkbox"
                        checked={draft.states.length === 0}
                        onChange={() => setDraft((d) => ({ ...d, states: [] }))}
                        className="h-4 w-4 accent-[#d8f055]"
                      />
                      <span className="font-medium">{strings.allStates}</span>
                    </label>
                    {MALAYSIAN_STATES.map((st) => {
                      const count = counts[st] ?? 0;
                      return (
                        <label
                          key={st}
                          className="flex cursor-pointer items-center gap-2 rounded-xl px-2 py-1.5 text-sm transition-colors hover:bg-white/5"
                        >
                          <input
                            type="checkbox"
                            checked={draft.states.includes(st)}
                            onChange={() =>
                              setDraft((d) => ({
                                ...d,
                                states: toggle(d.states, st),
                              }))
                            }
                            className="h-4 w-4 accent-[#d8f055]"
                          />
                          <StateFlag state={st} />
                          <span className="min-w-0 flex-1 truncate">{st}</span>
                          {count > 0 && (
                            <span className="text-[11px] text-mint/60">
                              {count}
                            </span>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </section>

                <section className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-mint">
                    {strings.date}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {presetButtons.map((p) => (
                      <button
                        key={p.value}
                        type="button"
                        onClick={() => selectPreset(p.value)}
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          preset === p.value
                            ? "border-glow/60 bg-glow/15 text-glow"
                            : "border-white/20 bg-white/5 text-mint hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {p.label}
                      </button>
                    ))}
                  </div>
                  {preset === "custom" && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <label className="text-xs text-mint">
                        {strings.from}
                        <input
                          type="date"
                          value={draft.from}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, from: e.target.value }))
                          }
                          className="glass mt-1 w-full rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark]"
                        />
                      </label>
                      <label className="text-xs text-mint">
                        {strings.to}
                        <input
                          type="date"
                          value={draft.to}
                          onChange={(e) =>
                            setDraft((d) => ({ ...d, to: e.target.value }))
                          }
                          className="glass mt-1 w-full rounded-xl px-3 py-2 text-sm text-white [color-scheme:dark]"
                        />
                      </label>
                    </div>
                  )}
                </section>

                <section className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-mint">
                    {strings.language}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {LANGS.map((l) => (
                      <button
                        key={l.value}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({
                            ...d,
                            langs: toggle(d.langs, l.value),
                          }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          draft.langs.includes(l.value)
                            ? "border-glow/60 bg-glow/15 text-glow"
                            : "border-white/20 bg-white/5 text-mint hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {strings[l.key]}
                      </button>
                    ))}
                  </div>
                </section>

                <section className="mt-4">
                  <h3 className="text-xs font-semibold uppercase tracking-wide text-mint">
                    {strings.sort}
                  </h3>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {(
                      [
                        { value: "newest", label: strings.newest },
                        { value: "oldest", label: strings.oldest },
                      ] as { value: SortOrder; label: string }[]
                    ).map((s) => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() =>
                          setDraft((d) => ({ ...d, sort: s.value }))
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                          draft.sort === s.value
                            ? "border-glow/60 bg-glow/15 text-glow"
                            : "border-white/20 bg-white/5 text-mint hover:border-white/40 hover:text-white"
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </section>

                <div className="mt-5 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={reset}
                    className="glass flex-1 rounded-full px-4 py-2.5 text-sm font-semibold text-mint transition-colors hover:bg-white/20 hover:text-white"
                  >
                    {strings.reset}
                  </button>
                  <button
                    type="button"
                    onClick={apply}
                    className="btn-gold flex-1 rounded-full px-4 py-2.5 text-sm font-semibold"
                  >
                    {strings.apply}
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          {chips.map((chip) => (
            <Link
              key={chip.key}
              href={buildHref(chip.remove)}
              className="flex items-center gap-1.5 rounded-full border border-white/20 bg-white/5 px-3 py-1.5 text-xs font-medium text-mint-light transition-colors hover:border-white/40 hover:text-white"
            >
              {chip.flag && <StateFlag state={chip.flag} />}
              {chip.label}
              <span aria-hidden="true" className="text-mint/70">
                ×
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
