'use client';

import type { MouseEvent } from 'react';
import type { Locale } from '@/lib/i18n';

type NextSceneButtonProps = {
  locale?: Locale;
  targetId: string;
};

const labels: Record<Locale, string> = {
  en: 'Next scene ↓',
  vi: 'Cảnh tiếp theo ↓',
};

export function NextSceneButton({ locale = 'en', targetId }: NextSceneButtonProps) {
  function activate(event: MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    const target = document.getElementById(targetId);
    if (!target) return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    window.setTimeout(() => target.focus({ preventScroll: true }), reduced ? 0 : 450);
    if (window.location.hash !== `#${targetId}`) {
      window.history.pushState(null, '', `#${targetId}`);
    }
  }

  return (
    <a href={`#${targetId}`} className="next-scene-button" data-next-scene-button onClick={activate}>
      {labels[locale]}
    </a>
  );
}
