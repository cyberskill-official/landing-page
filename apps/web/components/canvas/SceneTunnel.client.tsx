'use client';

import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import type { MutableRefObject, ReactNode, RefObject } from 'react';
import type { Group } from 'three';
import { UseCanvas, useTracker } from '@14islands/r3f-scroll-rig';
import { useDisposeOnUnmount } from '@/lib/three/use-dispose-on-unmount';
import { SceneProgressProvider } from '@/lib/use-scene-progress';
import { SceneSuspenseFallback } from './SceneSuspenseFallback';

export type SceneTunnelProps = {
  id: string;
  trackElement: RefObject<HTMLElement | null>;
  cullMargin?: number;
  children: ReactNode;
};

export function SceneTunnelClient({ id, trackElement, cullMargin = 1, children }: SceneTunnelProps) {
  const rootRef = useRef<Group | null>(null);
  const [debugEnabled, setDebugEnabled] = useState(false);
  const trackerOptions = useMemo(
    () => ({
      rootMargin: `${Math.max(0, cullMargin) * 100}% 0%`,
      threshold: 0,
      autoUpdate: true,
    }),
    [cullMargin],
  );
  const tracker = useTracker(trackElement as MutableRefObject<HTMLElement>, trackerOptions);
  const progress = clampProgress(tracker.scrollState.progress);
  const culled = !tracker.inViewport;
  useDisposeOnUnmount([rootRef]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    setDebugEnabled(new URLSearchParams(window.location.search).get('debug') === 'tunnel');
  }, []);

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    window.__sceneTunnelStates = {
      ...(window.__sceneTunnelStates ?? {}),
      [id]: { progress, culled, tracked: Boolean(trackElement.current) },
    };
    return () => {
      if (!window.__sceneTunnelStates) return;
      delete window.__sceneTunnelStates[id];
    };
  }, [culled, id, progress, trackElement]);

  return (
    <>
      <UseCanvas id={id}>
        <Suspense fallback={<SceneSuspenseFallback />}>
          <SceneProgressProvider value={{ progress, culled, sceneId: id }}>
            <group ref={rootRef} visible={!culled} userData={{ sceneTunnelId: id }}>
              {children}
            </group>
          </SceneProgressProvider>
        </Suspense>
      </UseCanvas>
      {debugEnabled && process.env.NODE_ENV !== 'production' ? (
        <output
          aria-label={`${id} tunnel debug`}
          data-tunnel-debug={id}
          style={{
            position: 'fixed',
            left: 12,
            bottom: 12,
            zIndex: 50,
            padding: '8px 10px',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: 6,
            background: 'rgba(12, 13, 18, 0.82)',
            color: 'white',
            font: '12px/1.4 monospace',
            pointerEvents: 'none',
          }}
        >
          {id} | tracked: {trackElement.current ? 'true' : 'false'} | progress: {progress.toFixed(2)} |
          culled: {String(culled)}
        </output>
      ) : null}
    </>
  );
}

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(1, Math.max(0, progress));
}
