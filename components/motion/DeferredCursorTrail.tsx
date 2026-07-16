"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

// Cursor dust is pure decoration. Keep gsap/canvas work off the first paint and
// off mobile Lighthouse (no mouse). Mount after idle on fine-pointer desktops.
const CursorTrail = dynamic(
  () => import("@/components/motion/CursorTrail").then((m) => m.CursorTrail),
  { ssr: false },
);

export function DeferredCursorTrail() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (!window.matchMedia("(pointer: fine)").matches) return;

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const arm = () => setReady(true);

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 2500 });
    } else {
      timeoutId = setTimeout(arm, 1200);
    }

    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
  }, []);

  if (!ready) return null;
  return <CursorTrail />;
}
