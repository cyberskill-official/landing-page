import type { SupportedLocale } from '@/lib/metadata-helpers';
import { getNarrativeLine } from '@/lib/i18n/messages-loader';
import { Scene0HeroClient, type Scene0HeroLink } from './Scene0Hero.client';

const heroTitle: Record<SupportedLocale, string> = {
  en: 'What if your will became real?',
  vi: 'Neu y chi cua ban thanh hien thuc?',
};

export function getScene0HeroCopy(locale: SupportedLocale) {
  const safeLocale: SupportedLocale = locale === 'vi' ? 'vi' : 'en';

  return {
    caption:
      getNarrativeLine(safeLocale, 'scene-0-hero-primary')?.text ??
      getNarrativeLine('en', 'scene-0-hero-primary')?.text ??
      "Whisper an idea. I'll show you the rest.",
    title: heroTitle[safeLocale],
  };
}

export function Scene0Hero({
  deck,
  links,
  locale,
}: {
  deck: string;
  links: Scene0HeroLink[];
  locale: SupportedLocale;
}) {
  const copy = getScene0HeroCopy(locale);

  return <Scene0HeroClient {...copy} deck={deck} links={links} locale={locale} />;
}
