'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { CtaHub } from '@/components/cta/CtaHub';
import { TimezoneClock } from '@/components/cta/TimezoneClock';
import { isTrackId } from '@/components/cta/tracks';
import { SceneTunnel } from '@/lib/dynamic-three';
import { setActiveScene, setCurrentAnim, setFocusedCta, setNonlaVisible } from '@/lib/stores';
import { Scene6Canvas } from './Scene6Canvas';

type Scene6CtaHubProps = {
  locale: SupportedLocale;
};

const copy = {
  en: {
    eyebrow: 'Decision beat',
    caption: 'You bring the will. We bring the real.',
  },
  vi: {
    eyebrow: 'Khoanh khac quyet dinh',
    caption: 'You bring the will. We bring the real.',
  },
} as const;

export function Scene6CtaHub({ locale }: Scene6CtaHubProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const sceneCopy = copy[locale];

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const track = new URLSearchParams(window.location.search).get('track');
    if (isTrackId(track)) setFocusedCta(track);
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setActiveScene(6);
        setNonlaVisible(true);
        setCurrentAnim('idle', 100);
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="cta-hub"
      className="scene-shell scene-6-cta-hub"
      data-scene-id="scene-6-cta-hub"
      data-scene="scene-6-cta-hub"
      data-scene-index="6"
      data-scene-tunnel-id="scene-6-cta-hub"
      aria-labelledby="scene-6-title"
      tabIndex={-1}
      lang={locale}
    >
      <div className="scene-6-cta-hub__content">
        <div className="scene-6-cta-hub__copy">
          <p className="scene-6-cta-hub__eyebrow">{sceneCopy.eyebrow}</p>
          <h2 id="scene-6-title">{sceneCopy.caption}</h2>
        </div>
        <TimezoneClock locale={locale} variant="compact" />
        <CtaHub locale={locale} />
      </div>
      <img src="/storyboard/scene-6-cta-hub.svg" alt="" aria-hidden="true" className="scene-6-cta-hub__static" />
      {!reducedMotion ? (
        <SceneTunnel id="scene-6-cta-hub" trackElement={sectionRef}>
          <Scene6Canvas />
        </SceneTunnel>
      ) : null}
    </section>
  );
}
