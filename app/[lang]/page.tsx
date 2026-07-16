import { isLocale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { Hero } from "@/components/sections/Hero";
import { TrustBand } from "@/components/sections/TrustBand";
import { Process } from "@/components/sections/Process";
import { WorkPreview } from "@/components/sections/WorkPreview";
import { NotesPreview } from "@/components/sections/NotesPreview";
import { ContactCta } from "@/components/sections/ContactCta";
import { HomeFaqJsonLd } from "@/components/seo/HomeFaqJsonLd";
import { ServicesJsonLd } from "@/components/seo/ServicesJsonLd";
import { StaticPoster } from "@/components/canvas/StaticPoster";
import { DeferredHomeCanvas } from "@/components/canvas/DeferredHomeCanvas";
import { HomeMotionBundle } from "@/components/motion/HomeMotionBundle";

/**
 * Dual-purpose home:
 * 1) Quick vision + professional process
 * 2) Work showcases + notes (attract & prove craft)
 * Fragmented mid-page funnels live in Lumi / dedicated pages instead.
 */
export default async function HomePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <>
      {/* SSR poster (gradient only until DeferredPoster arms the webp). Live
          WebGL upgrades after idle via DeferredHomeCanvas — keeps R3F off the
          first-load client graph. */}
      <div className="cs-canvas-layer" aria-hidden="true">
        <StaticPoster />
      </div>
      <DeferredHomeCanvas />
      <HomeMotionBundle />
      <Hero locale={locale} dict={dict} />
      <TrustBand locale={locale} />
      <Process locale={locale} dict={dict} />
      <WorkPreview locale={locale} dict={dict} />
      <NotesPreview locale={locale} dict={dict} />
      <ContactCta locale={locale} dict={dict} />
      <HomeFaqJsonLd locale={locale} />
      <ServicesJsonLd locale={locale} />
    </>
  );
}
