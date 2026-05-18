'use client';

import { useEffect, useRef } from 'react';
import type { RefObject } from 'react';
import type { DisposeAllOptions, DisposeTarget } from './dispose-all';
import { disposeAll } from './dispose-all';

export type DisposeRefTarget = DisposeTarget | DisposeTarget[];
export type DisposeRef = RefObject<DisposeRefTarget | null | undefined>;

export function useDisposeOnUnmount(refs: readonly DisposeRef[], options: DisposeAllOptions = {}): void {
  const refsRef = useRef(refs);
  const optionsRef = useRef(options);

  refsRef.current = refs;
  optionsRef.current = options;

  useEffect(() => {
    return () => {
      disposeRefTargets(refsRef.current, optionsRef.current);
    };
  }, []);
}

export function disposeRefTargets(refs: readonly DisposeRef[], options: DisposeAllOptions = {}): void {
  for (const ref of refs) {
    const current = ref.current;
    if (!current) continue;

    const targets = Array.isArray(current) ? current : [current];
    for (const target of targets) disposeAll(target, options);
  }
}
