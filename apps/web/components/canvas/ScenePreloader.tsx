'use client';

import { useEffect, useState } from 'react';
import { useActiveScene, useScrollDirection } from '@/lib/stores';
import { useScenePreloadObservers } from '@/lib/canvas/use-preload-next';
import {
  getScenePreloadStates,
  preloadScene,
  resolvePreloadTargets,
} from '@/lib/scene-preload-chain';

export function ScenePreloader() {
  const activeScene = useActiveScene();
  const direction = useScrollDirection();
  const [debugEnabled, setDebugEnabled] = useState(false);
  const [states, setStates] = useState<Record<string, string>>({});
  useScenePreloadObservers();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDebugEnabled(new URLSearchParams(window.location.search).get('debug') === 'suspense');
  }, []);

  useEffect(() => {
    if (!debugEnabled) return;
    const id = window.setInterval(() => setStates(getScenePreloadStates()), 150);
    return () => window.clearInterval(id);
  }, [debugEnabled]);

  useEffect(() => {
    for (const target of resolvePreloadTargets(activeScene, direction)) {
      void preloadScene(target);
    }
  }, [activeScene, direction]);

  return (
    <>
      <span
        aria-live="polite"
        data-scene-suspense-aria
        style={{
          position: 'absolute',
          width: 1,
          height: 1,
          overflow: 'hidden',
          clip: 'rect(0 0 0 0)',
          whiteSpace: 'nowrap',
        }}
      >
        Loading scene...
      </span>
      {debugEnabled && process.env.NODE_ENV !== 'production' ? (
        <output
          aria-label="Suspense debug"
          data-suspense-debug
          style={{
            position: 'fixed',
            top: 12,
            right: 12,
            zIndex: 60,
            padding: '8px 10px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            background: 'rgba(12, 13, 18, 0.82)',
            color: 'white',
            font: '12px/1.4 monospace',
            pointerEvents: 'none',
          }}
        >
          scene: {activeScene} | direction: {direction} | preloads: {JSON.stringify(states)}
        </output>
      ) : null}
    </>
  );
}
