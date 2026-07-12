import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company, faqs } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { KineticText } from "@/components/motion/KineticText";

export function Faq({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="faq" className="cs-section" aria-labelledby="faq-title">
      <div className="cs-container">
        <h2 id="faq-title" className="cs-kt-h" data-mask-reveal="" aria-label={dict.sections.faqTitle}>
          <KineticText text={dict.sections.faqTitle} />
        </h2>
        <ul className="cs-faq-list" role="list">
          {faqs.map((item, i) => (
            <li key={i} className="cs-faq-item cs-surface-standard">
              <details>
                <summary>
                  <h3>{localize(item.q, locale)}</h3>
                </summary>
                <p>{localize(item.a, locale)}</p>
              </details>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
