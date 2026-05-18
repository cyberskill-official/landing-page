export type SceneRange = {
  id: string;
  index: number;
  startVh: number;
  endVh: number;
  reduced: boolean;
};

export const SCENE_RANGES = [
  { id: 'scene-0-hero', index: 0, startVh: 0, endVh: 100, reduced: false },
  { id: 'scene-1-origin', index: 1, startVh: 100, endVh: 200, reduced: false },
  { id: 'scene-2-transformation', index: 2, startVh: 200, endVh: 300, reduced: false },
  { id: 'scene-3-capabilities', index: 3, startVh: 300, endVh: 400, reduced: false },
  { id: 'scene-4-team', index: 4, startVh: 400, endVh: 500, reduced: false },
  { id: 'scene-5-vietnam-global', index: 5, startVh: 500, endVh: 600, reduced: false },
  { id: 'scene-6-cta-hub', index: 6, startVh: 600, endVh: 700, reduced: false },
  { id: 'footer', index: 7, startVh: 700, endVh: 800, reduced: false },
] as const satisfies readonly SceneRange[];

export type SceneId = (typeof SCENE_RANGES)[number]['id'];

export const DEFAULT_SCENE_RANGE = SCENE_RANGES[0];
export const SCENE_INTERSECTION_THRESHOLD = 0.5;

export function getActiveSceneFromScrollY(
  scrollY: number,
  viewportHeight: number,
  ranges: readonly SceneRange[] = SCENE_RANGES,
): SceneRange {
  const scrollVh = scrollYToVh(scrollY, viewportHeight);
  return (
    ranges.find((range) => scrollVh >= range.startVh && scrollVh < range.endVh) ??
    ranges[ranges.length - 1] ??
    DEFAULT_SCENE_RANGE
  );
}

export function getSceneProgress(
  sceneId: string,
  scrollY: number,
  viewportHeight: number,
  ranges: readonly SceneRange[] = SCENE_RANGES,
): number {
  const range = findSceneRange(sceneId, ranges);
  if (!range) return 0;
  const scrollVh = scrollYToVh(scrollY, viewportHeight);
  return clamp01((scrollVh - range.startVh) / (range.endVh - range.startVh));
}

export function getSceneProgressMap(
  scrollY: number,
  viewportHeight: number,
  ranges: readonly SceneRange[] = SCENE_RANGES,
): Record<string, number> {
  return Object.fromEntries(
    ranges.map((range) => [range.id, getSceneProgress(range.id, scrollY, viewportHeight, ranges)]),
  );
}

export function sceneIdFromElement(element: Element): SceneId | null {
  const sceneId = (element as HTMLElement).dataset.sceneId;
  return isSceneId(sceneId) ? sceneId : null;
}

export function getIntersectingSceneId(entries: Array<Pick<IntersectionObserverEntry, 'isIntersecting' | 'intersectionRatio' | 'target'>>): SceneId | null {
  const entry = entries
    .filter((candidate) => candidate.isIntersecting && candidate.intersectionRatio >= SCENE_INTERSECTION_THRESHOLD)
    .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
  return entry ? sceneIdFromElement(entry.target) : null;
}

export function findSceneRange(
  sceneId: string | null | undefined,
  ranges: readonly SceneRange[] = SCENE_RANGES,
): SceneRange | undefined {
  return ranges.find((range) => range.id === sceneId);
}

export function isSceneId(value: string | null | undefined): value is SceneId {
  return SCENE_RANGES.some((range) => range.id === value);
}

function scrollYToVh(scrollY: number, viewportHeight: number): number {
  if (!Number.isFinite(scrollY) || !Number.isFinite(viewportHeight) || viewportHeight <= 0) return 0;
  return (Math.max(0, scrollY) / viewportHeight) * 100;
}

function clamp01(value: number): number {
  if (!Number.isFinite(value)) return 0;
  return Math.min(1, Math.max(0, value));
}
