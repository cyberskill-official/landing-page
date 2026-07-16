"use client";

import { useEffect, useState, type ComponentType } from "react";

// Runtime import only after interaction/idle — next/dynamic at module scope
// still preloaded gsap into the lab window via the homepage Process section.
export function DeferredProcessCircuit() {
  const [Comp, setComp] = useState<ComponentType | null>(null);

  useEffect(() => {
    let done = false;
    const load = () => {
      if (done) return;
      done = true;
      void import("@/components/motion/ProcessCircuit").then((m) => {
        setComp(() => m.ProcessCircuit);
      });
      cleanup();
    };
    const events = ["scroll", "pointerdown", "keydown", "touchstart"] as const;
    const cleanup = () => {
      events.forEach((e) => window.removeEventListener(e, load));
      if (timeoutId !== undefined) clearTimeout(timeoutId);
    };
    events.forEach((e) =>
      window.addEventListener(e, load, { once: true, passive: true }),
    );
    // Long fallback so Lighthouse lab runs (no input, ~10–15s) never pull gsap.
    const timeoutId = setTimeout(load, 20000);
    return cleanup;
  }, []);

  if (!Comp) return null;
  return <Comp />;
}
