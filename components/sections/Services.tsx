import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { services } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { Reveal } from "@/components/motion/Reveal";
import { KineticText } from "@/components/motion/KineticText";
import { BrandIcon, type BrandIconName } from "@/components/ui/BrandIcon";

export function Services({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="services" className="cs-section cs-section-alt" aria-labelledby="services-title">
      <div className="cs-container">
        <h2 id="services-title" className="cs-kt-h" data-mask-reveal="" aria-label={dict.sections.servicesTitle}>
          <KineticText text={dict.sections.servicesTitle} />
        </h2>
        <p className="cs-section-lead" data-mask-reveal="">{dict.sections.servicesLead}</p>
        <div className="cs-services-grid">
          {services.map((s, i) => (
            <Reveal as="article" key={s.id} className="cs-service-card cs-surface-standard" delayMs={i * 80}>
              <span className="cs-card-icon" aria-hidden="true"><BrandIcon name={s.id as BrandIconName} /></span>
              <h3>{localize(s.title, locale)}</h3>
              <p>{localize(s.summary, locale)}</p>
              <ul className="cs-service-outcomes" role="list">
                {s.outcomes.map((o, j) => (
                  <li key={j}>{localize(o, locale)}</li>
                ))}
              </ul>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
