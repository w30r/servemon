import { notFound } from "next/navigation";
import { getSermon, listSermons } from "@/lib/db";
import Link from "next/link";
import { formatDate, compareDatesDesc, isCurrentWeek, isUpcoming } from "@/lib/format";
import SermonViewer from "@/components/sermon-viewer";
import ShareButton from "@/components/share-button";
import StateFlag from "@/components/state-flag";
import DownloadButton, { type DownloadFile } from "@/components/download-button";
import { getSiteUrl } from "@/lib/site-url";
import { getLang } from "@/lib/i18n-server";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function SermonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const lang = await getLang();
  const { id } = await params;
  const sermon = getSermon(id);
  if (!sermon) notFound();

  const siteUrl = await getSiteUrl();

  const downloadFiles: DownloadFile[] = [
    sermon.pdf_jawi
      ? { lang: "jawi" as const, url: sermon.pdf_jawi }
      : null,
    sermon.pdf_rumi
      ? { lang: "rumi" as const, url: sermon.pdf_rumi }
      : null,
    sermon.pdf_english
      ? { lang: "english" as const, url: sermon.pdf_english }
      : null,
  ].filter((f): f is DownloadFile => f !== null);

  const availableLanguages = [
    sermon.pdf_jawi ? "Jawi" : null,
    sermon.pdf_rumi ? "Rumi" : null,
    sermon.pdf_english ? "English" : null,
  ].filter(Boolean);
  const languageLabel = availableLanguages.length
    ? availableLanguages.join(" / ")
    : "Rumi";

  const related = listSermons({ state: sermon.state })
    .filter((s) => s.id !== sermon.id)
    .sort((a, b) => compareDatesDesc(a.date, b.date))
    .slice(0, 3);

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <Link
        href="/sermons"
        className="text-sm font-medium text-mint transition-colors hover:text-white"
      >
        {t(lang, "detail.back")}
      </Link>

      <div className="glass mt-6 rounded-3xl p-6 sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            {isCurrentWeek(sermon.date) && (
              <span className="badge-current mr-2 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
                {t(lang, "list.thisWeek")}
              </span>
            )}
            {isUpcoming(sermon.date) && (
              <span className="badge-accent mr-2 inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
                {t(lang, "list.upcoming")}
              </span>
            )}
            <span className="badge-accent inline-block rounded-full px-3 py-1 text-xs font-semibold tracking-wide">
              {languageLabel}
            </span>
            <span className="ml-2 inline-flex items-center gap-2 text-sm text-mint">
              <StateFlag state={sermon.state} />
              {sermon.state}
            </span>
            <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              {sermon.title}
            </h1>
            <p className="mt-2 text-mint/80">
              <time dateTime={sermon.date}>{formatDate(sermon.date)}</time>
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <DownloadButton
              files={downloadFiles}
              label={t(lang, "detail.download")}
              title={t(lang, "detail.downloadTitle")}
              hint={t(lang, "detail.downloadHint")}
              closeLabel={t(lang, "detail.close")}
              langLabels={{
                jawi: t(lang, "detail.jawi"),
                rumi: t(lang, "detail.rumi"),
                english: t(lang, "detail.english"),
              }}
            />
          </div>
        </div>
        <div className="mt-4 border-t border-white/10 pt-4">
          <ShareButton
            title={sermon.title}
            url={`${siteUrl}/sermons/${sermon.id}`}
            labels={{
              whatsapp: t(lang, "share.whatsapp"),
              copy: t(lang, "share.copy"),
              copied: t(lang, "share.copied"),
            }}
          />
        </div>
      </div>

      <SermonViewer
        title={sermon.title}
        jawiUrl={sermon.pdf_jawi}
        rumiUrl={sermon.pdf_rumi}
        englishUrl={sermon.pdf_english}
        noPdfText={t(lang, "viewer.noPdf")}
      />

      {related.length > 0 && (
        <section className="mt-10 pb-8">
          <h2 className="text-lg font-semibold">
            {t(lang, "detail.moreFrom", { state: sermon.state })}
          </h2>
          <ul className="mt-4 space-y-3">
            {related.map((s) => (
              <li key={s.id}>
                <Link
                  href={`/sermons/${s.id}`}
                  className="glass flex justify-between gap-4 rounded-2xl p-4 text-sm font-medium transition-colors hover:bg-white/20"
                >
                  <span>{s.title}</span>
                  <span className="shrink-0 text-mint/70">
                    {formatDate(s.date)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
