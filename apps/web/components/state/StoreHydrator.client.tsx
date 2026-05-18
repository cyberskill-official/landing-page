'use client';

import { useEffect, useState } from 'react';
import {
  setActiveScene,
  setFocusedCta,
  useActiveScene,
  useFocusedCta,
  useLumiAnim,
  useScrollDirection,
  useScrollVelocity,
} from '@/lib/stores';
import { useLumiStore } from '@/lib/stores/lumiStore';
import { useSceneStore } from '@/lib/stores/sceneStore';
import { useScrollStore } from '@/lib/stores/scrollStore';
import { useAudioStore } from '@/lib/stores/audioStore';
import type { CtaTrack } from '@/lib/stores';

export function StoreHydratorClient() {
  const [debugEnabled, setDebugEnabled] = useState(false);
  const activeScene = useActiveScene();
  const focusedCta = useFocusedCta();
  const currentAnim = useLumiAnim();
  const scrollVelocity = useScrollVelocity();
  const scrollDirection = useScrollDirection();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDebugEnabled(new URLSearchParams(window.location.search).get('debug') === 'stores');
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || process.env.NODE_ENV === 'production') return;
    const publish = () => {
      window.__stores = {
        audio: useAudioStore.getState(),
        scene: useSceneStore.getState(),
        lumi: useLumiStore.getState(),
        scroll: useScrollStore.getState(),
      };
    };

    publish();
    const unsubScene = useSceneStore.subscribe(publish);
    const unsubLumi = useLumiStore.subscribe(publish);
    const unsubScroll = useScrollStore.subscribe(publish);
    const unsubAudio = useAudioStore.subscribe(publish);
    return () => {
      unsubScene();
      unsubLumi();
      unsubScroll();
      unsubAudio();
      window.__stores = undefined;
    };
  }, []);

  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('[data-scene-index]'));
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        const scene = visible?.target.getAttribute('data-scene-index');
        if (scene) setActiveScene(Number(scene));
      },
      { threshold: [0.35, 0.55, 0.75] },
    );

    for (const section of sections) observer.observe(section);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const sceneFromHash = (hash: string) => {
      if (hash === '#cta-hub') return 6;
      const match = /^#scene-(\d+)$/.exec(hash);
      return match ? Number(match[1]) : null;
    };

    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;

      const scene = sceneFromHash(new URL(link.href).hash);
      if (scene !== null) setActiveScene(scene);
    };

    const onHashChange = () => {
      const scene = sceneFromHash(window.location.hash);
      if (scene !== null) setActiveScene(scene);
    };

    document.addEventListener('click', onClick);
    window.addEventListener('hashchange', onHashChange);
    return () => {
      document.removeEventListener('click', onClick);
      window.removeEventListener('hashchange', onHashChange);
    };
  }, []);

  useEffect(() => {
    const onPointerOver = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-cta-track]');
      const track = target?.dataset.ctaTrack;
      if (track === 'buy' || track === 'partner' || track === 'join') setFocusedCta(track);
    };
    const onPointerOut = (event: PointerEvent) => {
      const target = (event.target as Element | null)?.closest<HTMLElement>('[data-cta-track]');
      const related = event.relatedTarget as Node | null;
      if (document.querySelector('[data-cta-modal]')) return;
      if (target && (!related || !target.contains(related))) setFocusedCta(null);
    };

    document.addEventListener('pointerover', onPointerOver);
    document.addEventListener('pointerout', onPointerOut);
    return () => {
      document.removeEventListener('pointerover', onPointerOver);
      document.removeEventListener('pointerout', onPointerOut);
    };
  }, []);

  if (!debugEnabled || process.env.NODE_ENV === 'production') return null;

  return (
    <output
      aria-label="Store debug"
      data-stores-debug
      style={{
        position: 'fixed',
        top: 12,
        left: 12,
        zIndex: 60,
        padding: '8px 10px',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 6,
        background: 'rgba(12, 13, 18, 0.82)',
        color: 'white',
        font: '12px/1.4 monospace',
        pointerEvents: 'none',
      }}
    >
      scene: {activeScene} | cta: {focusedCta ?? 'none'} | anim: {currentAnim} | scroll:{' '}
      {Math.round(scrollVelocity)} {scrollDirection}
    </output>
  );
}

declare global {
  interface Window {
    __stores?: {
      audio: ReturnType<typeof useAudioStore.getState>;
      scene: ReturnType<typeof useSceneStore.getState>;
      lumi: ReturnType<typeof useLumiStore.getState>;
      scroll: ReturnType<typeof useScrollStore.getState>;
    };
  }
}
