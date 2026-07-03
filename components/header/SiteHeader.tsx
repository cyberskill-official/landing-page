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
          {/* Inline (not <img>) so the mark paints with the first frame and never
              shifts the sticky header as an async image would (CLS). Keep in sync
              with public/brand/logo.svg (favicon + social card). */}
          <svg className="cs-wordmark-mark" viewBox="0 0 100 120" width={32} height={38} fill="none" aria-hidden="true">
            <path fill="#F4BA17" fillRule="evenodd" d="M50 5 C 27 24 11 49 18.5 72 C 24 89 35 99 50 99 C 65 99 76 89 81.5 72 C 89 49 73 24 50 5 Z M50 66 m -17 0 a 17 17 0 1 0 34 0 a 17 17 0 1 0 -34 0 Z" />
            <path d="M55 31 a 9 9 0 1 0 0 16" fill="none" stroke="#45210E" strokeWidth={4.6} strokeLinecap="round" />
            <path fill="#F4BA17" d="M30 96 L50 85 L70 96 L78 109 L57 113 L50 108 L43 113 L22 109 Z" />
          </svg>
          <span className="cs-wordmark-text">
            <span className="cs-wordmark-name">CyberSkill</span>
            <span className="cs-wordmark-slogan">{localize(company.slogan, locale)}</span>
          </span>
        </Link>

        <nav className="cs-nav" aria-label={dict.a11y.primaryNav}>
          <a href={`${base}#services`}>{dict.nav.services}</a>
          <Link href={`${base}/work`}>{dict.nav.work}</Link>
          <a href={`${base}#team`}>{dict.nav.team}</a>
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
