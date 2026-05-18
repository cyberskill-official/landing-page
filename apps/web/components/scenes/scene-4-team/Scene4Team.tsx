'use client';

import React, { useEffect, useRef, useState } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { SceneTunnel } from '@/lib/dynamic-three';
import { setActiveScene, setCurrentAnim, setEmissiveBoost } from '@/lib/stores';
import { TEAM_AVATARS } from './AvatarSphere';
import { HiringHook } from './HiringHook';
import { Scene4Canvas } from './Scene4Canvas';

type Scene4TeamProps = {
  locale: SupportedLocale;
};

const copy = {
  en: {
    caption: 'Ten of us. All senior. All Vietnamese. All remote.',
    title: 'Ten people. One craft.',
  },
  vi: {
    caption: 'Muoi nguoi. Deu senior. Deu o Viet Nam. Deu lam viec tu xa.',
    title: 'Muoi nguoi. Mot nghe.',
  },
} as const;

export function Scene4Team({ locale }: Scene4TeamProps) {
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
        setActiveScene(4);
        setCurrentAnim('idle', 100);
        setEmissiveBoost(0.1);
      },
      { threshold: 0.35 },
    );
    observer.observe(section);
    return () => {
      setEmissiveBoost(0.2);
      observer.disconnect();
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="scene-4"
      className="scene-shell scene-4-team"
      data-scene-id="scene-4-team"
      data-scene-index="4"
      data-scene-tunnel-id="scene-4-team"
      aria-labelledby="scene-4-title"
      tabIndex={-1}
      lang={locale}
    >
      <div className="scene-4-team__copy">
        <p className="scene-4-team__eyebrow">Team</p>
        <h2 id="scene-4-title">{sceneCopy.title}</h2>
        <p>{sceneCopy.caption}</p>
        <HiringHook />
      </div>
      <ul className="scene-4-team__members" aria-label="Privacy-first team preview">
        {TEAM_AVATARS.map(({ member }) => (
          <li key={member.firstName}>{member.firstName} - {member.role}</li>
        ))}
      </ul>
      <img src="/storyboard/scene-4-team.svg" alt="" aria-hidden="true" className="scene-4-team__static" />
      {!reducedMotion ? (
        <SceneTunnel id="scene-4-team" trackElement={sectionRef}>
          <Scene4Canvas />
        </SceneTunnel>
      ) : null}
    </section>
  );
}
