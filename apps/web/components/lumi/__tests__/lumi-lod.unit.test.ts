import { describe, expect, test } from 'vitest';
import {
  LUMI_LOD_DISTANCE,
  LUMI_LOD_SWAP_TO_GREYBOX_DISTANCE,
  LUMI_LOD_SWAP_TO_PRODUCTION_DISTANCE,
  isActiveLumiAnimation,
  resolveLumiLod,
} from '../LumiLod';

describe('FR-SCENE-023 Lumi LOD resolver', () => {
  test('uses the documented threshold with a one-meter hysteresis band', () => {
    expect(LUMI_LOD_DISTANCE).toBe(12);
    expect(LUMI_LOD_SWAP_TO_GREYBOX_DISTANCE - LUMI_LOD_SWAP_TO_PRODUCTION_DISTANCE).toBe(1);
  });

  test('swaps to greybox only past the high threshold and back below the low threshold', () => {
    expect(resolveLumiLod({ distance: 12.4, currentLod: 'production', isAnimating: false })).toBe('production');
    expect(resolveLumiLod({ distance: 12.6, currentLod: 'production', isAnimating: false })).toBe('greybox');
    expect(resolveLumiLod({ distance: 11.6, currentLod: 'greybox', isAnimating: false })).toBe('greybox');
    expect(resolveLumiLod({ distance: 11.4, currentLod: 'greybox', isAnimating: false })).toBe('production');
  });

  test('forces low detail for small fixed avatars and avoids swaps during visible animations', () => {
    expect(resolveLumiLod({ distance: 5, currentLod: 'production', isAnimating: false, forceLow: true })).toBe('greybox');
    expect(resolveLumiLod({ distance: 24, currentLod: 'production', isAnimating: true })).toBe('production');
    expect(isActiveLumiAnimation('wave_goodbye')).toBe(true);
    expect(isActiveLumiAnimation('idle')).toBe(false);
  });
});
