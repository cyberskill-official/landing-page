import Image from "next/image";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company, clientLogos, testimonials } from "@/lib/content/site";
import { LeadForm } from "@/components/cta/LeadForm";
import { Aurora } from "@/components/motion/Aurora";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";
import { Icon } from "@/components/ui/Icon";
import { KineticText } from "@/components/motion/KineticText";
import { Testimonial } from "@/components/ui/Testimonial";
import { MessagingChips } from "@/components/cta/MessagingChips";
import { CapacityLine } from "@/components/sections/CapacityLine";
import { CtaLink } from "@/components/cta/CtaLink";
import { BookingLink } from "@/components/cta/BookingLink";
import { getBookingUrl } from "@/lib/content/booking";
import auroraGold from "@/public/brand/aurora-gold.jpg";

export function ContactCta({ locale, dict, hasNewsletter }: { locale: Locale; dict: Dictionary; hasNewsletter?: boolean }) {
  // Server component: resolve booking URL once so the client BookingLink does not
  // depend on a dynamic env key in the browser bundle.
  const bookingUrl = getBookingUrl();
  return (
    <section id="contact" className="cs-section cs-section-contact" aria-labelledby="contact-title" suppressHydrationWarning>
      <div className="cs-contact-bg" aria-hidden="true">
        <Image
          src={auroraGold}
          alt=""
          fill
          sizes="(max-width: 768px) 276px, 100vw"
          placeholder="blur"
          className="cs-contact-bg-img"
        />
      </div>
      <Aurora className="cs-aurora-contact" />
      <div className="cs-container cs-contact-grid">
        <div className="cs-contact-intro">
          <h2 id="contact-title" className="cs-kt-h" data-mask-reveal="" aria-label={dict.sections.contactTitle}>
            <KineticText text={dict.sections.contactTitle} />
          </h2>
          {/* FR-CTA-018: capacity line adjacent to contact heading */}
          <CapacityLine locale={locale} />
          <p className="cs-section-lead" data-mask-reveal="">{dict.sections.contactLead}</p>
          {/* FR-CTA-015: outcome-led promise also in the contact band */}
          <p className="cs-contact-promise">
            <CtaLink
              className="cs-btn cs-btn-secondary"
              href={`/${locale}#contact`}
              location="contact-section"
              label={dict.hero.ctaPrimary}
            >
              {dict.hero.ctaPrimary}
            </CtaLink>
          </p>
          {/* FR-CTA-005: booking link — env-gated, no embed/script */}
          <p className="cs-contact-booking" style={{ marginTop: "var(--cs-space-2)" }}>
            <BookingLink locale={locale} location="contact-section" url={bookingUrl} />
          </p>
          {/* Lumi-first contact (FR-CHAR-026): the conversation is the primary
              path; the classic form stays available below as the fallback. */}
          <p className="cs-contact-lumi">
            <GenieOpenButton className="cs-btn cs-btn-primary cs-btn-lumi">
              <Icon name="sparkle" size="sm" /> {dict.genie.contactLumiCta}
            </GenieOpenButton>
          </p>
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

          <MessagingChips locale={locale} location="contact-section" />

          {testimonials.length > 0 && (
            <div style={{ marginTop: "var(--cs-space-lg)" }}>
              <Testimonial testimonial={testimonials[0]} locale={locale} />
            </div>
          )}

          {clientLogos.length >= 3 && (
            <div className="cs-logo-strip" style={{
              display: "flex",
              gap: "var(--cs-space-md)",
              flexWrap: "wrap",
              marginTop: "var(--cs-space-lg)",
              opacity: 0.6,
              filter: "grayscale(100%)",
            }}>
              {clientLogos.map((logo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={logo.name}
                  src={logo.logoUrl}
                  alt={logo.name}
                  width={100}
                  height={30}
                  style={{ objectFit: "contain", maxHeight: "25px" }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="cs-contact-form cs-surface-light">
          {/* Native details/summary: works without JS, so the form stays
              reachable for every visitor while the conversation leads. */}
          <details className="cs-contact-details">
            <summary>{dict.genie.contactFormFallback}</summary>
            <LeadForm locale={locale} dict={dict} source="contact" hasNewsletter={hasNewsletter} />
            <p className="cs-consent-note">{dict.genie.consent}</p>
          </details>
        </div>
      </div>
    </section>
  );
}
