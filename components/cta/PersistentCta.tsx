import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";

// Always-available, low-friction conversion path that never depends on the 3D
// scene finishing (research doc §E). Fixed bottom-right; hidden in print.
export function PersistentCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <div className="cs-persistent-cta cs-no-print" aria-label="Quick actions">
      <a className="cs-btn cs-btn-primary" href={`/${locale}#contact`}>
        {dict.hero.ctaPrimary}
      </a>
      {/* Hidden while the living mascot is on stage: Lumi itself opens the
          chat there; this stays for devices without the mascot. */}
      <GenieOpenButton className="cs-btn cs-btn-brand cs-lumi-alt">
        {dict.hero.ctaSecondary}
      </GenieOpenButton>
    </div>
  );
}
