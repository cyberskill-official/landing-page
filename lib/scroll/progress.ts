// Module-level scroll state. Written by ScrollState (one passive,
// rAF-throttled listener) and read by the 3D scene each frame - no React
// re-renders, no store.
//
// Two views of the same scroll: the hero-scoped progress (0..1 over the first
// viewport) drives Lumi's spin/glow choreography and the intro beats, while
// the raw page scroll drives the full-page mascot journey (TASK-CHAR-030).

let progress = 0;

export function setScrollProgress(value: number): void {
  progress = value < 0 ? 0 : value > 1 ? 1 : value;
}

export function getScrollProgress(): number {
  return progress;
}

export type PageScroll = { y: number; max: number; w: number; h: number };

let page: PageScroll = { y: 0, max: 1, w: 1, h: 1 };

export function setPageScroll(next: PageScroll): void {
  page = next;
}

export function getPageScroll(): PageScroll {
  return page;
}
