// Module-level scroll progress (0 at top, 1 at the bottom of the page).
// Written by ScrollState (one passive, rAF-throttled listener) and read by the
// 3D scene each frame via getScrollProgress() - no React re-renders, no store.

let progress = 0;

export function setScrollProgress(value: number): void {
  progress = value < 0 ? 0 : value > 1 ? 1 : value;
}

export function getScrollProgress(): number {
  return progress;
}
