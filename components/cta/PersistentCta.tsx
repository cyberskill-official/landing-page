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
      <GenieOpenButton className="cs-btn cs-btn-brand">
        {dict.hero.ctaSecondary}
      </GenieOpenButton>
    </div>
  );
}
