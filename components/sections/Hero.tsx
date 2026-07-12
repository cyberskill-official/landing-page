import type { CSSProperties } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { company } from "@/lib/content/site";
import { splitSloganWords } from "@/lib/motion/kinetic";
import { Aurora } from "@/components/motion/Aurora";
import { HeroWish } from "@/components/genie/HeroWish";
import { GenieOpenButton } from "@/components/genie/GenieOpenButton";

export function Hero({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const slogan = company.slogan[locale];
  const words = splitSloganWords(slogan);
  const lead = dict.hero.lead;
  return (
    <section id="wish" className="cs-hero" aria-labelledby="hero-title">
      <Aurora />
      <div className="cs-container cs-hero-inner">
        <p className="cs-eyebrow">{dict.hero.eyebrow}</p>
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
