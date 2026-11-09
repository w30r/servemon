import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Header from "@/components/header";
import Footer from "@/components/footer";
import BackToTop from "@/components/back-to-top";
import { LANGS, t } from "@/lib/i18n";
import { getLang as getServerLang } from "@/lib/i18n-server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getServerLang();
  return {
    title: {
      default: "Servemon",
      template: "%s — Servemon",
    },
    description: t(lang, "meta.desc"),
    openGraph: {
      title: "Servemon — Friday Sermon Archive",
      description: t(lang, "meta.desc"),
      images: ["/brand/servemon-og.png"],
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const lang = await getServerLang();
  const htmlLang = LANGS.find((l) => l.code === lang)?.htmlLang ?? "en";

  return (
    <html
      lang={htmlLang}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans text-white">
        <div className="app-background" aria-hidden="true" />
        <Header lang={lang} />
        <main className="flex-1">{children}</main>
        <Footer lang={lang} />
        <BackToTop />
      </body>
    </html>
  );
}
