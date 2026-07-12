import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SkipLink } from "@/components/a11y/SkipLink";
import { SiteHeader } from "@/components/header/SiteHeader";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { PersistentCta } from "@/components/cta/PersistentCta";
import { GenieChat } from "@/components/genie/GenieChat";
import { GenieStatusAnnouncer } from "@/components/genie/GenieStatusAnnouncer";
import { LumiHotspot } from "@/components/canvas/LumiHotspot";
import { MotionBundle } from "@/components/motion/MotionBundle";
import { ScrollState } from "@/components/scroll/ScrollState";
import { ChapterRail } from "@/components/scroll/ChapterRail";
import { SceneFocus } from "@/components/scroll/SceneFocus";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const descriptions: Record<Locale, string> = {
  en: "CyberSkill is a software solutions consultancy in Ho Chi Minh City, building web apps, mobile apps, and internal systems that ship and stay maintainable.",
  vi: "CyberSkill là công ty tư vấn giải pháp phần mềm tại TP. Hồ Chí Minh: chúng tôi xây ứng dụng web, ứng dụng di động và hệ thống nội bộ chạy ổn định, dễ bảo trì.",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: "Turn Your Will Into Real",
    description: descriptions[locale],
    alternates: {
      canonical: `/${locale}`,
      languages: { en: "/en", vi: "/vi", "x-default": "/en" },
    },
    openGraph: {
      locale: locale === "vi" ? "vi_VN" : "en_US",
      alternateLocale: locale === "vi" ? "en_US" : "vi_VN",
      title: "CyberSkill - Turn Your Will Into Real",
      description: descriptions[locale],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = getDictionary(lang);

  // The story's acts, mapped to real home-page anchors. The rail hides itself on
  // routes where these anchors do not exist (work, careers, legal pages).
  const chapters =
    lang === "vi"
      ? [
          { id: "wish", label: "Điều ước" },
          { id: "services", label: "Kiến tạo" },
          { id: "process", label: "Quy trình" },
          { id: "work", label: "Dự án" },
          { id: "proof", label: "Cam kết" },
          { id: "contact", label: "Lời mời" },
        ]
      : [
          { id: "wish", label: "The wish" },
          { id: "services", label: "The craft" },
          { id: "process", label: "The method" },
          { id: "work", label: "The work" },
          { id: "proof", label: "The proof" },
          { id: "contact", label: "The invitation" },
        ];

  return (
    <>
      <SkipLink label={dict.nav.skipToContent} />
      <ScrollState />
      <noscript>
        <p className="cs-scene-noscript">{dict.a11y.sceneNoscript}</p>
      </noscript>
      <SiteHeader locale={lang} dict={dict} />
      <main id="main">{children}</main>
      <SiteFooter locale={lang} dict={dict} />
      <PersistentCta locale={lang} dict={dict} />
      <GenieChat locale={lang} dict={dict} />
      <LumiHotspot label={dict.genie.open} hint={dict.genie.hint} />
      <GenieStatusAnnouncer dict={dict} />
      <SceneFocus />
      <ChapterRail label={lang === "vi" ? "Các chương" : "Chapters"} chapters={chapters} />
      <MotionBundle locale={lang} />
      <div className="cs-grain" aria-hidden="true" />
      <OrganizationJsonLd locale={lang} />
    </>
  );
}
