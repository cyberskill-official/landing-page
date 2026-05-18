'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

export const NONLA_VARIANT_KEYS = ['tet', 'midautumn', 'sunset'] as const;
export type NonlaVariantKey = (typeof NONLA_VARIANT_KEYS)[number];
export type NonlaVariant = 'default' | NonlaVariantKey;

export const NONLA_VARIANT_STORAGE_KEY = 'cyberskill_nonla_variant';

export const NONLA_VARIANT_TEXTURES = {
  tet: 'assets-built/optimized/textures/lumi-nonla-tet.ktx2',
  midautumn: 'assets-built/optimized/textures/lumi-nonla-midautumn.ktx2',
  sunset: 'assets-built/optimized/textures/lumi-nonla-sunset.ktx2',
} as const satisfies Record<NonlaVariantKey, string>;

export function useNonlaVariant(storage: Storage | undefined = safeLocalStorage()) {
  const [variantIndex, setVariantIndex] = useState(0);

  useEffect(() => {
    const saved = storage?.getItem(NONLA_VARIANT_STORAGE_KEY);
    const parsed = Number.parseInt(saved ?? '', 10);
    if (Number.isInteger(parsed)) setVariantIndex(clampVariantIndex(parsed));
  }, [storage]);

  const currentVariant = useMemo(() => variantFromIndex(variantIndex), [variantIndex]);

  const cycleVariant = useCallback(() => {
    setVariantIndex((current) => {
      const next = nextVariantIndex(current);
      try {
        storage?.setItem(NONLA_VARIANT_STORAGE_KEY, String(next));
      } catch {
      }
      void lazyLoadVariantTexture(variantFromIndex(next));
      return next;
    });
  }, [storage]);

  return { currentVariant, cycleVariant, variantIndex };
}

export function nextVariantIndex(index: number): number {
  return (clampVariantIndex(index) + 1) % (NONLA_VARIANT_KEYS.length + 1);
}

export function variantFromIndex(index: number): NonlaVariant {
  const safeIndex = clampVariantIndex(index);
  if (safeIndex === 0) return 'default';
  return NONLA_VARIANT_KEYS[safeIndex - 1] ?? 'default';
}

export function texturePathForVariant(variant: NonlaVariant): string | null {
  if (variant === 'default') return null;
  return NONLA_VARIANT_TEXTURES[variant];
}

export async function lazyLoadVariantTexture(variant: NonlaVariant): Promise<string | null> {
  const texturePath = texturePathForVariant(variant);
  if (!texturePath) return null;
  return texturePath;
}

function clampVariantIndex(index: number): number {
  if (!Number.isFinite(index)) return 0;
  return Math.min(NONLA_VARIANT_KEYS.length, Math.max(0, Math.trunc(index)));
}

function safeLocalStorage(): Storage | undefined {
  if (typeof window === 'undefined') return undefined;
  try {
    return window.localStorage;
  } catch {
    return undefined;
  }
}
