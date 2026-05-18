import { afterEach, describe, expect, test, vi } from 'vitest';
import {
  clearLitePref,
  getCapabilityDebugSnapshot,
  detectLowMemory,
  detectSaveData,
  detectWebGL2,
  getLitePref,
  setLitePref,
} from '../../lib/capability-detection';

function stubStorage() {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => values.set(key, value),
    removeItem: (key: string) => values.delete(key),
  });
}

describe('FR-WEB-009 capability detection', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('detectWebGL2 returns true when WebGL2 and float color extension exist', () => {
    vi.stubGlobal('document', {
      createElement: () => ({
        getContext: (kind: string) =>
          kind === 'webgl2' ? { getExtension: () => ({ supported: true }) } : null,
      }),
    });

    expect(detectWebGL2()).toBe(true);
  });

  test('detectWebGL2 returns false when getContext returns null', () => {
    vi.stubGlobal('document', {
      createElement: () => ({ getContext: () => null }),
    });

    expect(detectWebGL2()).toBe(false);
  });

  test('detectWebGL2 returns false when float color extension is missing', () => {
    vi.stubGlobal('document', {
      createElement: () => ({
        getContext: () => ({ getExtension: () => null }),
      }),
    });

    expect(detectWebGL2()).toBe(false);
  });

  test('detectWebGL2 returns false when the canvas probe throws', () => {
    vi.stubGlobal('document', {
      createElement: () => {
        throw new Error('canvas disabled');
      },
    });

    expect(detectWebGL2()).toBe(false);
  });

  test('detectSaveData handles true, false, and missing Network Information API', () => {
    vi.stubGlobal('navigator', { connection: { saveData: true } });
    expect(detectSaveData()).toBe(true);

    vi.stubGlobal('navigator', { connection: { saveData: false } });
    expect(detectSaveData()).toBe(false);

    vi.stubGlobal('navigator', {});
    expect(detectSaveData()).toBe(false);
  });

  test('detectLowMemory handles constrained, capable, and missing deviceMemory', () => {
    vi.stubGlobal('navigator', { deviceMemory: 2 });
    expect(detectLowMemory()).toBe(true);

    vi.stubGlobal('navigator', { deviceMemory: 8 });
    expect(detectLowMemory()).toBe(false);

    vi.stubGlobal('navigator', {});
    expect(detectLowMemory()).toBe(false);
  });

  test('capability override feeds detection helpers and debug snapshot', () => {
    stubStorage();
    setLitePref('1');
    vi.stubGlobal('window', {
      __cyberskillCapabilityOverride: {
        deviceMemory: 2,
        saveData: true,
        webgl2: false,
      },
    });

    expect(detectWebGL2()).toBe(false);
    expect(detectSaveData()).toBe(true);
    expect(detectLowMemory()).toBe(true);
    expect(getCapabilityDebugSnapshot()).toEqual({
      deviceMemory: 2,
      litePref: '1',
      lowMemory: true,
      saveData: true,
      webgl2: false,
    });
  });

  test('lite preference storage round-trips and ignores invalid values', () => {
    stubStorage();

    expect(getLitePref()).toBeNull();
    setLitePref('1');
    expect(getLitePref()).toBe('1');
    setLitePref('0');
    expect(getLitePref()).toBe('0');
    localStorage.setItem('cyberskill_lite_pref', 'bad');
    expect(getLitePref()).toBeNull();
    clearLitePref();
    expect(getLitePref()).toBeNull();
  });

  test('lite preference storage tolerates storage failures', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
      removeItem: () => {
        throw new Error('blocked');
      },
    });

    expect(getLitePref()).toBeNull();
    expect(() => setLitePref('1')).not.toThrow();
    expect(() => clearLitePref()).not.toThrow();
  });
});
