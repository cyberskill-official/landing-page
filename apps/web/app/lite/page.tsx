import type { Metadata } from 'next';
import {
  generateRouteMetadata,
  resolveRouteLocale,
  type RouteSearchParams,
} from '@/lib/metadata-helpers';
import { LiteHero } from '@/components/lite/LiteHero';
import { StoryboardPanel } from '@/components/lite/StoryboardPanel';
import { STORYBOARD_PANEL_IDS } from '@/components/lite/storyboard-panels';
import { LiteModeToast } from '@/components/a11y/LiteModeToast';
import { BackToCinematicLink } from '@/components/a11y/BackToCinematicLink';
import { SceneShadowMirrorSet } from '@/components/a11y/SceneShadowMirror';

type LitePageProps = {
  searchParams?: RouteSearchParams;
};

const liteCopy = {
  en: {
    title: 'CyberSkill - Senior Software from Vietnam (read-only mode)',
    deck: 'A static, motion-free overview. Same content, streamlined delivery.',
    back: 'Back to full experience',
  },
  vi: {
    title: 'CyberSkill - Ky su senior tu Viet Nam',
    deck: 'Tong quan tinh, khong chuyen dong. Cung noi dung, tai gon hon.',
    back: 'Quay lai trai nghiem day du',
  },
};

export function generateMetadata(): Metadata {
  return generateRouteMetadata('/lite', {
    canonical: '/',
    title: 'CyberSkill — Read-Only Mode',
    description: 'A motion-free CyberSkill overview for reduced-motion and low-capability environments.',
    hreflang: {
      'x-default': '/lite',
      en: '/lite',
      vi: '/vi/lite',
    },
  });
}

export default async function LitePage({ searchParams }: LitePageProps) {
  const locale = await resolveRouteLocale(searchParams);
  const copy = liteCopy[locale];

  return (
    <main className="lite-page">
      <LiteModeToast />
      <LiteHero title={copy.title} deck={copy.deck} />
      <SceneShadowMirrorSet locale={locale} visible />
      <div className="lite-storyboard" aria-label="CyberSkill motion-free storyboard">
        {STORYBOARD_PANEL_IDS.map((panelId) => (
          <StoryboardPanel key={panelId} panelId={panelId} anchorId={panelId === 'scene-6' ? 'cta-hub' : undefined} />
        ))}
      </div>
      <BackToCinematicLink className="lite-footer-link" label={copy.back} />
    </main>
  );
}
