import Link from "next/link";
import Image from "next/image";
import LangToggle from "./lang-toggle";
import { t, type Lang } from "@/lib/i18n";

export default function Header({ lang }: { lang: Lang }) {
  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <div className="glass mx-auto flex h-14 max-w-5xl items-center justify-between gap-3 rounded-full px-5 sm:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/logo2.png"
            alt="Servemon"
            width={28}
            height={28}
            className="rounded-full"
          />
          <span className="hidden text-lg font-bold uppercase tracking-tight text-white sm:inline">
            Servemon
          </span>
        </Link>
        <nav className="flex items-center gap-1.5 text-sm font-medium text-mint sm:gap-2">
          <Link
            href="/sermons"
            className="rounded-full px-3 py-2 transition-colors hover:bg-white/10 hover:text-white sm:px-4"
          >
            {t(lang, "nav.browse")}
          </Link>
          <Link
            href="/about"
            className="rounded-full px-3 py-2 transition-colors hover:bg-white/10 hover:text-white sm:px-4"
          >
            {t(lang, "nav.about")}
          </Link>
          <LangToggle current={lang} />
        </nav>
      </div>
    </header>
  );
}
