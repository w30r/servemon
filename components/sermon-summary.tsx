"use client";

import { useState } from "react";
import type { SermonSummary, SummaryLang } from "@/lib/summary";

type Strings = {
  title: string;
  points: string;
  dalils: string;
  disclaimer: string;
  generate: string;
  generating: string;
  retry: string;
  failed: string;
  translate: string;
  malayFallback: string;
  unavailable: string;
};

export default function SermonSummaryCard({
  sermonId,
  targetLang,
  initialSummary,
  canGenerate,
  strings,
}: {
  sermonId: string;
  targetLang: SummaryLang;
  initialSummary: SermonSummary | null;
  canGenerate: boolean;
  strings: Strings;
}) {
  const [summary, setSummary] = useState<SermonSummary | null>(initialSummary);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState(false);

  const isTarget = summary?.lang === targetLang;
  const isFallback = !!summary && !isTarget;

  async function fetchSummary(): Promise<SermonSummary | null> {
    const res = await fetch(
      `/api/summaries/${sermonId}?lang=${targetLang}`,
      { cache: "no-store" }
    );
    if (!res.ok) return null;
    const data = (await res.json()) as {
      status: string;
      summary: SermonSummary | null;
    };
    return data.summary;
  }

  async function poll(): Promise<SermonSummary | null> {
    for (let i = 0; i < 45; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      const found = await fetchSummary();
      if (found) return found;
    }
    throw new Error("timeout");
  }

  async function generate() {
    setRunning(true);
    setError(false);
    try {
      const res = await fetch(
        `/api/summaries/${sermonId}?lang=${targetLang}`,
        { method: "POST" }
      );

      if (res.status === 202) {
        const found = await poll();
        if (!found) throw new Error("generation failed");
        setSummary(found);
        return;
      }

      const data = (await res.json()) as {
        status: string;
        summary: SermonSummary | null;
      };
      if (!res.ok) throw new Error("generation failed");
      if (data.summary) {
        setSummary(data.summary);
      } else if (data.status === "running") {
        const found = await poll();
        if (!found) throw new Error("generation failed");
        setSummary(found);
      } else {
        throw new Error("generation failed");
      }
    } catch {
      setError(true);
    } finally {
      setRunning(false);
    }
  }

  const actionLabel = summary ? strings.translate : strings.generate;

  return (
    <details className="glass group mt-6 rounded-3xl">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-6 [&::-webkit-details-marker]:hidden sm:p-8">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-glow/15 text-glow">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            aria-hidden="true"
            className="h-5 w-5"
          >
            <path
              d="M12 3v4m0 10v4M5 12H3m18 0h-2M6.3 6.3 4.9 4.9m14.2 14.2-1.4-1.4M17.7 6.3l1.4-1.4M6.3 17.7l-1.4 1.4"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="3" />
          </svg>
        </span>
        <h2 className="text-lg font-semibold tracking-tight">
          {strings.title}
        </h2>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="ml-auto h-5 w-5 shrink-0 text-mint transition-transform group-open:rotate-180"
        >
          <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </summary>

      <div className="px-6 pb-6 sm:px-8 sm:pb-8">
        {running ? (
          <div className="flex items-center gap-3 text-sm text-mint">
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-glow/30 border-t-glow" />
            {strings.generating}
          </div>
        ) : error ? (
          <div className="text-sm">
            <p className="text-accent">{strings.failed}</p>
            <button
              type="button"
              onClick={generate}
              className="glass mt-3 rounded-full px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-white/20"
            >
              {strings.retry}
            </button>
          </div>
        ) : summary ? (
          <>
            {isFallback && (
              <div className="mb-4 flex flex-wrap items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-3 text-xs text-mint">
                <span className="min-w-0 flex-1">{strings.malayFallback}</span>
                <button
                  type="button"
                  onClick={generate}
                  className="btn-gold rounded-full px-3 py-1.5 text-xs font-semibold"
                >
                  {strings.translate}
                </button>
              </div>
            )}

            <p className="text-base leading-relaxed text-mint-light">
              {summary.tldr}
            </p>

            {summary.points.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-mint">
                  {strings.points}
                </h3>
                <ol className="mt-3 space-y-2.5">
                  {summary.points.map((point, i) => (
                    <li
                      key={i}
                      className="flex gap-3 text-sm leading-relaxed text-mint"
                    >
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-glow/15 text-[11px] font-bold text-glow">
                        {i + 1}
                      </span>
                      <span>{point}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {summary.dalils.length > 0 && (
              <div className="mt-6">
                <h3 className="text-xs font-semibold uppercase tracking-wide text-mint">
                  {strings.dalils}
                </h3>
                <ul className="mt-3 space-y-3">
                  {summary.dalils.map((dalil) => (
                    <li key={`${dalil.source}-${dalil.arabic.slice(0, 12)}`}>
                      <blockquote className="rounded-2xl border border-white/10 bg-black/15 p-4 sm:p-5">
                        <p
                          dir="rtl"
                          lang="ar"
                          className="text-right text-xl leading-loose text-white"
                        >
                          {dalil.arabic}
                        </p>
                        <p className="mt-3 text-sm leading-relaxed text-mint-light">
                          {dalil.translation}
                        </p>
                        <cite className="mt-3 inline-block rounded-full border border-white/20 px-2.5 py-0.5 text-[11px] font-medium not-italic text-mint">
                          {dalil.source}
                        </cite>
                      </blockquote>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-mint/60">
              {strings.disclaimer}
            </p>
          </>
        ) : (
          <div className="text-sm">
            {canGenerate ? (
              <>
                <p className="text-mint">{strings.unavailable}</p>
                <button
                  type="button"
                  onClick={generate}
                  className="btn-gold mt-3 rounded-full px-4 py-2 text-xs font-semibold"
                >
                  {actionLabel}
                </button>
              </>
            ) : (
              <p className="text-mint/60">{strings.unavailable}</p>
            )}
          </div>
        )}
      </div>
    </details>
  );
}
