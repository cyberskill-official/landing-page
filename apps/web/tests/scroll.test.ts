import { afterEach, describe, expect, test } from 'vitest';
import type Lenis from 'lenis';
import {
  getLenis,
  getScrollProgress,
  setLenis,
  setScrollProgress,
  updateLenisMetrics,
} from '../lib/lenis-singleton';

function fakeLenis(overrides: Partial<Lenis> = {}) {
  return {
    progress: 0.25,
    scroll: 120,
    velocity: 40,
    ...overrides,
  } as Lenis;
}

describe('FR-WEB-002 Lenis singleton', () => {
  afterEach(() => {
    setLenis(null);
  });

  test('stores and clears a singleton Lenis instance', () => {
    const lenis = fakeLenis();

    setLenis(lenis);
    expect(getLenis()).toBe(lenis);

    setLenis(null);
    expect(getLenis()).toBeNull();
  });

  test('maps scroll progress into a clamped 0..1 range', () => {
    updateLenisMetrics(fakeLenis({ progress: 0.4 }));
    expect(getScrollProgress()).toBe(0.4);

    setScrollProgress(2);
    expect(getScrollProgress()).toBe(1);

    setScrollProgress(-1);
    expect(getScrollProgress()).toBe(0);
  });
});
