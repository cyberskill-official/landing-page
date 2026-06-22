import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { LanguageSwitcher } from "@/components/header/LanguageSwitcher";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const base = `/${locale}`;
  return (
    <header className="cs-header cs-surface-light cs-no-print">
      <div className="cs-container cs-header-inner">
        <Link href={base} className="cs-wordmark" aria-label="CyberSkill home">
          <span className="cs-wordmark-name">CyberSkill</span>
          <span className="cs-wordmark-slogan">{localize(company.slogan, locale)}</span>
        </Link>

        <nav className="cs-nav" aria-label="Primary">
          <a href={`${base}#services`}>{dict.nav.services}</a>
          <Link href={`${base}/work`}>{dict.nav.work}</Link>
          <a href={`${base}#proof`}>{dict.nav.team}</a>
          <Link href={`${base}/careers`}>{dict.nav.careers}</Link>
          <a href={`${base}#contact`}>{dict.nav.contact}</a>
        </nav>

        <div className="cs-header-actions">
          <ThemeToggle toDark={dict.a11y.themeToDark} toLight={dict.a11y.themeToLight} />
          <LanguageSwitcher current={locale} />
          <GenieOpenButton className="cs-btn cs-btn-primary cs-header-cta">
            {dict.hero.ctaSecondary}
          </GenieOpenButton>
        </div>
      </div>
    </header>
  );
}
