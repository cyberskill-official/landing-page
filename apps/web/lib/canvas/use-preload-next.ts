'use client';

import { useEffect, type RefObject } from 'react';
import { trackEvent } from '@/lib/analytics';
import { preloadGltfWithLocalDecoders } from '@/lib/canvas/decoder-config';
import { postTask, yieldIfNeeded } from '@/lib/perf/scheduler';
import { preloadScene } from '@/lib/scene-preload-chain';
import { useLowMemoryMode } from '@/lib/stores';
import { MAX_TOTAL_PRELOAD_BYTES, PRELOAD_CHAIN, totalPreloadBytes } from './preload-manifest';

type ConnectionLike = {
  effectiveType?: string;
  saveData?: boolean;
};

type PreloadOptions = {
  connection?: ConnectionLike;
  fetchImpl?: typeof fetch;
  lowMemoryMode?: boolean;
  preload?: (url: string) => void | Promise<void>;
  signal?: AbortSignal;
  track?: typeof trackEvent;
};

export const PRELOAD_OBSERVER_OPTIONS = {
  rootMargin: '200%',
  threshold: 0.5,
} satisfies IntersectionObserverInit;

export function shouldSkipPreload({
  connection,
  lowMemoryMode,
}: {
  connection?: ConnectionLike;
  lowMemoryMode?: boolean;
}) {
  if (lowMemoryMode) return 'low_memory';
  if (connection?.saveData) return 'save_data';
  if (connection?.effectiveType === '2g' || connection?.effectiveType === 'slow-2g') return 'slow_connection';
  if (totalPreloadBytes() > MAX_TOTAL_PRELOAD_BYTES) return 'budget_exceeded';
  return null;
}

async function defaultGltfPreload(url: string) {
  await preloadGltfWithLocalDecoders(url);
}

export async function preloadNextScene(currentScene: number, options: PreloadOptions = {}) {
  const entry = PRELOAD_CHAIN[currentScene];
  if (!entry) return { status: 'skipped', reason: 'no_next_scene' as const };

  const skipReason = shouldSkipPreload({
    connection: options.connection,
    lowMemoryMode: options.lowMemoryMode,
  });
  if (skipReason) return { status: 'skipped', reason: skipReason };

  const startedAt = performance.now();
  const track = options.track ?? trackEvent;
  const fetchImpl = options.fetchImpl ?? fetch;
  const preload = options.preload ?? defaultGltfPreload;

  track('preload_started', { scene: currentScene, url: entry.url });
  await postTask(
    () =>
      preloadScene(entry.url, async (url) => {
        let phaseStartedAt = performance.now();
        await preload(url);
        await yieldIfNeeded(phaseStartedAt);

        phaseStartedAt = performance.now();
        const response = await fetchImpl(url, { signal: options.signal });
        const blob = await response.blob();
        await yieldIfNeeded(phaseStartedAt);

        track('preload_completed', {
          scene: currentScene,
          url,
          bytes: blob.size,
          latency_ms: Math.round(performance.now() - startedAt),
        });
      }),
    'background',
  );

  return { status: 'started', url: entry.url };
}

export function usePreloadNext(currentScene: number, ref: RefObject<HTMLElement | null>) {
  const lowMemoryMode = useLowMemoryMode();

  useEffect(() => {
    if (typeof window === 'undefined' || !ref.current || typeof IntersectionObserver === 'undefined') return;

    const controller = new AbortController();
    let triggered = false;
    const connection = (navigator as { connection?: ConnectionLike }).connection;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry || triggered || entry.intersectionRatio < 0.5) return;
      triggered = true;
      void preloadNextScene(currentScene, {
        connection,
        lowMemoryMode,
        signal: controller.signal,
      });
    }, PRELOAD_OBSERVER_OPTIONS);

    observer.observe(ref.current);
    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [currentScene, lowMemoryMode, ref]);
}

export function useScenePreloadObservers() {
  const lowMemoryMode = useLowMemoryMode();

  useEffect(() => {
    if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') return;

    const controller = new AbortController();
    const seen = new Set<number>();
    const connection = (navigator as { connection?: ConnectionLike }).connection;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        const target = entry.target as HTMLElement;
        const scene = Number(target.dataset.sceneIndex);
        if (!Number.isInteger(scene) || seen.has(scene) || entry.intersectionRatio < 0.5) continue;
        seen.add(scene);
        void preloadNextScene(scene, {
          connection,
          lowMemoryMode,
          signal: controller.signal,
        });
      }
    }, PRELOAD_OBSERVER_OPTIONS);

    document.querySelectorAll<HTMLElement>('[data-scene-index]').forEach((element) => observer.observe(element));

    return () => {
      observer.disconnect();
      controller.abort();
    };
  }, [lowMemoryMode]);
}
