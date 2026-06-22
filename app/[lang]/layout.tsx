import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { SkipLink } from "@/components/a11y/SkipLink";
import { SiteHeader } from "@/components/header/SiteHeader";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { PersistentCta } from "@/components/cta/PersistentCta";
import { GenieChat } from "@/components/genie/GenieChat";
import { CanvasMount } from "@/components/canvas/CanvasMount";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

const descriptions: Record<Locale, string> = {
  en: "CyberSkill is a software solutions consultancy in Ho Chi Minh City, building web apps, mobile apps, and internal systems that ship and stay maintainable.",
  vi: "CyberSkill là công ty tư vấn giải pháp phần mềm tại Thành phố Hồ Chí Minh, xây dựng ứng dụng web, ứng dụng di động và hệ thống nội bộ sẵn sàng vận hành và dễ bảo trì.",
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

  return (
    <>
      <SkipLink label={dict.nav.skipToContent} />
      <CanvasMount />
      <SiteHeader locale={lang} dict={dict} />
      <main id="main">{children}</main>
      <SiteFooter locale={lang} dict={dict} />
      <PersistentCta locale={lang} dict={dict} />
      <GenieChat locale={lang} dict={dict} />
      <OrganizationJsonLd locale={lang} />
    </>
  );
}
