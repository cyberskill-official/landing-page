"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, localeLabel, type Locale } from "@/lib/i18n/config";

// Swaps the first path segment between locales, preserving the rest of the URL.
export function LanguageSwitcher({ current }: { current: Locale }) {
  const pathname = usePathname() || `/${current}`;

  function hrefFor(target: Locale): string {
    const parts = pathname.split("/");
    // parts[0] is "" (leading slash), parts[1] is the locale segment
    if (parts.length > 1) parts[1] = target;
    const next = parts.join("/");
    return next || `/${target}`;
  }

  // Remember the explicit choice so a later visit to the bare "/" honors it over
  // Accept-Language negotiation (FR-WEB-004). One year, lax, site-wide.
  function rememberChoice(target: Locale): void {
    document.cookie = `cs-locale=${target}; path=/; max-age=31536000; samesite=lax`;
  }

  return (
    <div className="cs-lang" role="group" aria-label="Language">
      {locales.map((loc) => (
        <Link
          key={loc}
          href={hrefFor(loc)}
          hrefLang={loc}
          aria-current={loc === current ? "true" : undefined}
          className="cs-lang-link"
          data-active={loc === current}
          onClick={() => rememberChoice(loc)}
        >
          {loc === "en" ? "EN" : "VI"}
          <span className="cs-visually-hidden"> {localeLabel[loc]}</span>
        </Link>
      ))}
    </div>
  );
}
