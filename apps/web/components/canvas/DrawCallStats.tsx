'use client';

import { useEffect, useState } from 'react';
import { useThree } from '@react-three/fiber';
import { useActiveScene } from '@/lib/stores';
import {
  DRAW_CALL_LIMIT,
  DRAW_CALL_WARN_THRESHOLD,
  getPeakDrawCalls,
  useDrawCallMonitor,
} from '@/lib/perf/draw-call-monitor';

export function DrawCallStats() {
  const renderer = useThree((state) => state.gl);
  const activeScene = useActiveScene();
  const [debugEnabled, setDebugEnabled] = useState(false);
  useDrawCallMonitor(activeScene);

  useEffect(() => {
    setDebugEnabled(new URLSearchParams(window.location.search).get('debug') === 'draws');
  }, []);

  useEffect(() => {
    if (!debugEnabled || process.env.NODE_ENV === 'production') return undefined;
    const output = document.createElement('output');
    output.setAttribute('aria-label', 'Draw call stats');
    output.dataset.drawCallStats = 'true';
    Object.assign(output.style, {
      position: 'fixed',
      top: '118px',
      right: '12px',
      zIndex: '50',
      padding: '8px 10px',
      border: '1px solid rgba(255,255,255,0.2)',
      borderRadius: '6px',
      background: 'rgba(12, 13, 18, 0.82)',
      color: 'white',
      font: '12px/1.4 monospace',
      pointerEvents: 'none',
    });
    document.body.append(output);

    const update = () => {
      const calls = renderer.info.render.calls;
      const peak = getPeakDrawCalls(activeScene);
      output.textContent = `Draws: ${calls} | peak scene ${activeScene}: ${peak} | warn ${DRAW_CALL_WARN_THRESHOLD} | limit ${DRAW_CALL_LIMIT}`;
    };
    update();
    const interval = window.setInterval(update, 100);

    return () => {
      window.clearInterval(interval);
      output.remove();
    };
  }, [activeScene, debugEnabled, renderer]);

  return null;
}
