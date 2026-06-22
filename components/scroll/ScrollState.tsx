"use client";

import { useEffect } from "react";
import { setScrollProgress } from "@/lib/scroll/progress";

// Adds [data-scrolled="true"] to <html> once the page is scrolled past the top
// (so the sticky header can solidify) and publishes normalised scroll progress
// for the 3D scene. Passive listener, rAF-throttled.
export function ScrollState() {
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      document.documentElement.toggleAttribute("data-scrolled", window.scrollY > 24);
      // Hero-scoped progress (0 at top, 1 after one viewport): the scene is only
      // visible behind the transparent hero, so the choreography plays out there.
      setScrollProgress(window.innerHeight > 0 ? window.scrollY / window.innerHeight : 0);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return null;
}
