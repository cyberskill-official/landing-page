import type { SceneRange } from './scene-timeline';

export const MOBILE_BREAKPOINT_QUERY = '(max-width: 767px)';

export const MOBILE_SCENE_RANGES = [
  { id: 'scene-0-hero', index: 0, startVh: 0, endVh: 100, reduced: false },
  { id: 'scene-1-2-merged', index: 1, startVh: 100, endVh: 200, reduced: false },
  { id: 'scene-3-4-merged', index: 2, startVh: 200, endVh: 300, reduced: false },
  { id: 'scene-5-vietnam-global', index: 3, startVh: 300, endVh: 400, reduced: false },
  { id: 'scene-6-cta-hub', index: 4, startVh: 400, endVh: 500, reduced: false },
  { id: 'footer', index: 5, startVh: 500, endVh: 600, reduced: false },
] as const satisfies readonly SceneRange[];

export function isMobileViewport(matchMedia: Window['matchMedia'] | undefined = globalThis.window?.matchMedia): boolean {
  if (!matchMedia) return false;
  return matchMedia(MOBILE_BREAKPOINT_QUERY).matches;
}
