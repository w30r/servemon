import Link from "next/link";
import Image from "next/image";
import LangToggle from "./lang-toggle";
import GlassSurface from "./ui/glass-surface";
import { t, type Lang } from "@/lib/i18n";

export default function Header({ lang }: { lang: Lang }) {
  return (
    <header className="sticky top-0 z-50 px-3 pt-3 sm:px-4 sm:pt-4">
      <div className="mx-auto h-12 max-w-5xl sm:h-14">
        <GlassSurface
          width="100%"
          height="100%"
          borderRadius={999}
          blur={12*3}
          displace={7*0.25}
          distortionScale={-36*1.5}
          saturation={1.15}
          backgroundOpacity={0.12*2}
          className="header-glass"
        >
          <div className="flex w-full items-center justify-between gap-2 sm:gap-3">
            <Link href="/" className="flex shrink-0 items-center gap-2">
              <Image
                src="/logo2.png"
                alt="Servemon"
                width={24}
                height={24}
                className="rounded-full sm:h-7 sm:w-7"
              />
              <span className="hidden text-lg font-bold uppercase tracking-tight text-white sm:inline">
                Servemon
              </span>
            </Link>
            <nav className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-mint sm:gap-2 sm:text-sm">
              <Link
                href="/sermons"
                className="whitespace-nowrap rounded-full px-2 py-2 transition-colors hover:bg-white/10 hover:text-white sm:px-4 sm:py-2"
              >
                {t(lang, "nav.browse")}
              </Link>
              <Link
                href="/roadmap"
                className="whitespace-nowrap rounded-full px-2.5 py-2 transition-colors hover:bg-white/10 hover:text-white sm:px-4 sm:py-2"
              >
                {t(lang, "nav.roadmap")}
              </Link>
              <Link
                href="/about"
                className="whitespace-nowrap rounded-full px-2.5 py-2 transition-colors hover:bg-white/10 hover:text-white sm:px-4 sm:py-2"
              >
                {t(lang, "nav.about")}
              </Link>
              <LangToggle current={lang} />
            </nav>
          </div>
        </GlassSurface>
      </div>
    </header>
  );
}
