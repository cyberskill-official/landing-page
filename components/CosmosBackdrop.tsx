"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

// A permanent cosmos behind the whole site (FR-CHAR-032). It is portaled to
// <body> - NOT left inside <main> - because <main> is a z-index:1 stacking
// context, which would trap this fixed layer inside it and fade it away with the
// content during a digest. As a direct child of <body> it sits at z-index 0,
// genuinely behind the content (z-index 1), so opaque sections cover it in normal
// reading and it is revealed - already there, never fading in - the moment the
// black hole digests the page's top layer away. Pure CSS/DOM: a deep-space
// gradient with nebula tints, two drifting star layers, and a gold sun with
// planets orbiting on faint rings. Decorative (aria-hidden); orbit + drift only
// animate while a digest is on (html[data-digesting]), so it is free while
// covered. Client + portal, so it renders after mount (no SSR needed for décor).
export function CosmosBackdrop() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  return createPortal(
    <div className="cs-cosmos" aria-hidden="true">
      <div className="cs-cosmos-stars" />
      <div className="cs-cosmos-stars cs-cosmos-stars-2" />
      <div className="cs-cosmos-sun" />
      <div className="cs-cosmos-system">
        <div className="cs-cosmos-orbit cs-orbit-1">
          <span className="cs-planet" />
        </div>
        <div className="cs-cosmos-orbit cs-orbit-2">
          <span className="cs-planet cs-planet-ringed" />
        </div>
        <div className="cs-cosmos-orbit cs-orbit-3">
          <span className="cs-planet cs-planet-blue" />
        </div>
        <div className="cs-cosmos-orbit cs-orbit-4">
          <span className="cs-planet cs-planet-pale" />
        </div>
      </div>
    </div>,
    document.body,
  );
}
