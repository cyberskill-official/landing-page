/* @vitest-environment happy-dom */

import { act, renderHook } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import {
  NONLA_VARIANT_STORAGE_KEY,
  NONLA_VARIANT_TEXTURES,
  lazyLoadVariantTexture,
  nextVariantIndex,
  texturePathForVariant,
  useNonlaVariant,
  variantFromIndex,
} from '../NonlaEasterEgg';

describe('FR-SCENE-024 nón lá Easter egg', () => {
  test('cycles tet to midautumn to sunset and then default', () => {
    expect(variantFromIndex(0)).toBe('default');
    expect(variantFromIndex(nextVariantIndex(0))).toBe('tet');
    expect(variantFromIndex(nextVariantIndex(1))).toBe('midautumn');
    expect(variantFromIndex(nextVariantIndex(2))).toBe('sunset');
    expect(variantFromIndex(nextVariantIndex(3))).toBe('default');
  });

  test('persists progression in localStorage-compatible storage', () => {
    const writes: Record<string, string> = {};
    const storage = {
      getItem: vi.fn(() => '1'),
      setItem: vi.fn((key: string, value: string) => {
        writes[key] = value;
      }),
    } as unknown as Storage;
    const { result } = renderHook(() => useNonlaVariant(storage));

    expect(result.current.currentVariant).toBe('tet');
    act(() => result.current.cycleVariant());
    expect(writes[NONLA_VARIANT_STORAGE_KEY]).toBe('2');
    expect(result.current.currentVariant).toBe('midautumn');
  });

  test('lazy texture helper returns paths only after a non-default variant is requested', async () => {
    expect(texturePathForVariant('default')).toBeNull();
    expect(texturePathForVariant('tet')).toBe(NONLA_VARIANT_TEXTURES.tet);
    await expect(lazyLoadVariantTexture('sunset')).resolves.toBe(NONLA_VARIANT_TEXTURES.sunset);
  });
});
