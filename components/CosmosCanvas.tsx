"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useMotionStore } from "@/lib/a11y/motion-store";

// Light wrapper for the true-3D solar system behind the site (FR-CHAR-032). It
// carries NO three.js import itself - the heavy scene lives in ./CosmosScene and
// is pulled in with next/dynamic (ssr:false) ONLY after the first digest begins.
// That keeps ~350KB of three.js/R3F/postprocessing out of the initial page
// bundle (the Lighthouse script budget is 320KB), and there is nothing to load
// until the visitor actually holds Lumi. Until then the CSS CosmosBackdrop is the
// visible universe; this canvas rides just above it for real depth on capable
// devices. The div stays mounted so its CSS opacity reveal (var(--cs-digest))
// works; the scene inside is what loads lazily.

const CosmosScene = dynamic(
  () =>
    import("@/components/CosmosScene")
      .then((m) => m.default)
      .catch(() => () => null),
  { ssr: false },
);

export function CosmosCanvas() {
  const [capable, setCapable] = useState(false);
  const [digesting, setDigesting] = useState(false);
  // Once the visitor has triggered a digest we keep the scene mounted, so the
  // three.js chunk loads once (on the first hold) and every later reveal is
  // instant. Before that first hold, nothing heavy is loaded at all.
  const [armed, setArmed] = useState(false);
  const reduce = useMotionStore((s) => s.reduce);

  useEffect(() => {
    if (reduce) {
      setCapable(false);
      return;
    }
    // Wide + enough cores. Deliberately NOT gated on pointer type: the digest
    // only fires on desktop (holding Lumi), so on touch this canvas simply never
    // reveals - and nothing loads until then anyway.
    const cores = navigator.hardwareConcurrency ?? 4;
    if (window.innerWidth < 1024 || cores < 4) return;
    setCapable(true);
    const el = document.documentElement;
    const update = () => {
      const on = el.hasAttribute("data-digesting");
      setDigesting(on);
      if (on) setArmed(true);
    };
    update();
    const mo = new MutationObserver(update);
    mo.observe(el, { attributes: true, attributeFilter: ["data-digesting"] });
    return () => mo.disconnect();
  }, [reduce]);

  if (!capable) return null;

  return (
    <div className="cs-cosmos3d" aria-hidden="true">
      {armed ? <CosmosScene digesting={digesting} /> : null}
    </div>
  );
}
