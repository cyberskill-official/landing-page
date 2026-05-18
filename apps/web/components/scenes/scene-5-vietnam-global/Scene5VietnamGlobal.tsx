'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { SceneTunnel } from '@/lib/dynamic-three';
import { setActiveScene, setCurrentAnim, setNonlaVisible } from '@/lib/stores';
import { Scene5Canvas } from './Scene5Canvas';
import { TrustSignalsStrip } from './TrustSignalsStrip';

type Scene5VietnamGlobalProps = {
  locale: SupportedLocale;
};

const copy = {
  en: {
    caption: 'From Saigon to your time zone.',
    title: 'From Saigon to your time zone.',
  },
  vi: {
    caption: 'Tu Sai Gon den mui gio cua ban.',
    title: 'Tu Sai Gon den mui gio cua ban.',
  },
} as const;

export function Scene5VietnamGlobal({ locale }: Scene5VietnamGlobalProps) {
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
    const section = sectionRef.current;
    if (!section) return undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setActiveScene(5);
        setNonlaVisible(true);
        setCurrentAnim('nonla_appear', 100);
        window.setTimeout(() => setCurrentAnim('nonla_tip', 100), 1_000);
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="scene-5"
      className="scene-shell scene-5-vietnam-global"
      data-scene-id="scene-5-vietnam-global"
      data-scene="scene-5"
      data-scene-index="5"
      data-scene-tunnel-id="scene-5-vietnam-global"
      aria-labelledby="scene-5-title"
      tabIndex={-1}
      lang={locale}
    >
      <div className="scene-5-vietnam-global__copy">
        <p className="scene-5-vietnam-global__eyebrow">Vietnam to global</p>
        <h2 id="scene-5-title">{sceneCopy.title}</h2>
        <p>{sceneCopy.caption}</p>
      </div>
      <TrustSignalsStrip />
      <img src="/storyboard/scene-5-vietnam-global.svg" alt="" aria-hidden="true" className="scene-5-vietnam-global__static" />
      {!reducedMotion ? (
        <SceneTunnel id="scene-5-vietnam-global" trackElement={sectionRef}>
          <Scene5Canvas />
        </SceneTunnel>
      ) : null}
    </section>
  );
}
