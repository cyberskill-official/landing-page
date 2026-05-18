'use client';

import { useEffect } from 'react';
import { onIdle, postTask } from './scheduler';

export function useDeferredAnalytics(events: ReadonlyArray<() => void>, timeoutMs = 1000): void {
  useEffect(() => {
    const cancellations = events.map((event) =>
      onIdle(() => {
        void postTask(event, 'background');
      }, timeoutMs),
    );

    return () => {
      for (const cancel of cancellations) cancel();
    };
  }, [events, timeoutMs]);
}
