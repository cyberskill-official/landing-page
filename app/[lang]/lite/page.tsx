import type { Metadata } from "next";
import Link from "next/link";
import { isLocale, type Locale } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { scenes, company } from "@/lib/content/site";
import { localize } from "@/lib/i18n/types";
import { LeadCta } from "@/components/cta/LeadCta";

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isLocale(lang) ? lang : "en";
  return {
    title: locale === "vi" ? "Phiên bản đơn giản" : "Simple version",
    robots: { index: false },
    alternates: { canonical: `/${locale}/lite` },
  };
}

// Reduced-motion, no-WebGL telling of the same story (WCAG 2.3.3 alternative
// and the DOM mirror of anything the 3D scene communicates).
export default async function LitePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : "en";
  const dict = getDictionary(locale);

  return (
    <section className="cs-section" suppressHydrationWarning>
      <div className="cs-container cs-lite">
        <p className="cs-eyebrow">CyberSkill - Lumi</p>
        <h1>{localize(scenes[0].heading, locale)}</h1>
        <ol className="cs-storyboard" role="list">
          {scenes.map((scene, i) => (
            <li key={scene.id} className="cs-storyboard-panel cs-surface-solid">
              <span className="cs-storyboard-index" aria-hidden="true">{i + 1}</span>
              <div>
                <p className="cs-eyebrow">{localize(scene.kicker, locale)}</p>
                <h2 style={{ fontSize: "var(--cs-text-xl)" }}>{localize(scene.heading, locale)}</h2>
                <p>{localize(scene.body, locale)}</p>
              </div>
            </li>
          ))}
        </ol>
        <div className="cs-lite-about cs-surface-solid" style={{ marginTop: "2rem", padding: "1.5rem", borderRadius: "var(--cs-radius-md)" }}>
          <p className="cs-lite-entity">{company.entity[locale]}</p>
        </div>
        <div className="cs-hero-actions">
          <LeadCta className="cs-btn cs-btn-primary" flow="contact">{dict.hero.ctaPrimary}</LeadCta>
          <Link className="cs-btn cs-btn-secondary" href={`/${locale}`}>{dict.a11y.cinematicLink}</Link>
        </div>
      </div>
    </section>
  );
}
