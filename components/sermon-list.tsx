"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SermonCard from "./sermon-card";
import StateFlag from "./state-flag";
import { formatDate, isCurrentWeek, isUpcoming } from "@/lib/format";
import type { DbSermon } from "@/lib/db";

type View = "cards" | "list";

type Strings = {
  cards: string;
  list: string;
  empty: string;
  summary: string;
  upcoming: string;
  thisWeek: string;
  loadMore: string;
};

const PAGE = 24;

export default function SermonList({
  sermons,
  strings,
}: {
  sermons: DbSermon[];
  strings: Strings;
}) {
  const [view, setView] = useState<View>("cards");
  const [visible, setVisible] = useState(PAGE);
  const shown = sermons.slice(0, visible);

  useEffect(() => {
    const saved = localStorage.getItem("servemon-view");
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (saved === "cards" || saved === "list") setView(saved);
  }, []);

  useEffect(() => {
    localStorage.setItem("servemon-view", view);
  }, [view]);

  return (
    <div>
      <div className="mt-6 flex items-center justify-between gap-4">
        <p className="text-sm text-mint/80">{strings.summary}</p>
        <div className="glass flex items-center rounded-full p-1">
          <button
            onClick={() => setView("cards")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              view === "cards" ? "btn-gold" : "text-mint hover:text-white"
            }`}
          >
            {strings.cards}
          </button>
          <button
            onClick={() => setView("list")}
            className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
              view === "list" ? "btn-gold" : "text-mint hover:text-white"
            }`}
          >
            {strings.list}
          </button>
        </div>
      </div>

      {sermons.length === 0 ? (
        <div className="glass mt-4 rounded-3xl p-12 text-center text-mint">
          {strings.empty}
        </div>
      ) : (
        <>
          {view === "cards" ? (
            <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((s) => (
                <SermonCard
                  key={s.id}
                  sermon={s}
                  upcomingLabel={strings.upcoming}
                  weekLabel={strings.thisWeek}
                />
              ))}
            </div>
          ) : (
            <ul className="mt-4 space-y-3">
              {shown.map((s) => (
                <li key={s.id}>
                  <Link
                    href={`/sermons/${s.id}`}
                    className={`glass flex flex-col gap-1.5 rounded-2xl p-4 transition-colors hover:bg-white/20 sm:flex-row sm:items-center sm:justify-between sm:gap-4 ${
                      isCurrentWeek(s.date) ? "card-current" : ""
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-mint">
                          <StateFlag state={s.state} />
                          {s.state}
                        </span>
                        {isCurrentWeek(s.date) && (
                          <span className="badge-current rounded-full px-2 py-0.5 text-[11px] font-semibold">
                            {strings.thisWeek}
                          </span>
                        )}
                        {isUpcoming(s.date) && (
                          <span className="badge-accent rounded-full px-2 py-0.5 text-[11px] font-semibold">
                            {strings.upcoming}
                          </span>
                        )}
                        {s.language && (
                          <span className="rounded-full border border-white/25 px-2 py-0.5 text-[11px] font-medium text-mint-light">
                            {s.language}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-semibold text-white">
                        {s.title}
                      </h3>
                    </div>
                    <div className="shrink-0 sm:text-right">
                      <time dateTime={s.date} className="text-sm text-mint/80">
                        {formatDate(s.date)}
                      </time>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}

          {visible < sermons.length && (
            <div className="mt-6 flex justify-center">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE)}
                className="glass rounded-full px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                {strings.loadMore.replace(
                  "{n}",
                  String(Math.min(PAGE, sermons.length - visible))
                )}
              </button>
            </div>
          )}
          <div className="pb-8" />
        </>
      )}
    </div>
  );
}
