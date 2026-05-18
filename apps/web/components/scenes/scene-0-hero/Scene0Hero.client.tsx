'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { trackEvent } from '@/lib/analytics';
import { SceneTunnel } from '@/lib/dynamic-three';
import { detectDeviceTier } from '@/lib/device-tier';
import { setCurrentAnim, useLowMemoryMode } from '@/lib/stores';
import { getDustDpr, getDustParticleCount } from './dust-contract';
import { DUST_GLOW_TOKEN } from './dust-shader';
import { Scene0CTA } from './Scene0CTA';

const Scene0HeroCanvas = dynamic(
  () => import('./Scene0HeroCanvas').then((module) => module.Scene0HeroCanvas),
  {
    ssr: false,
    loading: () => null,
  },
);

export type Scene0HeroLink = {
  href: string;
  label: string;
  ctaTrack?: 'buy' | 'partner' | 'join';
  rel?: string;
};

export type Scene0HeroClientProps = {
  caption: string;
  deck: string;
  links: Scene0HeroLink[];
  locale: SupportedLocale;
  title: string;
};

const FLY_IN_DURATION_MS = 2_000;

export function Scene0HeroClient({ caption, deck, links, locale, title }: Scene0HeroClientProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const idleTimerRef = useRef<number | null>(null);
  const animationStartedRef = useRef(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const lowMemoryMode = useLowMemoryMode();

  const startAnimationSequence = useCallback(() => {
    if (animationStartedRef.current) return;
    animationStartedRef.current = true;

    const mountedAt = Math.round(performance.now());
    setCurrentAnim('fly_in');
    trackEvent('scene_enter', { scene_id: 'scene-0' });
    window.__scene0HeroState = {
      currentAnim: 'fly_in',
      mountedAt,
      sequence: ['fly_in'],
      source: 'scene-0-hero',
      tunnelId: 'scene-0-hero',
    };

    idleTimerRef.current = window.setTimeout(() => {
      setCurrentAnim('idle');
      window.__scene0HeroState = {
        ...(window.__scene0HeroState ?? {
          mountedAt,
          sequence: ['fly_in'],
          source: 'scene-0-hero',
          tunnelId: 'scene-0-hero',
        }),
        currentAnim: 'idle',
        idleAt: Math.round(performance.now()),
        sequence: [...(window.__scene0HeroState?.sequence ?? ['fly_in']), 'idle'],
      };
    }, FLY_IN_DURATION_MS);
  }, []);

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (reducedMotion) return undefined;

    let frame = 0;
    const waitForCanvas = () => {
      if (document.querySelector('#ScrollRig-canvas canvas')) {
        startAnimationSequence();
        return;
      }
      frame = window.requestAnimationFrame(waitForCanvas);
    };

    frame = window.requestAnimationFrame(waitForCanvas);
    return () => window.cancelAnimationFrame(frame);
  }, [reducedMotion, startAnimationSequence]);

  useEffect(
    () => () => {
      if (idleTimerRef.current !== null) window.clearTimeout(idleTimerRef.current);
      window.__scene0HeroState = undefined;
    },
    [],
  );

  useEffect(() => {
    if (reducedMotion) {
      window.__scene0DustState = undefined;
      return;
    }
    if (new URLSearchParams(window.location.search).get('debug') !== 'dust') return;
    const deviceTier = lowMemoryMode ? 'low' : detectDeviceTier();
    window.__scene0DustState = {
      count: getDustParticleCount(window.innerWidth, lowMemoryMode, deviceTier),
      drawCalls: window.__scene0DustState?.drawCalls ?? 1,
      dpr: getDustDpr(deviceTier),
      token: DUST_GLOW_TOKEN,
    };
  }, [lowMemoryMode, reducedMotion]);

  return (
    <section
      ref={sectionRef}
      id="scene-0"
      className="scene-shell scene-shell--hero scene-0-hero"
      data-scene-id="scene-0-hero"
      data-scene-index="0"
      data-scene-tunnel-id="scene-0-hero"
      aria-labelledby="scene-0-title"
      tabIndex={-1}
    >
      <div className="scene-0-hero__copy">
        <p className="scene-0-hero__eyebrow">CyberSkill</p>
        <h1 id="scene-0-title">{title}</h1>
        <p className="scene-0-hero__deck">{deck}</p>
        <p className="scene-0-hero__caption" data-scene-0-caption>
          {caption}
        </p>
        <Scene0CTA locale={locale} />
        <div className="scene-links" aria-label={locale === 'vi' ? 'Lien ket chinh' : 'Primary links'}>
          {links.map((link) => (
            <a
              key={`${link.href}:${link.label}`}
              href={link.href}
              data-cta-track={link.ctaTrack}
              rel={link.rel}
            >
              {link.label}
            </a>
          ))}
          <noscript>
            <a href="/lite" rel="alternate">
              {locale === 'vi' ? 'Che do doc tinh' : 'Read-only mode'}
            </a>
          </noscript>
        </div>
      </div>
      <img
        src="/storyboard/scene-0-hero.svg"
        alt=""
        aria-hidden="true"
        className="scene-0-hero__static"
        data-lumi-static
      />
      {!reducedMotion ? (
        <SceneTunnel id="scene-0-hero" trackElement={sectionRef}>
          <Scene0HeroCanvas onReady={startAnimationSequence} />
        </SceneTunnel>
      ) : null}
    </section>
  );
}

declare global {
  interface Window {
    __scene0HeroState?: {
      currentAnim: 'fly_in' | 'idle';
      idleAt?: number;
      mountedAt: number;
      sequence: Array<'fly_in' | 'idle'>;
      source: 'scene-0-hero';
      tunnelId: 'scene-0-hero';
    };
  }
}
