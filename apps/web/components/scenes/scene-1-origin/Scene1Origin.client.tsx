'use client';

import React from 'react';
import { useEffect, useRef, useState } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { SceneTunnel } from '@/lib/dynamic-three';
import { setActiveScene, setCurrentAnim } from '@/lib/stores';
import { TypedCaption } from './TypedCaption';
import { Scene1Canvas } from './Scene1Canvas';

export type Scene1OriginClientProps = {
  caption: string;
  locale: SupportedLocale;
  title: string;
};

export function Scene1OriginClient({ caption, locale, title }: Scene1OriginClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);

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
        setActiveScene(1);
        setCurrentAnim('coil_idle', 100);
        window.__scene1OriginState = {
          ...(window.__scene1OriginState ?? {}),
          caption,
          currentAnim: 'coil_idle',
        };
      },
      { threshold: 0.35 },
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, [caption]);

  return (
    <section
      ref={sectionRef}
      id="scene-1"
      className="scene-shell scene-1-origin"
      data-scene-id="scene-1-origin"
      data-scene-index="1"
      data-scene-tunnel-id="scene-1-origin"
      aria-labelledby="scene-1-title"
      tabIndex={-1}
      lang={locale}
    >
      <div className="scene-1-origin__copy">
        <p className="scene-1-origin__eyebrow">Origin</p>
        <h2 id="scene-1-title">{title}</h2>
        <TypedCaption text={caption} instant={reducedMotion} />
      </div>
      <img
        src="/storyboard/scene-1-origin.svg"
        alt=""
        aria-hidden="true"
        className="scene-1-origin__static"
        data-scene-1-static
      />
      {!reducedMotion ? (
        <SceneTunnel id="scene-1-origin" trackElement={sectionRef}>
          <Scene1Canvas />
        </SceneTunnel>
      ) : null}
    </section>
  );
}
