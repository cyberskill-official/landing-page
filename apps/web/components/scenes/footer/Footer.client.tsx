'use client';

import React, { useEffect, useRef, useState, type ReactNode } from 'react';
import type { SupportedLocale } from '@/lib/metadata-helpers';
import { SceneTunnel } from '@/lib/dynamic-three';
import { setActiveScene, setCurrentAnim, setNonlaVisible, useScrollDirection } from '@/lib/stores';
import { LumiCornerAvatar, LUMI_TAGLINE } from './LumiCornerAvatar';
import { useNonlaVariant } from './NonlaEasterEgg';

type FooterClientProps = {
  locale: SupportedLocale;
  children: ReactNode;
};

export function FooterClient({ locale, children }: FooterClientProps) {
  const footerRef = useRef<HTMLElement>(null);
  const scrollDirection = useScrollDirection();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [cornerVisible, setCornerVisible] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const { currentVariant, cycleVariant } = useNonlaVariant();

  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);
    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return undefined;
    let waveTimer: number | undefined;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setActiveScene(7);
        setNonlaVisible(true);
        setCurrentAnim('wave_goodbye', 100);
        waveTimer = window.setTimeout(() => setCornerVisible(true), 2_000);
      },
      { threshold: 0.2 },
    );
    observer.observe(footer);
    return () => {
      observer.disconnect();
      if (waveTimer) window.clearTimeout(waveTimer);
    };
  }, []);

  useEffect(() => {
    if (scrollDirection === 'up') {
      setCornerVisible(false);
      setCurrentAnim('wave_goodbye', 100);
    }
  }, [scrollDirection]);

  return (
    <section
      ref={footerRef}
      id="footer-scene"
      className="footer-scene"
      data-scene-id="footer"
      data-scene="footer"
      data-scene-index="7"
      data-corner-avatar-visible={cornerVisible}
      data-scroll-direction={scrollDirection}
      aria-label={locale === 'vi' ? 'Chan trang CyberSkill' : 'CyberSkill footer'}
    >
      {children}
      <button
        type="button"
        className="footer-lumi-avatar-hitarea"
        aria-label="Lumi the genie"
        aria-describedby="footer-lumi-tooltip"
        data-nonla-variant={currentVariant}
        data-visible={cornerVisible || reducedMotion}
        onBlur={() => setTooltipVisible(false)}
        onFocus={() => setTooltipVisible(true)}
        onClick={cycleVariant}
        onMouseEnter={() => {
          setTooltipVisible(true);
          cycleVariant();
        }}
        onMouseLeave={() => setTooltipVisible(false)}
      >
        <span id="footer-lumi-tooltip" role="tooltip" data-visible={tooltipVisible}>
          {LUMI_TAGLINE[locale]}
        </span>
      </button>
      <img src="/storyboard/scene-6-cta-hub.svg" alt="" aria-hidden="true" className="footer-scene__static-lumi" />
      {!reducedMotion ? (
        <SceneTunnel id="footer" trackElement={footerRef}>
          <LumiCornerAvatar visible={cornerVisible} />
        </SceneTunnel>
      ) : null}
    </section>
  );
}
