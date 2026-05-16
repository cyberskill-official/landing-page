'use client';
import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { hasWebGL2 } from '@/lib/feature-detect';

const CanvasMount = dynamic(() => import('./CanvasMount'), { ssr: false });

export function GlobalCanvasShell() {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!hasWebGL2()) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const mount = () => setShouldMount(true);
    if ('requestIdleCallback' in window) {
      (window as unknown as { requestIdleCallback: (cb: () => void, opts: object) => void })
        .requestIdleCallback(mount, { timeout: 500 });
    } else {
      setTimeout(mount, 0);
    }
  }, []);

  if (!shouldMount) return null;
  return <CanvasMount />;
}
