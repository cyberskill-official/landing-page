import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";
import { LeadForm } from "@/components/cta/LeadForm";

export function ContactCta({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  return (
    <section id="contact" className="cs-section cs-section-contact" aria-labelledby="contact-title">
      <div className="cs-container cs-contact-grid">
        <div className="cs-contact-intro">
          <h2 id="contact-title">{dict.sections.contactTitle}</h2>
          <p className="cs-section-lead">{dict.sections.contactLead}</p>
          <ul className="cs-contact-list" role="list">
            <li>
              <a href={`mailto:${company.email}`}>{company.email}</a>
            </li>
            <li>
              <a href={`tel:${company.phone.replace(/\s/g, "")}`}>
                {company.phone} ({company.phoneContact})
              </a>
            </li>
            <li>{company.address}</li>
          </ul>
        </div>
        <div className="cs-contact-form cs-surface-light">
          <LeadForm locale={locale} dict={dict} source="contact" />
          <p className="cs-consent-note">{dict.genie.consent}</p>
        </div>
      </div>
    </section>
  );
}
