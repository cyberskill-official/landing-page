export type PreloadManifestEntry = {
  bytes: number;
  url: string;
};

export const PRELOAD_CHAIN: Record<number, PreloadManifestEntry | null> = {
  0: { url: '/scene-1.glb', bytes: 420_000 },
  1: { url: '/scene-2.glb', bytes: 520_000 },
  2: { url: '/scene-3.glb', bytes: 580_000 },
  3: { url: '/scene-4.glb', bytes: 540_000 },
  4: { url: '/scene-5.glb', bytes: 700_000 },
  5: { url: '/scene-6.glb', bytes: 620_000 },
  6: null,
  7: null,
};

export const MAX_TOTAL_PRELOAD_BYTES = 5 * 1024 * 1024;

export function totalPreloadBytes() {
  return Object.values(PRELOAD_CHAIN).reduce((sum, entry) => sum + (entry?.bytes ?? 0), 0);
}

