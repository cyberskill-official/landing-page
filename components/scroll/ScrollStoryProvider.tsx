"use client";

import { useEffect } from "react";
import { initScrollStory, type ScrollStoryHandle } from "@/lib/scroll/lenis-gsap";
import { useMotionStore } from "@/lib/a11y/motion-store";

// Mounts once in the locale layout. Initialises smooth scroll only when motion
// is allowed; otherwise leaves the native scrollbar untouched (Lenis retains
// the native scrollbar, which matters for accessibility - research doc §E).
export function ScrollStoryProvider() {
  const reduce = useMotionStore((s) => s.reduce);

  useEffect(() => {
    if (reduce) {
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
  }, [reduce]);

  return null;
}
