'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { SceneTunnel } from '@/lib/dynamic-three';
import { setActiveScene, setCurrentAnim } from '@/lib/stores';
import { LogosStrip } from './LogosStrip';
import { Scene3Canvas } from './Scene3Canvas';

type Scene3CapabilitiesProps = {
  locale: SupportedLocale;
};

const copy = {
  en: {
    beatOne: 'React, Three.js, AI, design systems -',
    beatTwo: 'four hands of the same craft.',
    title: 'How we turn will into real.',
  },
  vi: {
    beatOne: 'React, Three.js, AI, design system -',
    beatTwo: 'bon ban tay cua cung mot nghe.',
    title: 'Cach chung toi bien y chi thanh hien thuc.',
  },
} as const;

export function Scene3Capabilities({ locale }: Scene3CapabilitiesProps) {
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
        setActiveScene(3);
        setCurrentAnim('split_to_4', 100);
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="scene-3"
      className="scene-shell scene-3-capabilities"
      data-scene-id="scene-3-capabilities"
      data-scene="scene-3"
      data-scene-index="3"
      data-scene-tunnel-id="scene-3-capabilities"
      aria-labelledby="scene-3-title"
      tabIndex={-1}
      lang={locale}
    >
      <div className="scene-3-capabilities__copy">
        <p className="scene-3-capabilities__eyebrow">Capabilities</p>
        <h2 id="scene-3-title">{sceneCopy.title}</h2>
        <div className="scene-3-capabilities__beats" aria-live="polite">
          <p data-caption-beat="1">{sceneCopy.beatOne}</p>
          <p data-caption-beat="2">{sceneCopy.beatTwo}</p>
        </div>
      </div>
      <LogosStrip />
      <img
        src="/storyboard/scene-3-capabilities.svg"
        alt=""
        aria-hidden="true"
        className="scene-3-capabilities__static"
        data-scene-3-static
      />
      {!reducedMotion ? (
        <SceneTunnel id="scene-3-capabilities" trackElement={sectionRef}>
          <Scene3Canvas />
        </SceneTunnel>
      ) : null}
    </section>
  );
}
