"use client";

import { useEffect } from "react";
import { bcp47, isLocale, type Locale } from "@/lib/i18n/config";

/** Keeps <html lang> in sync with the active /[lang] route without headers(). */
export function HtmlLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    if (!isLocale(locale)) return;
    document.documentElement.lang = bcp47[locale];
  }, [locale]);
  return null;
}
