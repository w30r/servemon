import type { Metadata } from "next";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLang();
  return {
    title: t(lang, "about.title"),
  };
}

export default async function About() {
  const lang = await getLang();

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 pb-24">
      <div className="glass rounded-3xl p-8 sm:p-10">
        <h1 className="text-3xl font-bold tracking-tight">
          {t(lang, "about.title")} Servemon
        </h1>
        <div className="mt-6 space-y-4 leading-relaxed text-mint-light/90">
          <p>{t(lang, "about.intro1")}</p>
          <p>{t(lang, "about.intro2")}</p>
          <p>{t(lang, "about.intro3")}</p>
        </div>

        <h2 className="mt-8 text-xl font-semibold text-white">
          {t(lang, "about.whatTitle")}
        </h2>
        <p className="mt-3 leading-relaxed text-mint-light/90">
          {t(lang, "about.whatBody")}
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">
          {t(lang, "about.coverageTitle")}
        </h2>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-mint-light/90">
          <li>{t(lang, "about.coverageSelangor")}</li>
          <li>{t(lang, "about.coverageFt")}</li>
        </ul>
        <p className="mt-3 leading-relaxed text-mint-light/90">
          {t(lang, "about.coverageMore")}
        </p>

        <h2 className="mt-8 text-xl font-semibold text-white">
          {t(lang, "about.sourcesTitle")}
        </h2>
        <p className="mt-3 leading-relaxed text-mint-light/90">
          {t(lang, "about.sourcesIntro")}
        </p>
        <ul className="mt-3 list-disc space-y-1.5 pl-5 leading-relaxed text-mint-light/90">
          <li>
            <a
              href="https://e-khutbah.jais.gov.my"
              target="_blank"
              rel="noopener noreferrer"
              className="text-glow underline-offset-2 hover:underline"
            >
              {t(lang, "about.sourcesJais")}
            </a>
          </li>
          <li>
            <a
              href="https://www.jakim.gov.my"
              target="_blank"
              rel="noopener noreferrer"
              className="text-glow underline-offset-2 hover:underline"
            >
              {t(lang, "about.sourcesJakim")}
            </a>
          </li>
        </ul>

        <h2 className="mt-8 text-xl font-semibold text-white">
          {t(lang, "about.ownershipTitle")}
        </h2>
        <p className="mt-3 leading-relaxed text-mint-light/90">
          {t(lang, "about.ownershipBody")}
        </p>
      </div>
    </div>
  );
}
