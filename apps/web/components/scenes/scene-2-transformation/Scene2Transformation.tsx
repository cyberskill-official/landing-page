'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { SceneTunnel } from '@/lib/dynamic-three';
import { setActiveScene, setCurrentAnim } from '@/lib/stores';
import { PullQuote } from './PullQuote';
import { Scene2Canvas } from './Scene2Canvas';

type Scene2TransformationProps = {
  locale: SupportedLocale;
};

const copy = {
  en: {
    beatOne: 'Most software dies in the gap between sketch and ship.',
    beatTwo: 'We close it.',
    title: 'From sketch to system.',
  },
  vi: {
    beatOne: 'Phan mem thuong chet giua ban phac thao va ngay ra mat.',
    beatTwo: 'Chung toi khep khoang cach do.',
    title: 'Tu phac thao den he thong.',
  },
} as const;

export function Scene2Transformation({ locale }: Scene2TransformationProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [quoteVisible, setQuoteVisible] = useState(false);
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
        if (!entry) return;
        const visible = entry.isIntersecting && entry.intersectionRatio >= 0.35;
        setQuoteVisible(visible);
        window.__scene2TransformationState = {
          ...(window.__scene2TransformationState ?? {}),
          pullQuoteVisible: visible,
        };
        if (!visible) return;
        setActiveScene(2);
        setCurrentAnim('paint', 100);
      },
      { threshold: [0.35, 0.55, 0.85] },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="scene-2"
      className="scene-shell scene-2-transformation"
      data-scene-id="scene-2-transformation"
      data-scene-index="2"
      data-scene-tunnel-id="scene-2-transformation"
      aria-labelledby="scene-2-title"
      tabIndex={-1}
      lang={locale}
    >
      <div className="scene-2-transformation__copy">
        <p className="scene-2-transformation__eyebrow">Transformation</p>
        <h2 id="scene-2-title">{sceneCopy.title}</h2>
        <div className="scene-2-transformation__beats" aria-live="polite">
          <p data-caption-beat="1">{sceneCopy.beatOne}</p>
          <p data-caption-beat="2">{sceneCopy.beatTwo}</p>
        </div>
      </div>
      <PullQuote visible={reducedMotion || quoteVisible} />
      <img
        src="/storyboard/scene-2-transformation.svg"
        alt=""
        aria-hidden="true"
        className="scene-2-transformation__static"
        data-scene-2-static
      />
      {!reducedMotion ? (
        <SceneTunnel id="scene-2-transformation" trackElement={sectionRef}>
          <Scene2Canvas />
        </SceneTunnel>
      ) : null}
    </section>
  );
}
