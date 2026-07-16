import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { LanguageSwitcher } from "@/components/header/LanguageSwitcher";
import { ThemeToggle } from "@/components/header/ThemeToggle";
import { SoundToggle } from "@/components/header/SoundToggle";

/**
 * Slim primary nav for a dual-purpose site:
 * 1) Vision + process (Process page + home overview)
 * 2) Work showcases + Notes articles
 * Contact is Lumi, not a fragmented #anchor list.
 * Header CTA is a progressive-enhancement anchor (Genie mounts later).
 */
export function SiteHeader({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const base = `/${locale}`;
  return (
    <header className="cs-header cs-surface-light cs-no-print">
      <div className="cs-container cs-header-inner">
        <Link href={base} prefetch={false} className="cs-wordmark" aria-label={dict.a11y.homeLabel}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="cs-wordmark-mark"
            src="/brand/logo.svg"
            alt={dict.a11y.logoAlt}
            width={34}
            height={34}
            decoding="async"
            // Avoid competing with hero text LCP under mobile throttle.
            fetchPriority="low"
          />
          <span className="cs-wordmark-text">
            <span className="cs-wordmark-name">CyberSkill</span>
            <span className="cs-wordmark-slogan">{localize(company.slogan, locale)}</span>
          </span>
        </Link>

        <nav className="cs-nav" aria-label={dict.a11y.primaryNav}>
          <Link href={`${base}/work`} prefetch={false}>{dict.nav.work}</Link>
          <Link href={`${base}/how-we-build`} prefetch={false}>{dict.nav.howWeBuild}</Link>
          <Link href={`${base}/notes`} prefetch={false}>{dict.nav.notes}</Link>
        </nav>

        <div className="cs-header-actions">
          <SoundToggle on={dict.a11y.soundOn} off={dict.a11y.soundOff} />
          <ThemeToggle toDark={dict.a11y.themeToDark} toLight={dict.a11y.themeToLight} />
          <LanguageSwitcher current={locale} label={dict.a11y.languageLabel} />
          <a
            className="cs-btn cs-btn-primary cs-header-cta"
            href={`${base}#contact`}
            data-header-cta=""
          >
            {dict.genie.open}
          </a>
        </div>
      </div>
    </header>
  );
}
