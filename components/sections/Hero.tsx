import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company, testimonials } from "@/lib/content/site";
import {
  commercialPolicy,
  getPublishableHeroAudience,
} from "@/lib/content/policy";
import { localize } from "@/lib/i18n/types";
import { Aurora } from "@/components/motion/Aurora";
import { HeroWishStatic } from "@/components/genie/HeroWishStatic";
import { Testimonial } from "@/components/ui/Testimonial";

// Inline LCP styles: system stack so FCP and LCP coincide under mobile lab
// throttling without waiting on webfonts or client hydration of CTA islands.
const lcpH1Style = {
  margin: "0.75rem 0 0",
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  fontWeight: 700 as const,
  fontSize: "clamp(2.5rem, 1.6rem + 4vw, 4.5rem)",
  lineHeight: 1.05,
  letterSpacing: "-0.03em",
  color: "#f4ece0",
  maxWidth: "20ch",
};

const leadStyle = {
  fontFamily:
    'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  fontSize: "1.05rem",
  lineHeight: 1.55,
  color: "#dcd2c3",
  maxWidth: "36rem",
  margin: "0 0 1rem",
};

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const slogan = company.slogan[locale];
  const lead = dict.hero.lead;
  const audience = getPublishableHeroAudience();
  const subline = audience
    ? locale === "vi"
      ? `Phần mềm vận hành thật cho ${localize(audience, locale)} tại TP.HCM và toàn cầu.`
      : `Production software for ${localize(audience, locale)} — built in Ho Chi Minh City, delivered worldwide.`
    : null;
  const contactHref = `/${locale}#contact`;

  return (
    <section id="wish" className="cs-hero" aria-labelledby="hero-title">
      <Aurora />
      <div className="cs-container cs-hero-inner">
        <p className="cs-eyebrow">{dict.hero.eyebrow}</p>
        <h1 id="hero-title" className="cs-hero-title" style={lcpH1Style}>
          {slogan}
        </h1>
        {subline ? (
          <p className="cs-hero-subline" data-hero-subline="">
            {subline}
          </p>
        ) : null}
        <p className="cs-hero-lead" style={leadStyle}>
          {lead}
        </p>
        {/* Server form first — client HeroWish mounts from DeferredEnhancements. */}
        <div data-hero-wish-root="">
          <HeroWishStatic
            locale={locale}
            placeholder={dict.hero.wishPlaceholder}
            cta={dict.hero.wishCta}
          />
        </div>
        {/* Plain anchors: no zustand/client graph on the LCP critical path.
            DeferredEnhancements upgrades these to GenieOpenButton / LeadCta. */}
        <div className="cs-hero-actions" data-hero-actions="">
          <a className="cs-btn cs-btn-primary cs-lumi-alt" href={contactHref}>
            {dict.hero.ctaPrimary}
          </a>
          <a className="cs-btn cs-btn-secondary cs-lumi-alt" href={contactHref}>
            {dict.hero.ctaSecondary}
          </a>
        </div>
        {testimonials.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "var(--cs-space-md)" }}>
            <Testimonial testimonial={testimonials[0]} locale={locale} />
          </div>
        )}
        <p className="cs-hero-hint" aria-hidden="true">
          {dict.hero.scrollHint}
        </p>
        <span hidden data-policy-decided-on={commercialPolicy.decidedOn} />
      </div>
    </section>
  );
}
