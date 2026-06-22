import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { testimonials, company } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { Reveal } from "@/components/motion/Reveal";

export function SocialProof({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const trust =
    locale === "vi"
      ? `Doanh nghiệp đã đăng ký, hoạt động từ ${company.founded}. DUNS ${company.duns}.`
      : `Registered company, operating since ${company.founded}. DUNS ${company.duns}.`;
  return (
    <section id="proof" className="cs-section cs-section-alt" aria-labelledby="proof-title">
      <div className="cs-container">
        <h2 id="proof-title">{dict.sections.proofTitle}</h2>
        <div className="cs-proof-grid">
          {testimonials.map((t, i) => (
            <Reveal as="article" key={i} className="cs-proof-card cs-surface-standard" delayMs={i * 80}>
              <blockquote>{localize(t.quote, locale)}</blockquote>
              <footer>
                <span className="cs-proof-author">{t.author}</span>
                <span className="cs-proof-role">{localize(t.role, locale)}</span>
              </footer>
            </Reveal>
          ))}
        </div>
        <p className="cs-trust-marker">{trust}</p>
      </div>
    </section>
  );
}
