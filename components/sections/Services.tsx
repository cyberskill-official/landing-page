import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { services } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { Reveal } from "@/components/motion/Reveal";

export function Services({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="services" className="cs-section cs-section-alt" aria-labelledby="services-title">
      <div className="cs-container">
        <h2 id="services-title">{dict.sections.servicesTitle}</h2>
        <p className="cs-section-lead">{dict.sections.servicesLead}</p>
        <div className="cs-services-grid">
          {services.map((s, i) => (
            <Reveal as="article" key={s.id} className="cs-service-card cs-surface-standard" delayMs={i * 80}>
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
