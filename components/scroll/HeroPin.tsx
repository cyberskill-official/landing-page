"use client";

import { useEffect } from "react";
import { createHeroPin, type ScrollStoryHandle } from "@/lib/scroll/lenis-gsap";

// Creates the pinned-hero ScrollTrigger (FR-SCENE-004) from INSIDE the page
// segment. GSAP's `pin: true` wraps .cs-hero in a div.pin-spacer - DOM surgery
// React must never witness mid-hydration (it throws #418 and regenerates the
// client tree, which strands every one-shot IntersectionObserver). A page
// component's effect only runs after its own segment finished hydrating, so
// mounting the pin here makes the mutation provably post-hydration. Renders
// nothing; unmount (e.g. locale switch) kills the trigger, which also restores
// the original DOM.
export function HeroPin() {
  useEffect(() => {
    let handle: ScrollStoryHandle | null = null;
    let cancelled = false;
    createHeroPin().then((h) => {
      if (cancelled) h?.destroy();
      else handle = h;
    });
    return () => {
      cancelled = true;
      handle?.destroy();
    };
  }, []);

  return null;
}
