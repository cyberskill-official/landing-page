import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";
import { Icon } from "@/components/ui/Icon";

// Story-driven hero. The H1 is real server-rendered text (the LCP element),
// never the canvas, so the page paints, ranks, and converts even if WebGL
// never loads (research doc §E: don't let the canvas own LCP).
export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const lead =
    locale === "vi"
      ? "Chúng tôi biến ý chí rõ ràng thành phần mềm vận hành được: web, di động và hệ thống nội bộ."
      : "We turn a clear intention into working software: web, mobile, and the internal systems a company runs on.";
  return (
    <section className="cs-hero" aria-labelledby="hero-title">
      <div className="cs-container cs-hero-inner">
        <p className="cs-eyebrow">
          <Icon name="sparkle" size="sm" className="cs-sparkle" />{" "}
          {dict.hero.eyebrow}
        </p>
        <h1 id="hero-title" className="cs-hero-title">
          {company.slogan[locale]}
        </h1>
        <p className="cs-hero-lead">{lead}</p>
        <div className="cs-hero-actions">
          <a className="cs-btn cs-btn-primary" href={`/${locale}#contact`}>
            {dict.hero.ctaPrimary}
          </a>
          <GenieOpenButton className="cs-btn cs-btn-secondary">
            {dict.hero.ctaSecondary}
          </GenieOpenButton>
        </div>
        <p className="cs-hero-hint" aria-hidden="true">
          {dict.hero.scrollHint}
        </p>
      </div>
    </section>
  );
}
