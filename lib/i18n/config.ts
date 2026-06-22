// i18n configuration. Vietnamese-first commitment (design-system doctrine):
// every UI string ships an EN and a VN counterpart. EN and VN each get a
// crawlable URL prefix so hreflang alternates are real, indexable pages.

export const locales = ["en", "vi"] as const;
export type Locale = (typeof locales)[number];

// Default locale used for the bare "/" entry and as a fallback.
export const defaultLocale: Locale = "en";

export function isLocale(value: string | undefined): value is Locale {
  return value === "en" || value === "vi";
}

// BCP-47 tags for the lang attribute and hreflang.
export const bcp47: Record<Locale, string> = {
  en: "en",
  vi: "vi-VN",
};

export const localeLabel: Record<Locale, string> = {
  en: "English",
  vi: "Tiếng Việt",
};
