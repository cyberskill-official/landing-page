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
      ? "Lumi, vị thần đèn vàng của chúng tôi, biến một điều ước rõ ràng thành phần mềm vận hành được: thứ mà đội ngũ của bạn thật sự dùng để làm việc, được xây để bàn giao và để bền lâu."
      : "Lumi, our golden genie, turns a clear wish into working software: the kind your team actually runs on, built to ship and to last.";
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
