'use client';

import React from 'react';
import { useEffect, useMemo, useState } from 'react';
import { useReducedMotion } from '@/lib/a11y/use-reduced-motion';

export type TypedCaptionProps = {
  charsPerSecond?: number;
  instant?: boolean;
  text: string;
};

export function getTypedCaptionDurationMs(text: string, charsPerSecond = 45) {
  if (charsPerSecond <= 0) return 0;
  return Math.ceil((text.length / charsPerSecond) * 1_000);
}

export function TypedCaption({ charsPerSecond = 45, instant = false, text }: TypedCaptionProps) {
  const reducedMotion = useReducedMotion();
  const shouldRevealInstantly = instant || reducedMotion;
  const [revealed, setRevealed] = useState(shouldRevealInstantly ? text.length : 0);
  const intervalMs = useMemo(() => Math.max(16, Math.round(1_000 / charsPerSecond)), [charsPerSecond]);

  useEffect(() => {
    if (shouldRevealInstantly) {
      setRevealed(text.length);
      return undefined;
    }

    setRevealed(0);
    const timer = window.setInterval(() => {
      setRevealed((current) => {
        if (current >= text.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, intervalMs);

    return () => window.clearInterval(timer);
  }, [intervalMs, shouldRevealInstantly, text]);

  const visibleText = text.slice(0, revealed);

  return (
    <p className="scene-1-origin__caption" data-scene="scene-1-origin" aria-live="polite" aria-label={text}>
      {visibleText}
      {!shouldRevealInstantly && revealed < text.length ? <span aria-hidden="true">|</span> : null}
    </p>
  );
}
