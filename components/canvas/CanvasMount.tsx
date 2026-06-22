"use client";

// Gate + lazy-mount for the Phase-3 3D enhancement. It is deliberately defensive:
// the scene only mounts on capable desktops with motion allowed, and the heavy
// R3F module is dynamically imported with ssr:false so it never blocks first
// paint or the build of the crawlable base. If the 3D dependencies are absent,
// the dynamic import simply fails closed and the site is unaffected.

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const GenieScene = dynamic(
  () =>
    import("@/components/canvas/GenieScene")
      .then((m) => m.GenieScene)
      .catch(() => () => null),
  { ssr: false },
);

function capable(): boolean {
  if (typeof window === "undefined") return false;
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
  const motionPref = document.documentElement.getAttribute("data-cs-motion");
  if (reduce || motionPref === "reduce") return false;
  // Mobile / low-end: ship the static poster instead (protects Core Web Vitals).
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  return wide && !coarse && cores >= 4;
}

export function CanvasMount() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    setMount(capable());
  }, []);

  if (!mount) return null;
  return (
    <div className="cs-canvas-layer" aria-hidden="true">
      <GenieScene />
    </div>
  );
}
