"use client";

import { useEffect } from "react";
import { initScrollStory, type ScrollStoryHandle } from "@/lib/scroll/lenis-gsap";

// Mounts once in the locale layout. Initialises smooth scroll only when motion
// is allowed; otherwise leaves the native scrollbar untouched (Lenis retains
// the native scrollbar, which matters for accessibility - research doc §E).
export function ScrollStoryProvider() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }
    let handle: ScrollStoryHandle | null = null;
    let cancelled = false;
    initScrollStory().then((h) => {
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
