'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { cssEase, duration } from '@cyberskill/ds-cinematic/tokens/motion';
import { requestCtaOpen, type CtaOpenSource } from '@/components/cta/cta-events';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { setFocusedCta } from '@/lib/stores';

type Scene0CTAClientProps = {
  locale: SupportedLocale;
};

const SCENE0_CTA_CROSSFADE_MS = duration.swift - duration.instant / 2;
const SCENE0_CTA_SCROLL_START_OFFSET = 160;

declare global {
  interface Window {
    __scene0CtaState?: {
      stickyActive: boolean;
      stickyProgress: number;
      lastSource: CtaOpenSource | 'scroll';
    };
  }
}

export function Scene0CTAClient({ locale }: Scene0CTAClientProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const deepLinkOpenedRef = useRef(false);

  const label = locale === 'vi' ? 'Dat lich tu van' : 'Book a Discovery Call';
  const srLabel = locale === 'vi' ? 'Mo form dat lich tu van' : 'Open the Book Discovery Call form';

  const openBuyTrack = useCallback((source: CtaOpenSource) => {
    setFocusedCta('buy');
    requestCtaOpen({ track: 'buy', source, scrollIntoView: false });
    window.__scene0CtaState = {
      ...(window.__scene0CtaState ?? { stickyActive: false, stickyProgress: 0 }),
      lastSource: source,
    };
  }, []);

  const onActivate = (source: CtaOpenSource) => (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    openBuyTrack(source);
  };

  useEffect(() => {
    if (deepLinkOpenedRef.current) return;
    const action = new URLSearchParams(window.location.search).get('action');
    if (action !== 'book') return;

    deepLinkOpenedRef.current = true;
    const frame = window.requestAnimationFrame(() => openBuyTrack('scene-0-deeplink'));
    return () => window.cancelAnimationFrame(frame);
  }, [openBuyTrack]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;
    const rootElement = root;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setStickyProgress(rootElement, 0);
      return undefined;
    }

    let disposed = false;
    let trigger: { kill: () => void } | null = null;

    async function setupScrollTrigger() {
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import('gsap'),
        import('gsap/ScrollTrigger'),
      ]);

      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);
      trigger = ScrollTrigger.create({
        trigger: '#scene-0',
        start: `bottom top+=${SCENE0_CTA_SCROLL_START_OFFSET}`,
        end: 'bottom top',
        scrub: SCENE0_CTA_CROSSFADE_MS / 1_000,
        onRefresh: (self) => setStickyProgress(rootElement, self.progress),
        onUpdate: (self) => setStickyProgress(rootElement, self.progress),
      });
      ScrollTrigger.refresh();
    }

    void setupScrollTrigger();

    return () => {
      disposed = true;
      trigger?.kill();
      window.__scene0CtaState = undefined;
    };
  }, []);

  const style = {
    '--scene-0-cta-transition-ms': `${SCENE0_CTA_CROSSFADE_MS}ms`,
    '--scene-0-cta-transition-ease': cssEase('genie'),
    '--scene-0-cta-sticky-progress': 0,
  } as React.CSSProperties;

  return (
    <div
      ref={rootRef}
      className="scene-0-cta"
      data-scene-0-cta
      data-sticky-active="false"
      style={style}
    >
      <a
        className="scene-0-cta__link scene-0-cta__link--hero"
        href="#cta-hub"
        data-scene-0-cta-variant="hero"
        data-cta-track="buy"
        aria-label={srLabel}
        onClick={onActivate('scene-0-hero')}
      >
        {label}
      </a>
      <a
        className="scene-0-cta__link scene-0-cta__link--sticky"
        href="#cta-hub"
        data-scene-0-cta-variant="sticky"
        data-cta-track="buy"
        aria-label={srLabel}
        onClick={onActivate('scene-0-sticky')}
      >
        {label}
      </a>
    </div>
  );
}

function setStickyProgress(root: HTMLElement, rawProgress: number) {
  const progress = Math.max(0, Math.min(1, rawProgress));
  const stickyActive = progress >= 0.5;
  root.style.setProperty('--scene-0-cta-sticky-progress', progress.toFixed(3));
  root.dataset.stickyActive = String(stickyActive);
  window.__scene0CtaState = {
    stickyActive,
    stickyProgress: progress,
    lastSource: 'scroll',
  };
}
