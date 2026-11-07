"use client";

import { useState } from "react";

type Lang = "jawi" | "rumi" | "english";

const ORDER: Lang[] = ["rumi", "jawi", "english"];

export default function SermonViewer({
  title,
  jawiUrl,
  rumiUrl,
  englishUrl,
  noPdfText,
}: {
  title: string;
  jawiUrl: string | null;
  rumiUrl: string | null;
  englishUrl: string | null;
  noPdfText?: string;
}) {
  const urls: Record<Lang, string | null> = {
    jawi: jawiUrl,
    rumi: rumiUrl,
    english: englishUrl,
  };

  const fallback = ORDER.find((l) => urls[l]) ?? "rumi";
  const [selected, setSelected] = useState<Lang>(fallback);
  const [zoom, setZoom] = useState(1);

  // Another sermon may not have the language currently selected, so fall back
  // to the first available one instead of rendering an empty tab.
  const lang = urls[selected] ? selected : fallback;
  const active = urls[lang];

  const tabs: { key: Lang; label: string }[] = [
    { key: "jawi", label: "Jawi" },
    { key: "rumi", label: "Rumi" },
    { key: "english", label: "English" },
  ];

  return (
    <div className="glass mt-6 overflow-hidden rounded-3xl p-2 sm:p-3">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-2">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => {
            const disabled = !urls[t.key];
            return (
              <button
                key={t.key}
                disabled={disabled}
                onClick={() => setSelected(t.key)}
                className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-colors ${
                  lang === t.key
                    ? "btn-gold"
                    : "border border-white/20 bg-white/5 text-mint hover:text-white"
                } ${disabled ? "cursor-not-allowed opacity-40" : ""}`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
        {active && (
          <div className="flex items-center gap-1">
            <button
              onClick={() => setZoom((z) => Math.max(0.5, z - 0.25))}
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-mint transition-colors hover:text-white"
              aria-label="Zoom out"
            >
              −
            </button>
            <span className="min-w-[3ch] text-center text-xs text-mint/60">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(2, z + 0.25))}
              className="rounded-full px-2.5 py-1 text-xs font-semibold text-mint transition-colors hover:text-white"
              aria-label="Zoom in"
            >
              +
            </button>
          </div>
        )}
      </div>
      {active ? (
        <div className="overflow-auto rounded-2xl bg-[#0a2b2b]">
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: "top left",
              width: `${100 / zoom}%`,
              height: `${80 / zoom}vh`,
            }}
          >
            <iframe
              src={`${active}#view=FitH`}
              title={`${title} — ${lang}`}
              className="h-full w-full border-0"
            />
          </div>
        </div>
      ) : (
        <div className="flex h-[80vh] w-full items-center justify-center rounded-2xl bg-[#0a2b2b] text-mint">
          {noPdfText ??
            "No PDF available for preview. Use the download buttons above."}
        </div>
      )}
    </div>
  );
}
