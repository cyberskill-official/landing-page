import { getCanvasDprForTier, getParticleCountForTierViewport, getViewportTier } from '@/lib/dpr-scaling';
import type { DeviceTier } from '@/lib/device-tier';

export const DUST_COUNT_BY_TIER = {
  desktop: 200,
  tablet: 100,
  mobile: 50,
} as const;

export type DustViewportTier = keyof typeof DUST_COUNT_BY_TIER;

declare global {
  interface Window {
    __scene0DustState?: {
      count: number;
      drawCalls: number;
      dpr: number;
      token: '--glow-genie-soft';
    };
  }
}

export function getDustViewportTier(width: number): DustViewportTier {
  return getViewportTier(width);
}

export function getDustParticleCount(width: number, lowMemoryMode: boolean, deviceTier: DeviceTier = 'high'): number {
  const tier = lowMemoryMode ? 'low' : deviceTier;
  return getParticleCountForTierViewport(tier, getDustViewportTier(width));
}

export function getDustDpr(deviceTier: DeviceTier = 'high'): number {
  const [, max] = getCanvasDprForTier(deviceTier);
  if (typeof window === 'undefined') return Math.min(1, max);
  return Math.min(max, window.devicePixelRatio || 1);
}

export function getInitialDustViewportWidth(): number {
  if (typeof window === 'undefined') return 1024;
  return window.innerWidth;
}
