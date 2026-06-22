import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { valueProps } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { Reveal } from "@/components/motion/Reveal";

export function ValueProp({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section className="cs-section" aria-labelledby="value-title">
      <div className="cs-container">
        <h2 id="value-title">{dict.sections.valueTitle}</h2>
        <ul className="cs-value-grid" role="list">
          {valueProps.map((vp, i) => (
            <Reveal as="li" key={i} className="cs-value-item cs-surface-light" delayMs={i * 80}>
              <p className="cs-value-stat">{localize(vp.stat, locale)}</p>
              <p className="cs-value-label">{localize(vp.label, locale)}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
