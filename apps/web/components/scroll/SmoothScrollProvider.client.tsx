'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';
import type { LenisOptions } from 'lenis';
import {
  getLenis,
  setLenis,
  setScrollProgress,
  updateLenisMetrics,
  useLenis,
  useScrollProgress,
} from '@/lib/lenis-singleton';
import { loadLenisScrollTriggerBridge } from '@/lib/dynamic-three';
import { setScrollSnapshot } from '@/lib/stores';

const lenisOptions = {
  smoothWheel: true,
  syncTouch: false,
  wheelMultiplier: 1,
  touchMultiplier: 1,
  duration: 1.2,
  infinite: false,
  orientation: 'vertical',
  gestureOrientation: 'vertical',
  overscroll: true,
  autoRaf: false,
  anchors: false,
} satisfies LenisOptions;

function usePrefersReducedMotion() {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReducedMotion(query.matches);

    update();
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);

  return reducedMotion;
}

function ScrollDebugOverlay() {
  const progress = useScrollProgress();
  const lenis = useLenis();

  if (!lenis || process.env.NODE_ENV === 'production') return null;

  return (
    <output
      aria-label="Scroll debug"
      data-scroll-debug
      style={{
        position: 'fixed',
        right: 12,
        bottom: 12,
        zIndex: 50,
        padding: '8px 10px',
        border: '1px solid rgba(255,255,255,0.2)',
        borderRadius: 6,
        background: 'rgba(12, 13, 18, 0.82)',
        color: 'white',
        font: '12px/1.4 monospace',
        pointerEvents: 'none',
      }}
    >
      scroll: {Math.round(lenis.scroll)} | velocity: {Math.round(lenis.velocity)} | progress:{' '}
      {progress.toFixed(2)}
    </output>
  );
}

export function SmoothScrollProviderClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reducedMotion = usePrefersReducedMotion();
  const [debugEnabled, setDebugEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDebugEnabled(new URLSearchParams(window.location.search).get('debug') === 'scroll');
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const isLiteRoute = pathname?.startsWith('/lite') === true;

    if (reducedMotion || isLiteRoute) {
      getLenis()?.destroy();
      setLenis(null);
      setScrollProgress(0);
      return;
    }

    let disposed = false;
    let lenis: Lenis | null = null;
    let cleanupBridge: (() => void) | null = null;
    let unsubscribeScroll: (() => void) | null = null;
    let lastStoreFlush = 0;

    const handleAnchorClick = (event: MouseEvent) => {
      if (event.defaultPrevented) return;
      const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute('href');
      if (!anchor || !hash || hash === '#') return;

      const target = document.querySelector(hash);
      if (!target || !lenis) return;

      event.preventDefault();
      lenis.scrollTo(target as HTMLElement, {
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - 2 ** (-10 * t)),
      });
    };

    const start = async () => {
      const [{ default: LenisCtor }, { bridgeLenisToScrollTrigger }] = await Promise.all([
        import('lenis'),
        loadLenisScrollTriggerBridge(),
      ]);

      if (disposed) return;

      lenis = new LenisCtor(lenisOptions);
      setLenis(lenis);
      updateLenisMetrics(lenis);
      setScrollSnapshot(lenis.scroll, lenis.velocity);
      cleanupBridge = bridgeLenisToScrollTrigger(lenis);
      unsubscribeScroll = lenis.on('scroll', (instance) => {
        updateLenisMetrics(instance);
        const now = performance.now();
        if (now - lastStoreFlush >= 50) {
          setScrollSnapshot(instance.scroll, instance.velocity);
          lastStoreFlush = now;
        }
      });
      document.addEventListener('click', handleAnchorClick);

      if (process.env.NODE_ENV !== 'production') {
        window.__lenisOptions = lenisOptions;
      }
    };

    void start();

    return () => {
      disposed = true;
      document.removeEventListener('click', handleAnchorClick);
      unsubscribeScroll?.();
      cleanupBridge?.();
      lenis?.destroy();
      setLenis(null);
      setScrollProgress(0);
      if (process.env.NODE_ENV !== 'production') {
        window.__lenisOptions = undefined;
      }
    };
  }, [pathname, reducedMotion]);

  return (
    <>
      {children}
      {debugEnabled ? <ScrollDebugOverlay /> : null}
    </>
  );
}
