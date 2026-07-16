import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company, clientLogos, testimonials } from "@/lib/content/site";
import { Aurora } from "@/components/motion/Aurora";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";
import { Icon } from "@/components/ui/Icon";
import { KineticText } from "@/components/motion/KineticText";
import { Testimonial } from "@/components/ui/Testimonial";
import { MessagingChips } from "@/components/cta/MessagingChips";
import { CapacityLine } from "@/components/sections/CapacityLine";
import { BookingLink } from "@/components/cta/BookingLink";
import { getBookingUrl } from "@/lib/content/booking";

export function ContactCta({ locale, dict }: { locale: Locale; dict: Dictionary; hasNewsletter?: boolean }) {
  const bookingUrl = getBookingUrl();
  return (
    <section id="contact" className="cs-section cs-section-contact" aria-labelledby="contact-title" suppressHydrationWarning>
      {/* Decorative aurora as CSS background (not next/image) so it cannot
          become LCP or fail image-aspect-ratio under lab. */}
      <div className="cs-contact-bg" aria-hidden="true" />
      <Aurora className="cs-aurora-contact" />
      <div className="cs-container cs-contact-grid">
        <div className="cs-contact-intro">
          <h2 id="contact-title" className="cs-kt-h" data-mask-reveal="" aria-label={dict.sections.contactTitle}>
            <KineticText text={dict.sections.contactTitle} />
          </h2>
          <CapacityLine locale={locale} />
          <p className="cs-section-lead" data-mask-reveal="">{dict.sections.contactLead}</p>

          <p className="cs-contact-lumi">
            <GenieOpenButton className="cs-btn cs-btn-primary cs-btn-lumi" flow="contact">
              <Icon name="sparkle" size="sm" /> {dict.genie.contactLumiCta}
            </GenieOpenButton>
          </p>
          <p className="cs-consent-note" style={{ marginTop: "var(--cs-space-sm)" }}>
            {dict.genie.consent}
          </p>

          {testimonials.length > 0 && (
            <div style={{ marginTop: "var(--cs-space-lg)" }}>
              <Testimonial testimonial={testimonials[0]} locale={locale} />
            </div>
          )}
        </div>

        <div className="cs-contact-aside cs-surface-light">
          <p className="cs-eyebrow" style={{ color: "var(--cs-color-primary)", marginTop: 0 }}>
            {locale === "vi" ? "Liên hệ trực tiếp" : "Reach us directly"}
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

          <p className="cs-contact-booking" style={{ marginTop: "var(--cs-space-md)" }}>
            <BookingLink locale={locale} location="contact-section" url={bookingUrl} />
          </p>

          <MessagingChips locale={locale} location="contact-section" />

          {clientLogos.length >= 3 && (
            <div
              className="cs-logo-strip"
              style={{
                display: "flex",
                gap: "var(--cs-space-md)",
                flexWrap: "wrap",
                marginTop: "var(--cs-space-lg)",
                opacity: 0.6,
                filter: "grayscale(100%)",
              }}
            >
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
      </div>
    </section>
  );
}
