import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";
import { splitSloganWords } from "@/lib/motion/kinetic";
import { Aurora } from "@/components/motion/Aurora";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";
import { HeroWish } from "@/components/genie/HeroWish";
import { Icon } from "@/components/ui/Icon";

// Story-driven hero. The H1 is real server-rendered text (the LCP element),
// never the canvas, so the page paints, ranks, and converts even if WebGL
// never loads (research doc §E: don't let the canvas own LCP).
//
// Kinetic headline (FR-DS-012): the slogan renders as per-word masked spans so
// each line rises in with a clip reveal and carries a slow gold shimmer. The
// full slogan stays the accessible name via aria-label (the visual spans are
// aria-hidden), the words are real SSR text inside layout-stable wrappers
// (transform-only reveal = zero CLS), and reduced motion gets the static
// headline via CSS.
export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const slogan = company.slogan[locale];
  const words = splitSloganWords(slogan);
  const lead =
    locale === "vi"
      ? "Lumi, vị thần đèn vàng của CyberSkill, biến một điều ước rõ ràng thành phần mềm chạy thật: thứ đội ngũ của bạn dùng mỗi ngày, được xây để bàn giao đúng hẹn và bền bỉ theo thời gian."
      : "Lumi, our golden genie, turns a clear wish into working software: the kind your team actually runs on, built to ship and to last.";
  return (
    <section className="cs-hero" aria-labelledby="hero-title">
      <Aurora />
      <div className="cs-container cs-hero-inner">
        <p className="cs-hero-meta" aria-hidden="true">
          <span>10.7769°N 106.7009°E</span>
          <span>{locale === "vi" ? "TP. Hồ Chí Minh" : "Ho Chi Minh City"}</span>
          <span>EN / VI</span>
        </p>
        <p className="cs-eyebrow">
          <Icon name="sparkle" size="sm" className="cs-sparkle" />{" "}
          {dict.hero.eyebrow}
        </p>
        <h1 id="hero-title" className="cs-hero-title cs-kinetic" aria-label={slogan}>
          {words.map((word, i) => (
            <span className="cs-kinetic-word" aria-hidden="true" key={`${word}-${i}`}>
              <span className="cs-kinetic-inner" style={{ "--wi": i } as CSSProperties}>
                {word}
              </span>
            </span>
          ))}
        </h1>
        <p className="cs-hero-lead">{lead}</p>
        {/* The signature interaction: type a wish, gold dust bursts, Lumi's chat
            opens with it in hand. Stays visible even with the live mascot - it is
            the on-brand entry to the wish flow. */}
        <HeroWish placeholder={dict.hero.wishPlaceholder} cta={dict.hero.wishCta} />
        {/* While the living mascot is on stage (html[data-lumi-live]) BOTH
            launchers hide: Lumi is the interface - its chat carries the
            project intent (wish flow) and the conversation. These remain the
            conversion path on devices without the mascot. */}
        <div className="cs-hero-actions">
          <a className="cs-btn cs-btn-primary cs-lumi-alt" href={`/${locale}#contact`}>
            {dict.hero.ctaPrimary}
          </a>
          <GenieOpenButton className="cs-btn cs-btn-secondary cs-lumi-alt">
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
