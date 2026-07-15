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
import { TeardownCta } from "@/components/sections/TeardownCta";
import { EngagementModels } from "@/components/sections/EngagementModels";
import { Partnership } from "@/components/sections/Partnership";
import { HomeFaqJsonLd } from "@/components/seo/HomeFaqJsonLd";
import { ServicesJsonLd } from "@/components/seo/ServicesJsonLd";
import { CanvasMount } from "@/components/canvas/CanvasMount";
import { HomeMotionBundle } from "@/components/motion/HomeMotionBundle";

export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  const hasNewsletter = !!process.env.RESEND_API_KEY;

  return (
    <>
      {/* The 3D canvas is mounted here, on the homepage only, so sub-pages carry
          no scene (its hero grid used to bleed over their content). */}
      <CanvasMount />
      {/* Lumi brushes the content cards as she drifts past them (FR-CHAR-033).
          DOM-only, motion-gated, and inert until the live mascot is on stage. */}
      <HomeMotionBundle />
      <Hero locale={locale} dict={dict} />
      <TrustBand locale={locale} />
      <StoryArc locale={locale} dict={dict} />
      <ValueProp locale={locale} dict={dict} />
      <Marquee dict={dict} />
      <Services locale={locale} dict={dict} />
      <EngagementModels locale={locale} />
      <Process locale={locale} dict={dict} />
      <WorkPreview locale={locale} dict={dict} />
      <SocialProof locale={locale} dict={dict} />
      <Partnership locale={locale} dict={dict} hasNewsletter={hasNewsletter} />
      <Faq locale={locale} dict={dict} hasNewsletter={hasNewsletter} />
      <Careers locale={locale} dict={dict} />
      <TeardownCta locale={locale} dict={dict} />
      <ContactCta locale={locale} dict={dict} hasNewsletter={hasNewsletter} />
      {/* Verify-us lives footer-adjacent (SiteFooter) + /how-we-build (FR-CMS-014).
          Do not mount a third copy on the home page — it stacked above the footer. */}
      <HomeFaqJsonLd locale={locale} />
      <ServicesJsonLd locale={locale} />
      {/* HeroPin is now part of HomeMotionBundle */}
    </>
  );
}
