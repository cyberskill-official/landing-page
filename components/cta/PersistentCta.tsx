"use client";

import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { LeadCta } from "@/components/cta/LeadCta";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";

// Always-available conversion path. Opens Lumi — never scrolls to #contact.
export function PersistentCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <aside className="cs-persistent-cta cs-no-print cs-lumi-alt" aria-label={dict.a11y.quickActions}>
      <LeadCta className="cs-btn cs-btn-primary" flow="contact" showSparkle={false}>
        <span className="cs-cta-text">{dict.hero.ctaPrimary}</span>
      </LeadCta>
      <GenieOpenButton className="cs-btn cs-btn-brand cs-lumi-alt">
        <span className="cs-cta-text">{dict.hero.ctaSecondary}</span>
      </GenieOpenButton>
    </aside>
  );
}
