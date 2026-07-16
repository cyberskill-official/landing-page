"use client";

// Gate + lazy-mount for the Phase-3 3D enhancement. The static poster is the
// SSR/initial and incapable-device visual; capable desktops with motion allowed
// upgrade to the live scene. The heavy R3F module is dynamically imported with
// ssr:false (never blocks first paint) and fails closed to the poster.
//
// Mounted ONLY from the homepage page (app/[lang]/page.tsx), never the shared
// layout - so sub-pages carry no canvas at all (the hero grid used to bleed over
// their content and the flight had nothing to fly to), and there is no
// usePathname/SSR gate that could desync hydration and shift layout (CLS).

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

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return !!(
      canvas.getContext("webgl2", { failIfMajorPerformanceCaveat: true }) ||
      canvas.getContext("webgl", { failIfMajorPerformanceCaveat: true })
    );
  } catch {
    return false;
  }
}

function capable(): boolean {
  if (typeof window === "undefined") return false;
  // Motion is always on by product decision (2026-07-14: reverted the
  // TASK-A11Y-010 reduced-motion gate on the R3F scene - see git history for
  // the task itself, still in force for LumiMagic/DepthField/BlackHole/
  // MotionExtras). We still gate on device capability so mobile / low-end
  // get the static poster - that is a Core Web Vitals choice, not a motion
  // preference. WebGL probe avoids THREE.WebGLRenderer console errors in
  // headless Lighthouse (Best Practices errors-in-console).
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  return wide && !coarse && cores >= 4 && hasWebGL();
}

export function CanvasMount() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    if (!capable()) return;

    // Defer the R3F/three bundle until after LCP / first paint. Immediate mount
    // on capable desktops pulled ~250KB+ of unused JS into the lab window and
    // competed with the poster for main-thread + bandwidth.
    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      setMount(true);
      document.documentElement.setAttribute("data-lumi-live", "true");
    };

    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 3000 });
    } else {
      timeoutId = setTimeout(arm, 1500);
    }

    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      document.documentElement.removeAttribute("data-lumi-live");
    };
  }, []);

  return (
    // The live scene rides ABOVE the content (cs-canvas-live raises z-index)
    // so Lumi can fly the whole page as a mascot (TASK-CHAR-030); the canvas
    // stays pointer-events:none, so it can never block interaction (the DOM
    // LumiHotspot provides the clickable mascot). The static poster keeps the
    // original behind-the-hero layering on incapable devices and during the
    // post-LCP idle window before the 3D upgrade.
    <div className={mount ? "cs-canvas-layer cs-canvas-live" : "cs-canvas-layer"} aria-hidden="true">
      {mount ? <GenieScene /> : <StaticPoster />}
    </div>
  );
}
