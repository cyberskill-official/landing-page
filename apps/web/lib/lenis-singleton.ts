import { useSyncExternalStore } from 'react';
import type Lenis from 'lenis';
import type { LenisOptions } from 'lenis';
import { isClient } from './dynamic-three';

type LenisSnapshot = {
  lenis: Lenis | null;
  progress: number;
  scroll: number;
  velocity: number;
};

declare global {
  interface Window {
    __lenis?: Lenis | null;
    __lenisOptions?: LenisOptions;
    __scrollTriggerProxyRegistrations?: number;
  }
}

let snapshot: LenisSnapshot = {
  lenis: null,
  progress: 0,
  scroll: 0,
  velocity: 0,
};

const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function setSnapshot(next: LenisSnapshot) {
  snapshot = next;
  emit();
}

export function getLenis(): Lenis | null {
  return snapshot.lenis;
}

export function setLenis(lenis: Lenis | null): void {
  setSnapshot({
    lenis,
    progress: lenis ? clampProgress(lenis.progress) : 0,
    scroll: lenis?.scroll ?? 0,
    velocity: lenis?.velocity ?? 0,
  });

  if (isClient() && process.env.NODE_ENV !== 'production') {
    window.__lenis = lenis;
  }
}

export function setScrollProgress(progress: number): void {
  setSnapshot({
    ...snapshot,
    progress: clampProgress(progress),
  });
}

export function updateLenisMetrics(lenis: Lenis): void {
  setSnapshot({
    lenis,
    progress: clampProgress(lenis.progress),
    scroll: lenis.scroll,
    velocity: lenis.velocity,
  });

  if (isClient() && process.env.NODE_ENV !== 'production') {
    window.__lenis = lenis;
  }
}

export function getScrollProgress(): number {
  return snapshot.progress;
}

export function useLenis(): Lenis | null {
  return useSyncExternalStore(subscribe, () => snapshot.lenis, () => null);
}

export function useScrollProgress(): number {
  return useSyncExternalStore(subscribe, () => snapshot.progress, () => 0);
}

function clampProgress(progress: number) {
  if (!Number.isFinite(progress)) return 0;
  return Math.min(1, Math.max(0, progress));
}
