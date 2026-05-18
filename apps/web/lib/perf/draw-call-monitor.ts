'use client';

import { useFrame, useThree } from '@react-three/fiber';
import { useActiveScene } from '@/lib/stores';

export const DRAW_CALL_LIMIT = 100;
export const DRAW_CALL_WARN_THRESHOLD = 80;

const peakPerScene = new Map<number, number>();

export type DrawCallSnapshot = {
  scene: number;
  calls: number;
  peak: number;
  overWarning: boolean;
  overLimit: boolean;
};

export function useDrawCallMonitor(scene = useActiveScene()): void {
  const renderer = useThree((state) => state.gl);

  useFrame(() => {
    recordDrawCalls(scene, renderer.info.render.calls);
  });
}

export function recordDrawCalls(scene: number, calls: number): DrawCallSnapshot {
  const safeScene = Number.isFinite(scene) ? scene : 0;
  const safeCalls = Number.isFinite(calls) ? Math.max(0, Math.round(calls)) : 0;
  const previousPeak = peakPerScene.get(safeScene) ?? 0;
  const peak = Math.max(previousPeak, safeCalls);
  peakPerScene.set(safeScene, peak);

  if (safeCalls > DRAW_CALL_WARN_THRESHOLD && process.env.NODE_ENV === 'development') {
    console.warn(`[perf] Scene ${safeScene} draw calls: ${safeCalls} (target < ${DRAW_CALL_LIMIT})`);
  }

  return {
    scene: safeScene,
    calls: safeCalls,
    peak,
    overWarning: safeCalls > DRAW_CALL_WARN_THRESHOLD,
    overLimit: safeCalls >= DRAW_CALL_LIMIT,
  };
}

export function getPeakDrawCalls(scene: number): number {
  return peakPerScene.get(scene) ?? 0;
}

export function getAllPeakDrawCalls(): Record<number, number> {
  return Object.fromEntries(peakPerScene);
}

export function resetDrawCallMonitor(): void {
  peakPerScene.clear();
}
