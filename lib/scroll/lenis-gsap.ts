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
