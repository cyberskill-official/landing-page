// Lumi's full-page flight plan (TASK-CHAR-030). The pure math lives here so it
// unit-tests without a DOM or WebGL (tests/journey.test.ts); the scene feeds
// it real section positions at runtime.
//
// Model: a list of stops, each "when the page has scrolled to y, Lumi hovers
// at viewport anchor (vx, vy) at this scale". Between stops the sampler
// smoothsteps, and the scene adds a sinusoidal bow so legs read as swoops
// rather than straight lines. Anchors are viewport fractions (0..1), mapped
// to world units by viewportToWorld for a fixed camera on the z=0 plane -
// deterministic, aspect-aware, and testable.

export type ViewportAnchor = { vx: number; vy: number; scale: number };
export type JourneyStop = ViewportAnchor & { y: number };

// The route: one anchor per home section, alternating page sides so Lumi
// weaves down the page. Selectors resolve against the rendered DOM; missing
// sections (sub-pages) simply drop out and the journey uses what exists.
export const ROUTE: ReadonlyArray<{ selector: string; anchor: ViewportAnchor }> = [
  // Hero: big but clear of the 46rem text column (the live canvas paints
  // ABOVE content, so anchors must respect the type).
  { selector: ".cs-hero", anchor: { vx: 0.82, vy: 0.38, scale: 0.72 } },
  { selector: ".cs-trust", anchor: { vx: 0.86, vy: 0.4, scale: 0.5 } },
  { selector: "#story", anchor: { vx: 0.07, vy: 0.4, scale: 0.4 } },
  { selector: "[aria-labelledby='value-title']", anchor: { vx: 0.86, vy: 0.3, scale: 0.36 } },
  { selector: "#services", anchor: { vx: 0.06, vy: 0.34, scale: 0.38 } },
  { selector: "#process", anchor: { vx: 0.86, vy: 0.36, scale: 0.36 } },
  { selector: "#work", anchor: { vx: 0.06, vy: 0.4, scale: 0.38 } },
  { selector: "#proof", anchor: { vx: 0.86, vy: 0.32, scale: 0.36 } },
  { selector: "#faq", anchor: { vx: 0.06, vy: 0.36, scale: 0.36 } },
  { selector: "#careers", anchor: { vx: 0.86, vy: 0.42, scale: 0.4 } },
  // Contact: hover the seam between the info column and the form card.
  { selector: "#contact", anchor: { vx: 0.47, vy: 0.42, scale: 0.36 } },
];

// Chat cloud centre (viewport fractions) — Lumi orbits this point while
// the genie panel is open, shooting energy into the cloud.
// Scale is large so the full-size scene mascot reads clearly outside the shell.
export const CHAT_CENTER: ViewportAnchor = { vx: 0.5, vy: 0.48, scale: 1.05 };
/** @deprecated use CHAT_CENTER + orbit; kept for tests that import the name */
export const CHAT_ANCHOR: ViewportAnchor = CHAT_CENTER;

/**
 * Orbit radius — keep Lumi outside the fixed cloud shell on 14" screens.
 * Slightly wider horizontal so she doesn't sit under the dim scrim center.
 */
export const CHAT_ORBIT = { rx: 0.46, ry: 0.26, speed: 0.5 } as const;

/** Sample Lumi's chat-open orbit at elapsed seconds (smooth ellipse around center). */
export function sampleChatOrbit(elapsedSec: number): ViewportAnchor {
  const a = elapsedSec * CHAT_ORBIT.speed;
  return {
    vx: CHAT_CENTER.vx + Math.cos(a) * CHAT_ORBIT.rx,
    vy: CHAT_CENTER.vy + Math.sin(a) * CHAT_ORBIT.ry,
    scale: CHAT_CENTER.scale,
  };
}

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function smoothstep(t: number): number {
  const x = clamp(t, 0, 1);
  return x * x * (3 - 2 * x);
}

// Sample the journey at a scroll position. Stops must be sorted by y
// (buildStops guarantees it). Returns the interpolated anchor plus the leg
// index and progress within it, which the scene uses for bursts and bowing.
export function sampleJourney(
  stops: ReadonlyArray<JourneyStop>,
  scrollY: number,
): ViewportAnchor & { seg: number; t: number } {
  if (stops.length === 0) return { vx: 0.72, vy: 0.44, scale: 1, seg: 0, t: 0 };
  if (scrollY <= stops[0].y) return { ...anchorOf(stops[0]), seg: 0, t: 0 };
  for (let i = 0; i < stops.length - 1; i++) {
    const lo = stops[i];
    const hi = stops[i + 1];
    if (scrollY <= hi.y) {
      const span = hi.y - lo.y;
      const t = smoothstep(span > 0 ? (scrollY - lo.y) / span : 1);
      return {
        vx: lerp(lo.vx, hi.vx, t),
        vy: lerp(lo.vy, hi.vy, t),
        scale: lerp(lo.scale, hi.scale, t),
        seg: i,
        t,
      };
    }
  }
  const last = stops[stops.length - 1];
  return { ...anchorOf(last), seg: stops.length - 1, t: 1 };
}

function anchorOf(stop: JourneyStop): ViewportAnchor {
  return { vx: stop.vx, vy: stop.vy, scale: stop.scale };
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

// Map a viewport-fraction anchor to world coordinates on the z=0 plane for a
// fixed perspective camera at (0, 0, cameraZ) with the given vertical fov.
export function viewportToWorld(
  vx: number,
  vy: number,
  cameraZ: number,
  fovDeg: number,
  aspect: number,
): { x: number; y: number } {
  const halfH = Math.tan((fovDeg * Math.PI) / 360) * cameraZ;
  const halfW = halfH * aspect;
  return { x: (vx * 2 - 1) * halfW, y: (1 - vy * 2) * halfH };
}

// Build sorted stops from measured section rectangles. `top` is the section's
// document offset, `height` its size; the stop fires when the section's
// centre crosses the viewport centre, clamped into the scrollable range.
export function buildStops(
  sections: ReadonlyArray<{ anchor: ViewportAnchor; top: number; height: number }>,
  viewportH: number,
  scrollMax: number,
): JourneyStop[] {
  const stops = sections.map(({ anchor, top, height }) => ({
    ...anchor,
    y: clamp(top + height / 2 - viewportH / 2, 0, Math.max(0, scrollMax)),
  }));
  stops.sort((a, b) => a.y - b.y);
  return stops;
}

// DOM helper (not unit-tested; exercised live): measure the ROUTE against the
// current document. Safe to call repeatedly - it is cheap and pure-read.
export function measureRoute(): JourneyStop[] {
  if (typeof document === "undefined" || typeof window === "undefined") return [];
  const doc = document.documentElement;
  const scrollMax = Math.max(0, doc.scrollHeight - window.innerHeight);
  const sections: Array<{ anchor: ViewportAnchor; top: number; height: number }> = [];
  for (const { selector, anchor } of ROUTE) {
    const el = document.querySelector<HTMLElement>(selector);
    if (!el) continue;
    const rect = el.getBoundingClientRect();
    sections.push({ anchor, top: rect.top + window.scrollY, height: rect.height });
  }
  return buildStops(sections, window.innerHeight, scrollMax);
}
