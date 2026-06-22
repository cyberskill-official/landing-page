"use client";

import { useEffect } from "react";

// Adds [data-scrolled="true"] to <html> once the page is scrolled past the top,
// so the sticky header can solidify. Passive listener, rAF-throttled.
export function ScrollState() {
  useEffect(() => {
    let ticking = false;
    const update = () => {
      ticking = false;
      const scrolled = window.scrollY > 24;
      document.documentElement.toggleAttribute("data-scrolled", scrolled);
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
