import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type Lenis from 'lenis';

let activeLenis: Lenis | null = null;
let activeCleanup: (() => void) | null = null;
let proxyRegistered = false;

export function bridgeLenisToScrollTrigger(lenis: Lenis): () => void {
  if (activeCleanup) activeCleanup();

  gsap.registerPlugin(ScrollTrigger);
  gsap.ticker.lagSmoothing(0);
  activeLenis = lenis;

  if (!proxyRegistered) {
    ScrollTrigger.scrollerProxy(document.body, {
      scrollTop(value?: number) {
        if (typeof value === 'number') {
          activeLenis?.scrollTo(value, { immediate: true });
        }
        return activeLenis?.scroll ?? window.scrollY;
      },
      scrollLeft(value?: number) {
        if (typeof value === 'number') window.scrollTo(value, window.scrollY);
        return window.scrollX;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });
    proxyRegistered = true;

    if (process.env.NODE_ENV !== 'production') {
      window.__scrollTriggerProxyRegistrations = (window.__scrollTriggerProxyRegistrations ?? 0) + 1;
    }
  }

  const tick = (time: number) => lenis.raf(time * 1000);
  const update = () => ScrollTrigger.update();

  gsap.ticker.add(tick);
  lenis.on('scroll', update);
  ScrollTrigger.refresh();

  activeCleanup = () => {
    gsap.ticker.remove(tick);
    lenis.off('scroll', update);
    if (activeLenis === lenis) activeLenis = null;
    activeCleanup = null;
  };

  return activeCleanup;
}
