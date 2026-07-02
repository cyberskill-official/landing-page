// Canonical smooth-scroll + GSAP wiring (research doc §B): Lenis owns smooth
// scroll, GSAP's ticker drives Lenis's raf, ScrollTrigger updates on Lenis's
// scroll event. Everything is dynamically imported and fails closed, so a
// missing motion dependency or a reduced-motion preference never breaks the page.

import { readDurationSeconds } from "@/lib/motion/tokens";

export type ScrollStoryHandle = { destroy: () => void };

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

    // Smooth-scroll duration comes from the shared motion token (FR-DS-009), so
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

    // NOTE: the pinned hero beat (FR-SCENE-004) is intentionally NOT created
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

// Pinned hero beat (FR-SCENE-004): hold the hero in place while the first
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
