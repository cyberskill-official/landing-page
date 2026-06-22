"use client";

// Gate + lazy-mount for the Phase-3 3D enhancement. The static poster is the
// SSR/initial and incapable-device visual; capable desktops with motion allowed
// upgrade to the live scene. The heavy R3F module is dynamically imported with
// ssr:false (never blocks first paint) and fails closed to the poster.

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { StaticPoster } from "@/components/canvas/StaticPoster";

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
  // Desktop, fine pointer, enough cores: protects Core Web Vitals on mobile/low-end.
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

  return (
    <div className="cs-canvas-layer" aria-hidden="true">
      {mount ? <GenieScene /> : <StaticPoster />}
    </div>
  );
}
