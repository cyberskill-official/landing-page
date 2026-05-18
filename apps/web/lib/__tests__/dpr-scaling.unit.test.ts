import { describe, expect, test } from 'vitest';
import {
  getBokehCountForTier,
  getCanvasDprForTier,
  getParticleCountForTierViewport,
  getPostFxModeForTier,
  getViewportTier,
} from '../dpr-scaling';
import { detectDeviceTier, tierFromCores, tierFromMemory, tierFromRenderer } from '../device-tier';

describe('FR-SCENE-022 DPR and device-tier scaling', () => {
  test('detects high, mid, and low tiers from explicit signals', () => {
    expect(detectDeviceTier({ cores: 12, memory: 16, renderer: 'ANGLE Metal Renderer: Apple M2 Pro' })).toBe('high');
    expect(detectDeviceTier({ cores: 6, memory: 4, renderer: 'ANGLE Intel Iris' })).toBe('mid');
    expect(detectDeviceTier({ cores: 2, memory: 2, renderer: 'SwiftShader' })).toBe('low');
    expect(detectDeviceTier({ cores: 12, lowMemoryMode: true, memory: 16, renderer: 'RTX 4090' })).toBe('low');
  });

  test('maps raw memory, core, and renderer signals conservatively', () => {
    expect(tierFromMemory(8)).toBe('high');
    expect(tierFromMemory(4)).toBe('mid');
    expect(tierFromMemory(2)).toBe('low');
    expect(tierFromCores(8)).toBe('high');
    expect(tierFromCores(4)).toBe('mid');
    expect(tierFromCores(2)).toBe('low');
    expect(tierFromRenderer('Adreno 730')).toBe('high');
    expect(tierFromRenderer('Adreno 640')).toBe('mid');
    expect(tierFromRenderer('SwiftShader')).toBe('low');
  });

  test('applies DPR, particle, bokeh, and post-fx tier maps', () => {
    expect(getCanvasDprForTier('high')).toEqual([1, 1.5]);
    expect(getCanvasDprForTier('mid')).toEqual([1, 1]);
    expect(getCanvasDprForTier('low')).toEqual([0.5, 0.75]);

    expect(getViewportTier(390)).toBe('mobile');
    expect(getViewportTier(768)).toBe('tablet');
    expect(getViewportTier(1280)).toBe('desktop');
    expect(getParticleCountForTierViewport('high', 'desktop')).toBe(200);
    expect(getParticleCountForTierViewport('mid', 'tablet')).toBe(50);
    expect(getParticleCountForTierViewport('low', 'mobile')).toBe(0);
    expect(getBokehCountForTier('high')).toBe(12);
    expect(getBokehCountForTier('low')).toBe(4);
    expect(getPostFxModeForTier('mid')).toBe('bloom');
  });
});
