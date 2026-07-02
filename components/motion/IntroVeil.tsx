import type { Locale } from "@/lib/i18n/config";
import { company } from "@/lib/content/site";

// First-visit branded intro veil (FR-DS-012): Lumi's orb + the slogan resolve
// into the hero. The timeline is pure CSS, gated by the inline script in
// app/layout.tsx which sets <html data-intro="play"> once per browser session
// (sessionStorage) and never under prefers-reduced-motion - so crawlers, no-JS
// visitors, and reduced-motion users never see it at all (display:none without
// the attribute). aria-hidden + pointer-events:none means it can trap neither
// focus nor clicks, and the `forwards` fill ends at visibility:hidden, so
// dismissal is guaranteed by CSS alone - no JS timer to fail.
export function IntroVeil({ locale }: { locale: Locale }) {
  return (
    <div className="cs-intro cs-no-print" aria-hidden="true">
      <div className="cs-intro-inner">
        <span className="cs-lumi-orb cs-intro-orb" />
        <p className="cs-intro-name">CyberSkill</p>
        <p className="cs-intro-slogan">
          <span>{company.slogan[locale]}</span>
        </p>
      </div>
    </div>
  );
}
