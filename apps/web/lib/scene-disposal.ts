import type { AnimationMixer, Object3D } from 'three';
import { disposeAll } from './three/dispose-all';

export function disposeSubtree(root: Object3D | null | undefined): void {
  disposeAll(root);
}

export function disposeMixer(mixer: AnimationMixer | null | undefined, root: Object3D | null | undefined): void {
  if (!mixer) return;
  mixer.stopAllAction();
  if (root) mixer.uncacheRoot(root);
}

export { disposeAll };

declare global {
  interface Window {
    __sceneTunnelStates?: Record<string, { progress: number; culled: boolean; tracked: boolean }>;
  }
}
