import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { LanguageSwitcher } from "@/components/header/LanguageSwitcher";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { SoundToggle } from "@/components/header/SoundToggle";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";

export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const base = `/${locale}`;
  return (
    <header className="cs-header cs-surface-light cs-no-print">
      <div className="cs-container cs-header-inner">
        <Link href={base} className="cs-wordmark" aria-label={dict.a11y.homeLabel}>
          {/* Official mark. width/height reserve the box so it never shifts
              layout; kept <= the header's 38px min-height so header geometry is
              unchanged whether or not the SVG has painted (CLS-safe). Decorative
              (alt=""): the visible name and the link's aria-label carry meaning. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img className="cs-wordmark-mark" src="/brand/logo.svg" alt={dict.a11y.logoAlt} width={34} height={34} />
          <span className="cs-wordmark-text">
            <span className="cs-wordmark-name">CyberSkill</span>
            <span className="cs-wordmark-slogan">{localize(company.slogan, locale)}</span>
          </span>
        </Link>

        <nav className="cs-nav" aria-label={dict.a11y.primaryNav}>
          <a href={`${base}#services`}>{dict.nav.services}</a>
          <Link href={`${base}/work`}>{dict.nav.work}</Link>
          <a href={`${base}/team`}>{dict.nav.team}</a>
          <Link href={`${base}/careers`}>{dict.nav.careers}</Link>
          <a href={`${base}#contact`}>{dict.nav.contact}</a>
        </nav>

        <div className="cs-header-actions">
          <SoundToggle on={dict.a11y.soundOn} off={dict.a11y.soundOff} />
          <ThemeToggle toDark={dict.a11y.themeToDark} toLight={dict.a11y.themeToLight} />
          <LanguageSwitcher current={locale} label={dict.a11y.languageLabel} />
          <GenieOpenButton className="cs-btn cs-btn-primary cs-header-cta cs-lumi-alt">
            {dict.hero.ctaSecondary}
          </GenieOpenButton>
        </div>
      </div>
    </header>
  );
}
