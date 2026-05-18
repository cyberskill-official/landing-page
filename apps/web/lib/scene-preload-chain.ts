import type { ScrollDirection } from './stores';

export const SCENE_GLBS: Record<number, string | null> = {
  0: '/scene-0.glb',
  1: '/scene-1.glb',
  2: '/scene-2.glb',
  3: '/scene-3.glb',
  4: '/scene-4.glb',
  5: '/scene-5.glb',
  6: '/scene-6.glb',
  7: null,
};

export const MAX_PRELOAD_AHEAD = 1 as const;

type ScenePreloadStatus = 'preloading' | 'preloaded' | 'failed';
type PreloadFn = (path: string) => void | Promise<void>;

const preloaded = new Set<string>();
const states = new Map<string, ScenePreloadStatus>();

export function resolvePreloadTargets(currentScene: number, direction: ScrollDirection): string[] {
  const step = direction === 'up' ? -1 : 1;
  const targets: string[] = [];

  for (let offset = 1; offset <= MAX_PRELOAD_AHEAD; offset += 1) {
    const glb = SCENE_GLBS[currentScene + step * offset];
    if (glb) targets.push(glb);
  }

  return targets;
}

export async function preloadScene(glbPath: string, preload: PreloadFn = defaultPreload): Promise<void> {
  if (preloaded.has(glbPath)) return;

  preloaded.add(glbPath);
  setPreloadState(glbPath, 'preloading');

  try {
    await preload(glbPath);
    setPreloadState(glbPath, 'preloaded');
  } catch (error) {
    preloaded.delete(glbPath);
    setPreloadState(glbPath, 'failed');
    console.warn(`[preload] failed: ${glbPath}`, error);
  }
}

export function getScenePreloadStates(): Record<string, ScenePreloadStatus> {
  return Object.fromEntries(states);
}

export function resetScenePreloadState(): void {
  preloaded.clear();
  states.clear();
  publishPreloadStates();
}

function setPreloadState(path: string, status: ScenePreloadStatus) {
  states.set(path, status);
  publishPreloadStates();
}

function publishPreloadStates() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    window.__scenePreloadStates = getScenePreloadStates();
  }
}

async function defaultPreload(path: string) {
  const { preloadGltfWithLocalDecoders } = await import('./canvas/decoder-config');
  await preloadGltfWithLocalDecoders(path);
}

declare global {
  interface Window {
    __scenePreloadStates?: Record<string, ScenePreloadStatus>;
  }
}
