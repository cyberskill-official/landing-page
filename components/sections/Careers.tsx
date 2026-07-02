import Link from "next/link";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";

// Recruiting / employer-branding surface. The Genie can also route
// careers-intent visitors here (research doc §E recruiting layer).
export function Careers({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="careers" className="cs-section" aria-labelledby="careers-title">
      <div className="cs-container cs-careers">
        <div>
          <h2 id="careers-title" data-mask-reveal="">{dict.sections.careersTitle}</h2>
          <p className="cs-section-lead" data-mask-reveal="">{dict.sections.careersLead}</p>
        </div>
        <Link className="cs-btn cs-btn-brand" href={`/${locale}/careers`}>
          {dict.sections.careersCta}
        </Link>
      </div>
    </section>
  );
}
