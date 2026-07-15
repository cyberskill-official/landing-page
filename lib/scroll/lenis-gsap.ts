// Canonical smooth-scroll + GSAP wiring (research doc §B): Lenis owns smooth
// scroll, GSAP's ticker drives Lenis's raf, ScrollTrigger updates on Lenis's
// scroll event. Everything is dynamically imported and fails closed, so a
// missing motion dependency or a reduced-motion preference never breaks the page.

import { readDurationSeconds } from "@/lib/motion/tokens";

export type ScrollStoryHandle = { destroy: () => void };

// Lenis owns scroll, so a plain #anchor click only sets the hash without moving.
// We keep a handle to the live instance and expose a smooth jump that drives it
// (falling back to native scrolling when Lenis is not running - reduced motion,
// no JS on the link, or a load failure). Consumers keep a real href for no-JS.
type LenisLike = {
  scrollTo: (target: string | HTMLElement | number, opts?: Record<string, unknown>) => void;
  stop?: () => void;
  start?: () => void;
};
let activeLenis: LenisLike | null = null;

function getLenis(): LenisLike | null {
  if (typeof window === "undefined") return null;
  const g = (window as unknown as { __csLenis?: LenisLike }).__csLenis;
  return activeLenis ?? g ?? null;
}

export function scrollToId(id: string, offset = -80): void {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis && typeof lenis.scrollTo === "function") lenis.scrollTo(el, { offset, duration: 1.1 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

/** Pause Lenis while a full-screen overlay (e.g. Lumi chat) owns wheel/touch. */
export function stopPageScroll(): void {
  const lenis = getLenis();
  try {
    lenis?.stop?.();
  } catch {
    /* native-only pages */
  }
}

/** Resume Lenis after the overlay closes. */
export function startPageScroll(): void {
  const lenis = getLenis();
  try {
    lenis?.start?.();
  } catch {
    /* native-only pages */
  }
}

export async function initScrollStory(): Promise<ScrollStoryHandle | null> {
  try {
    const [lenisMod, gsapMod, stMod] = await Promise.all([
      import("lenis"),
      import("gsap"),
      import("gsap/ScrollTrigger"),
    ]);

    const Lenis = lenisMod.default;
    const gsap = (gsapMod as { gsap?: typeof import("gsap").gsap }).gsap ?? gsapMod.default;
    const ScrollTrigger = (stMod as { ScrollTrigger?: unknown }).ScrollTrigger ?? stMod.default;

    gsap.registerPlugin(ScrollTrigger as never);

    // Smooth-scroll duration comes from the shared motion token (TASK-DS-009), so
    // the scene's timing tracks the design scale rather than a magic number.
    const lenis = new Lenis({
      autoRaf: false,
      smoothWheel: true,
      duration: readDurationSeconds("--cs-dur-scroll", 1.1),
    });
    const update = () => (ScrollTrigger as { update: () => void }).update();
    lenis.on("scroll", update);

    const onTick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);
    activeLenis = lenis as unknown as LenisLike;
    (window as unknown as { __csLenis?: LenisLike }).__csLenis = activeLenis;

    // NOTE: the pinned hero beat (TASK-SCENE-004) is intentionally NOT created
    // here. `pin: true` wraps .cs-hero in a GSAP-owned div.pin-spacer - real
    // DOM surgery. This provider lives in the locale LAYOUT, so its effect can
    // run while the PAGE segment is still hydrating; when the async GSAP import
    // won that race it mutated the DOM mid-hydration and React threw error
    // #418 ("server HTML didn't match"), regenerated the whole client tree,
    // and stranded every one-shot observer on orphaned nodes (the round-5
    // "section headings never reveal" bug). The pin is created instead by
    // <HeroPin/> INSIDE the page segment via createHeroPin() below - a page
    // component's effect cannot run before its own segment finished hydrating.

    return {
      destroy() {
        activeLenis = null;
        gsap.ticker.remove(onTick);
        lenis.off("scroll", update);
        lenis.destroy();
        (ScrollTrigger as { getAll: () => { kill: () => void }[] }).getAll().forEach((t) => t.kill());
      },
    };
  } catch {
    // Motion libs absent or failed to load: native scroll is the baseline.
    return null;
  }
}

// Pinned hero beat (TASK-SCENE-004): hold the hero in place while the first
// stretch of scroll scrubs the scene intro, then release. scrub ties it to
// scroll position so it reverses cleanly; pinSpacing keeps the layout gap-free.
// Desktop + motion-allowed only - reduced motion or narrow viewports keep the
// ordinary flow (clause 3). Called from <HeroPin/> (inside the page segment)
// strictly AFTER hydration - see the note in initScrollStory above. The GSAP
// modules are the same cached instances the provider imported.
export async function createHeroPin(): Promise<ScrollStoryHandle | null> {
  try {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const wide = window.matchMedia("(min-width: 1024px)").matches;
    const heroEl = document.querySelector<HTMLElement>(".cs-hero");
    if (!heroEl || !wide || reduce) return null;

    const [gsapMod, stMod] = await Promise.all([import("gsap"), import("gsap/ScrollTrigger")]);
    const gsap = (gsapMod as { gsap?: typeof import("gsap").gsap }).gsap ?? gsapMod.default;
    const ScrollTrigger = (stMod as { ScrollTrigger?: unknown }).ScrollTrigger ?? stMod.default;
    gsap.registerPlugin(ScrollTrigger as never);

    const trigger = (ScrollTrigger as { create: (cfg: Record<string, unknown>) => { kill: () => void } }).create({
      trigger: heroEl,
      start: "top top",
      end: "+=55%",
      pin: true,
      pinSpacing: true,
      scrub: true,
    });
    return { destroy: () => trigger.kill() };
  } catch {
    return null;
  }
}
