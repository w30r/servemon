"use client";

import { useEffect, useRef, useState } from "react";

export type DownloadFile = {
  lang: "jawi" | "rumi" | "english";
  url: string;
};

export default function DownloadButton({
  files,
  label,
  title,
  hint,
  closeLabel,
  langLabels,
}: {
  files: DownloadFile[];
  label: string;
  title: string;
  hint: string;
  closeLabel: string;
  langLabels: Record<DownloadFile["lang"], string>;
}) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

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

  if (files.length === 0) return null;

  return (
    <div className="relative" ref={panelRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        className="btn-gold flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          aria-hidden="true"
          className="h-4 w-4"
        >
          <path d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {label}
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
            aria-label={title}
            className="fixed inset-x-3 bottom-3 z-50 rounded-3xl border border-white/20 bg-[#0f3835] p-5 shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold">{title}</h2>
                <p className="mt-1 text-xs text-mint">{hint}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full px-2 text-xl leading-none text-mint transition-colors hover:text-white"
                aria-label={closeLabel}
              >
                ×
              </button>
            </div>

            <ul className="mt-4 space-y-2">
              {files.map((file) => (
                <li key={file.lang}>
                  <a
                    href={`${file.url}?download=1`}
                    download
                    onClick={() => setOpen(false)}
                    className="glass flex items-center justify-between gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition-colors hover:bg-white/20"
                  >
                    <span>{langLabels[file.lang]}</span>
                    <svg
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      aria-hidden="true"
                      className="h-4 w-4 text-mint"
                    >
                      <path
                        d="M12 4v10m0 0 4-4m-4 4-4-4M5 19h14"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
