import type { Metadata } from 'next';
import {
  generateRouteMetadata,
  resolveRouteLocale,
  type RouteSearchParams,
} from '@/lib/metadata-helpers';
import { LiteHero } from '@/components/lite/LiteHero';
import { StoryboardPanel } from '@/components/lite/StoryboardPanel';
import { STORYBOARD_PANEL_IDS } from '@/components/lite/storyboard-panels';
import { SceneShadowMirrorSet } from '@/components/a11y/SceneShadowMirror';
import { ServiceJsonLd } from '@/components/seo/ServiceJsonLd';
import { Scene0Hero } from '@/components/scenes/scene-0-hero/Scene0Hero';
import { Scene1Origin } from '@/components/scenes/scene-1-origin/Scene1Origin';
import { Scene2Transformation } from '@/components/scenes/scene-2-transformation/Scene2Transformation';
import { Scene3Capabilities } from '@/components/scenes/scene-3-capabilities/Scene3Capabilities';
import { Scene4Team } from '@/components/scenes/scene-4-team/Scene4Team';
import { Scene5VietnamGlobal } from '@/components/scenes/scene-5-vietnam-global/Scene5VietnamGlobal';
import { Scene6CtaHub } from '@/components/scenes/scene-6-cta-hub/Scene6CtaHub';
import { Footer } from '@/components/scenes/footer/Footer';

type HomePageProps = {
  searchParams?: RouteSearchParams;
};

export const revalidate = 3600;

const homeCopy = {
  en: {
    title: 'What if your will became real?',
    deck: 'Senior software from Vietnam. Turn your will into real.',
    capabilities: 'Explore capabilities',
    partner: 'Partner track',
    join: 'Join track',
  },
  vi: {
    title: 'Neu y chi cua ban thanh hien thuc?',
    deck: 'Ky su senior tu Viet Nam. Bien y chi thanh phan mem that.',
    capabilities: 'Kham pha nang luc',
    partner: 'Hop tac',
    join: 'Gia nhap',
  },
};

export function generateMetadata(): Metadata {
  return generateRouteMetadata('/', {
    title: 'CyberSkill — Turn Your Will Into Real',
    description: 'Senior-only Vietnamese software solutions consultancy. We turn your will into real software.',
    hreflang: {
      'x-default': '/',
      en: '/',
      vi: '/vi',
    },
  });
}

export default async function HomePage({ searchParams }: HomePageProps) {
  const locale = await resolveRouteLocale(searchParams);
  const copy = homeCopy[locale];

  return (
    <>
      <ServiceJsonLd embedMode="individual" />
      <main className="cinematic-main" data-cinematic-main>
        <SceneShadowMirrorSet locale={locale} />
        <Scene0Hero
          locale={locale}
          deck={copy.deck}
          links={[
            { href: '#scene-3', label: copy.capabilities },
            { href: '#cta-hub', label: copy.partner, ctaTrack: 'partner' },
            { href: '#cta-hub', label: copy.join, ctaTrack: 'join' },
            { href: '/work/sample', label: 'Sample work' },
            { href: '/accessibility', label: 'Accessibility' },
          ]}
        />
        <Scene1Origin locale={locale} />
        <Scene2Transformation locale={locale} />
        <Scene3Capabilities locale={locale} />
        <Scene4Team locale={locale} />
        <Scene5VietnamGlobal locale={locale} />
        <Scene6CtaHub locale={locale} />
      </main>
      <Footer locale={locale} />
      <section className="lite-inline" data-lite-inline aria-label="Reduced-motion storyboard">
        <LiteHero h1={false} />
        <div className="lite-storyboard" aria-label="CyberSkill reduced-motion storyboard panels">
          {STORYBOARD_PANEL_IDS.map((panelId) => (
            <StoryboardPanel key={panelId} panelId={panelId} />
          ))}
        </div>
      </section>
    </>
  );
}
