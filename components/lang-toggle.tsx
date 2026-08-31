"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n";

export default function LangToggle({ current }: { current: Lang }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function setLang(code: Lang) {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
    router.refresh();
  }

  const active = LANGS.find((l) => l.code === current);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Switch language"
        className="glass flex items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-semibold text-mint transition-colors hover:text-white sm:px-3 sm:py-2 sm:text-sm"
      >
        {active?.label}
        <svg
          className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
            clipRule="evenodd"
          />
        </svg>
      </button>
      {open && (
        <div className="glass absolute right-0 top-full z-50 mt-2 w-36 rounded-2xl p-1.5">
          {LANGS.map((l) => (
            <button
              key={l.code}
              onClick={() => setLang(l.code)}
              className={`block w-full rounded-xl px-3 py-2 text-left text-sm text-mint transition-colors hover:bg-white/10 hover:text-white ${
                current === l.code ? "btn-gold font-semibold" : ""
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
