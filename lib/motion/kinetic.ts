// Pure motion-math helpers for the premium polish layer (FR-DS-012).
// DOM-free on purpose so they unit-test directly (tests/motion-polish.test.ts):
// the JS-driven affordances (magnetic CTAs, card tilt, kinetic headline) keep
// their arithmetic here and their wiring in components/motion/MotionExtras.tsx.

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

// Split a slogan into words for the masked line reveal. Unicode-safe (Vietnamese
// diacritics ride along untouched); collapses any whitespace run.
export function splitSloganWords(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

// Magnetic pull for a CTA: how far the element leans toward the pointer.
// dx/dy are pointer offsets from the element centre, `size` its larger side.
// The pull is proportional and hard-capped so a button never escapes its slot.
export function magneticOffset(
  dx: number,
  dy: number,
  size: number,
  strength: number,
  maxPx: number,
): { x: number; y: number } {
  if (size <= 0) return { x: 0, y: 0 };
  const nx = clamp(dx / size, -1, 1);
  const ny = clamp(dy / size, -1, 1);
  return {
    x: clamp(nx * size * strength, -maxPx, maxPx),
    y: clamp(ny * size * strength, -maxPx, maxPx),
  };
}

// Perspective tilt for a card: pointer position inside the rect maps to
// rotateX/rotateY, zero at the centre, capped at +-maxDeg at the edges.
export function tiltFromPointer(
  px: number,
  py: number,
  rect: { left: number; top: number; width: number; height: number },
  maxDeg: number,
): { rx: number; ry: number } {
  if (rect.width <= 0 || rect.height <= 0) return { rx: 0, ry: 0 };
  const relX = clamp((px - rect.left) / rect.width, 0, 1);
  const relY = clamp((py - rect.top) / rect.height, 0, 1);
  return {
    rx: (0.5 - relY) * 2 * maxDeg,
    ry: (relX - 0.5) * 2 * maxDeg,
  };
}
