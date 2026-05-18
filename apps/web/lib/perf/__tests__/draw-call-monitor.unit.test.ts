import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  DRAW_CALL_LIMIT,
  DRAW_CALL_WARN_THRESHOLD,
  getAllPeakDrawCalls,
  getPeakDrawCalls,
  recordDrawCalls,
  resetDrawCallMonitor,
} from '../draw-call-monitor';

describe('FR-PERF-008 draw-call monitor', () => {
  afterEach(() => {
    resetDrawCallMonitor();
    vi.restoreAllMocks();
  });

  test('tracks peak draw calls per scene', () => {
    expect(recordDrawCalls(3, 24)).toMatchObject({ scene: 3, calls: 24, peak: 24 });
    expect(recordDrawCalls(3, 12)).toMatchObject({ peak: 24 });
    expect(recordDrawCalls(3, 65)).toMatchObject({ peak: 65 });
    expect(getPeakDrawCalls(3)).toBe(65);
    expect(getAllPeakDrawCalls()[3]).toBe(65);
  });

  test('flags warning and limit thresholds', () => {
    expect(recordDrawCalls(2, DRAW_CALL_WARN_THRESHOLD + 1)).toMatchObject({
      overWarning: true,
      overLimit: false,
    });
    expect(recordDrawCalls(2, DRAW_CALL_LIMIT)).toMatchObject({
      overWarning: true,
      overLimit: true,
    });
  });

  test('warns only in development for over-threshold frames', () => {
    const originalEnv = process.env.NODE_ENV;
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    vi.stubEnv('NODE_ENV', 'development');

    recordDrawCalls(4, 90);
    expect(warnSpy).toHaveBeenCalledWith('[perf] Scene 4 draw calls: 90 (target < 100)');

    warnSpy.mockClear();
    vi.stubEnv('NODE_ENV', 'production');
    recordDrawCalls(4, 95);
    expect(warnSpy).not.toHaveBeenCalled();
    vi.stubEnv('NODE_ENV', originalEnv);
  });
});
