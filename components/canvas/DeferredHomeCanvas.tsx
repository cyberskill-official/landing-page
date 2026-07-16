"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

// Live 3D only — SSR StaticPoster already paints the fallback layer.
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
  const wide = window.matchMedia("(min-width: 1024px)").matches;
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  return wide && !coarse && cores >= 4 && hasWebGL();
}

/**
 * Idle-mounts the WebGL canvas upgrade on capable desktops. Homepage keeps a
 * pure SSR StaticPoster for first paint; this island never blocks LCP.
 */
export function DeferredHomeCanvas() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!capable()) return;

    let idleId: number | undefined;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    const arm = () => {
      setReady(true);
      document.documentElement.setAttribute("data-lumi-live", "true");
    };
    if ("requestIdleCallback" in window) {
      idleId = window.requestIdleCallback(arm, { timeout: 4000 });
    } else {
      timeoutId = setTimeout(arm, 2000);
    }
    return () => {
      if (idleId !== undefined && "cancelIdleCallback" in window) {
        window.cancelIdleCallback(idleId);
      }
      if (timeoutId !== undefined) clearTimeout(timeoutId);
      document.documentElement.removeAttribute("data-lumi-live");
    };
  }, []);

  if (!ready) return null;

  return (
    <div className="cs-canvas-layer cs-canvas-live" aria-hidden="true">
      <GenieScene />
    </div>
  );
}
