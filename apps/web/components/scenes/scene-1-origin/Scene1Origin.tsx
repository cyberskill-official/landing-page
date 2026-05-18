import type { SupportedLocale } from '@/lib/metadata-helpers';
import { getNarrativeLine } from '@/lib/i18n/messages-loader';
import { Scene1OriginClient } from './Scene1Origin.client';

const sceneOneTitle: Record<SupportedLocale, string> = {
  en: 'Saigon, 2020.',
  vi: 'Sai Gon, 2020.',
};

export function getScene1OriginCopy(locale: SupportedLocale) {
  const safeLocale: SupportedLocale = locale === 'vi' ? 'vi' : 'en';

  return {
    caption:
      getNarrativeLine(safeLocale, 'scene-1-origin-primary')?.text ??
      getNarrativeLine('en', 'scene-1-origin-primary')?.text ??
      "Stephen had one rule: build what you'd be proud to sign.",
    title: sceneOneTitle[safeLocale],
  };
}

export function Scene1Origin({ locale }: { locale: SupportedLocale }) {
  return <Scene1OriginClient {...getScene1OriginCopy(locale)} locale={locale} />;
}
