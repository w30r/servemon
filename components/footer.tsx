import { t, type Lang } from "@/lib/i18n";

export default function Footer({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-auto">
      <div className="mx-auto max-w-5xl px-4 py-10 text-center text-sm text-mint/70">
        <p>{t(lang, "footer.tagline")}</p>
        <p className="mt-1">{t(lang, "footer.ownership")}</p>
      </div>
    </footer>
  );
}
