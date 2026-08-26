"use client";

import { useRouter } from "next/navigation";
import { LANGS, type Lang } from "@/lib/i18n";

export default function LangToggle({ current }: { current: Lang }) {
  const router = useRouter();

  function setLang(code: Lang) {
    // eslint-disable-next-line react-hooks/immutability
    document.cookie = `lang=${code}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }

  return (
    <div className="glass flex items-center rounded-full p-1">
      {LANGS.map((l) => (
        <button
          key={l.code}
          onClick={() => setLang(l.code)}
          aria-label={`Switch language to ${l.label}`}
          className={`rounded-full px-2.5 py-1 text-xs font-semibold transition-colors ${
            current === l.code
              ? "btn-gold"
              : "text-mint hover:text-white"
          }`}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}
