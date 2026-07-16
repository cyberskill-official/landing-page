import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, locales, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { resolveMetadata } from "@/lib/content/metadata";
import { SkipLink } from "@/components/a11y/SkipLink";
import { SiteHeader } from "@/components/header/SiteHeader";
import { SiteFooter } from "@/components/footer/SiteFooter";
import { DeferredEnhancements } from "@/components/DeferredEnhancements";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { HtmlLang } from "@/components/HtmlLang";
import { OrganizationJsonLd } from "@/components/seo/OrganizationJsonLd";

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string }>;
}): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return resolveMetadata(locale, "/");
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
  const hasNewsletter = !!process.env.RESEND_API_KEY;

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
      <HtmlLang locale={lang} />
      <SkipLink label={dict.nav.skipToContent} />
      <noscript>
        <p className="cs-scene-noscript">{dict.a11y.sceneNoscript}</p>
      </noscript>
      <SiteHeader locale={lang} dict={dict} />
      <main id="main">{children}</main>
      <SiteFooter locale={lang} dict={dict} hasNewsletter={hasNewsletter} />
      {/* Client enhancements (genie, motion, scroll, CTA) mount after idle so
          their JS stays off the mobile LCP critical path. */}
      <DeferredEnhancements
        locale={lang}
        dict={dict}
        chapters={chapters}
        chapterLabel={lang === "vi" ? "Các chương" : "Chapters"}
      />
      {/* Consent for session replay (Clarity). Own island — not behind the 20s
          DeferredEnhancements gate so visitors can Accept before leaving. */}
      <ConsentBanner locale={lang} dict={dict} />
      <div className="cs-grain" aria-hidden="true" />
      <OrganizationJsonLd locale={lang} />
    </>
  );
}
