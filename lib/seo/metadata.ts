import type { Metadata } from "next";
import type { Locale } from "@/lib/i18n/config";

// Centralised page metadata builder. Given a locale-less path ("" for home,
// "/work", "/work/operations-platform", ...) it returns a consistent canonical,
// a complete hreflang set (en, vi, x-default), and matching OpenGraph + Twitter
// blocks. Keeping one shape here means every route declares the same alternates
// (FR-SEO-009) and hreflang/canonical stay complete across the site (FR-SEO-005).
export function pageMetadata(opts: {
  locale: Locale;
  path: string;
  title: string;
  description?: string;
}): Metadata {
  const { locale, path, title, description } = opts;
  const canonical = `/${locale}${path}`;
  const languages = {
    en: `/en${path}`,
    vi: `/vi${path}`,
    "x-default": `/en${path}`,
  };
  return {
    title,
    ...(description ? { description } : {}),
    alternates: { canonical, languages },
    openGraph: {
      type: "website",
      url: canonical,
      locale: locale === "vi" ? "vi_VN" : "en_US",
      title,
      ...(description ? { description } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      ...(description ? { description } : {}),
    },
  };
}
