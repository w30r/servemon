"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import SermonCard from "./sermon-card";
import { formatDate } from "@/lib/format";
import type { DbSermon } from "@/lib/db";

type View = "cards" | "list";

type Strings = {
  cards: string;
  list: string;
  empty: string;
  summary: string;
};

export default function SermonList({
  sermons,
  strings,
}: {
  sermons: DbSermon[];
  strings: Strings;
}) {
  const [view, setView] = useState<View>("cards");

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
      ) : view === "cards" ? (
        <div className="mt-4 grid gap-4 pb-8 sm:grid-cols-2 lg:grid-cols-3">
          {sermons.map((s) => (
            <SermonCard key={s.id} sermon={s} />
          ))}
        </div>
      ) : (
        <ul className="mt-4 space-y-3 pb-8">
          {sermons.map((s) => (
            <li key={s.id}>
              <Link
                href={`/sermons/${s.id}`}
                className="glass flex items-center justify-between gap-4 rounded-2xl p-4 transition-colors hover:bg-white/20"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold tracking-wide text-mint">
                      {s.state}
                    </span>
                    {s.language && (
                      <span className="rounded-full border border-white/25 px-2 py-0.5 text-[11px] font-medium text-mint-light">
                        {s.language}
                      </span>
                    )}
                  </div>
                  <h3 className="mt-1 truncate font-semibold text-white">
                    {s.title}
                  </h3>
                </div>
                <div className="shrink-0 text-right">
                  <time
                    dateTime={s.date}
                    className="text-sm text-mint/80"
                  >
                    {formatDate(s.date)}
                  </time>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
