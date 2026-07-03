import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Hero } from "@/components/sections/Hero";
import { StoryArc } from "@/components/sections/StoryArc";
import { TrustBand } from "@/components/sections/TrustBand";
import { ValueProp } from "@/components/sections/ValueProp";
import { Marquee } from "@/components/sections/Marquee";
import { Services } from "@/components/sections/Services";
import { Process } from "@/components/sections/Process";
import { WorkPreview } from "@/components/sections/WorkPreview";
import { SocialProof } from "@/components/sections/SocialProof";
import { Faq } from "@/components/sections/Faq";
import { Careers } from "@/components/sections/Careers";
import { ContactCta } from "@/components/sections/ContactCta";
import { HomeFaqJsonLd } from "@/components/seo/HomeFaqJsonLd";
import { ServicesJsonLd } from "@/components/seo/ServicesJsonLd";
import { HeroPin } from "@/components/scroll/HeroPin";
import { CanvasMount } from "@/components/canvas/CanvasMount";
import { CosmosBackdrop } from "@/components/CosmosBackdrop";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <>
      {/* The permanent cosmos: always behind the content (z-index 0), revealed
          when the black hole digests the page away. Homepage only. */}
      <CosmosBackdrop />
      {/* The 3D canvas is mounted here, on the homepage only, so sub-pages carry
          no scene (its hero grid used to bleed over their content). */}
      <CanvasMount />
      <Hero locale={locale} dict={dict} />
      <TrustBand locale={locale} />
      <StoryArc locale={locale} />
      <ValueProp locale={locale} dict={dict} />
      <Marquee dict={dict} />
      <Services locale={locale} dict={dict} />
      <Process locale={locale} dict={dict} />
      <WorkPreview locale={locale} dict={dict} />
      <SocialProof locale={locale} dict={dict} />
      <Faq locale={locale} />
      <Careers locale={locale} dict={dict} />
      <ContactCta locale={locale} dict={dict} />
      <HomeFaqJsonLd locale={locale} />
      <ServicesJsonLd locale={locale} />
      {/* Last in the page segment: its effect proves the segment hydrated
          before GSAP is allowed to wrap .cs-hero in a pin-spacer. */}
      <HeroPin />
    </>
  );
}
