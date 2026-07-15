import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { Aurora } from "@/components/motion/Aurora";
import { KineticText } from "@/components/motion/KineticText";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";
import { Icon } from "@/components/ui/Icon";

// Recruiting / employer-branding surface. Talent-pool capture is Lumi (careers flow).
export function Careers({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="careers" className="cs-section" aria-labelledby="careers-title" suppressHydrationWarning>
      <Aurora />
      <div className="cs-container cs-careers">
        <div>
          <h2 id="careers-title" className="cs-kt-h" data-mask-reveal="" aria-label={dict.sections.careersTitle}>
            <KineticText text={dict.sections.careersTitle} />
          </h2>
          <p className="cs-section-lead" data-mask-reveal="">{dict.sections.careersLead}</p>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--cs-space-3)", alignItems: "center" }}>
          <GenieOpenButton className="cs-btn cs-btn-primary cs-btn-lumi" flow="careers">
            <Icon name="sparkle" size="sm" /> {dict.genie.careersLumiCta}
          </GenieOpenButton>
          <Link className="cs-btn cs-btn-brand" href={`/${locale}/careers`}>
            {dict.sections.careersCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
