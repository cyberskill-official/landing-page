"use client";

import { useEffect } from "react";
import { syncMotionPreference } from "@/lib/a11y/motion-store";

// Applies the real prefers-reduced-motion / cs-motion-reduce value to
// useMotionStore exactly once per page load, strictly after hydration has
// committed. Mounted once, high in the tree (app/layout.tsx), so every
// consumer of useMotionStore corrects to the real value as early as possible
// without ever risking a hydration mismatch (see lib/a11y/motion-store.ts).
export function MotionPreferenceSync() {
  useEffect(() => {
    syncMotionPreference();
  }, []);

  return null;
}
