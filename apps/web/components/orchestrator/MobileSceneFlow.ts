import { SCENE_RANGES, type SceneRange } from './scene-timeline';
import { MOBILE_SCENE_RANGES, isMobileViewport } from './mobile-scene-ranges';

export const MOBILE_MERGED_SCENE_IDS = {
  scene1And2: 'scene-1-2-merged',
  scene3And4: 'scene-3-4-merged',
} as const;

export function getActiveSceneRanges(isMobile = isMobileViewport()): readonly SceneRange[] {
  return isMobile ? MOBILE_SCENE_RANGES : SCENE_RANGES;
}

export function getMobileMappedSceneId(desktopId: string, isMobile = isMobileViewport()): string {
  if (!isMobile) return desktopId;
  if (desktopId === 'scene-1-origin' || desktopId === 'scene-2-transformation') {
    return MOBILE_MERGED_SCENE_IDS.scene1And2;
  }
  if (desktopId === 'scene-3-capabilities' || desktopId === 'scene-4-team') {
    return MOBILE_MERGED_SCENE_IDS.scene3And4;
  }
  return desktopId;
}

export function getMergedSceneDwellMs(sceneId: string): number {
  return sceneId === MOBILE_MERGED_SCENE_IDS.scene1And2 || sceneId === MOBILE_MERGED_SCENE_IDS.scene3And4
    ? 3_000
    : 1_400;
}
