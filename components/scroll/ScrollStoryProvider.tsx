"use client";

import { useEffect } from "react";
import { initScrollStory, type ScrollStoryHandle } from "@/lib/scroll/lenis-gsap";

// Mounts once in the locale layout. Initialises smooth scroll unconditionally
// (2026-07-14: reverted the TASK-A11Y-010 reduced-motion gate here, matching the
// CanvasMount revert - see git history for the task). Lenis retains the native
// scrollbar, which matters for accessibility - research doc §E.
export function ScrollStoryProvider() {
  useEffect(() => {
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
