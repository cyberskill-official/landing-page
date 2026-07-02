import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { work } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { Reveal } from "@/components/motion/Reveal";

export function WorkPreview({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="work" className="cs-section" aria-labelledby="work-title">
      <div className="cs-container">
        <h2 id="work-title" data-mask-reveal="">{dict.sections.workTitle}</h2>
        <p className="cs-section-lead" data-mask-reveal="">{dict.sections.workLead}</p>
        <div className="cs-work-grid">
          {work.map((item, i) => (
            <Reveal as="article" key={item.slug} className="cs-work-card cs-surface-light" delayMs={i * 80}>
              <p className="cs-eyebrow">{item.client}</p>
              <h3>
                <Link className="cs-stretch" href={`/${locale}/work/${item.slug}`}>
                  {localize(item.title, locale)}
                </Link>
              </h3>
              <p>{localize(item.result, locale)}</p>
            </Reveal>
          ))}
        </div>
        <p className="cs-section-more">
          <Link className="cs-btn cs-btn-secondary" href={`/${locale}/work`}>
            {dict.nav.work}
          </Link>
        </p>
      </div>
    </section>
  );
}
