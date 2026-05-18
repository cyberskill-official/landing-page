'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useCurrentNarration, type CurrentNarration } from '@/lib/a11y/use-current-narration';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';
import { useActiveScene } from '@/lib/stores';

export function SceneCaption() {
  const pathname = usePathname() ?? '/';
  const activeScene = useActiveScene();
  const narration = useCurrentNarration(activeScene);
  const reducedMotion = useReducedMotion();
  const [displayed, setDisplayed] = useState<CurrentNarration | null>(null);

  useEffect(() => {
    if (!narration) {
      setDisplayed(null);
      return;
    }

    if (reducedMotion) {
      setDisplayed(narration);
      return;
    }

    const id = window.setTimeout(() => setDisplayed(narration), 500);
    return () => window.clearTimeout(id);
  }, [narration, reducedMotion]);

  if (pathname !== '/' && pathname !== '/vi') return null;
  if (!displayed) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="scene-caption"
      data-scene-caption
      data-reduced-motion={reducedMotion ? 'true' : 'false'}
    >
      <p>
        <span className="scene-caption__prefix">Scene {displayed.sceneNumber}:</span>{' '}
        {displayed.text}
      </p>
    </div>
  );
}
