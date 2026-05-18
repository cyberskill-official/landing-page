import type { DeviceTier } from './device-tier';

export type ViewportTier = 'desktop' | 'tablet' | 'mobile';
export type PostFxMode = 'all' | 'bloom' | 'none';
export type DprRange = [number, number];

export const DPR_BY_TIER: Record<DeviceTier, DprRange> = {
  high: [1, 1.5],
  mid: [1, 1],
  low: [0.5, 0.75],
};

export const PARTICLE_COUNT_BY_TIER_VIEWPORT: Record<DeviceTier, Record<ViewportTier, number>> = {
  high: { desktop: 200, tablet: 100, mobile: 50 },
  mid: { desktop: 100, tablet: 50, mobile: 25 },
  low: { desktop: 50, tablet: 25, mobile: 0 },
};

export const BOKEH_COUNT_BY_TIER: Record<DeviceTier, number> = {
  high: 12,
  mid: 8,
  low: 4,
};

export const POST_FX_BY_TIER: Record<DeviceTier, PostFxMode> = {
  high: 'all',
  mid: 'bloom',
  low: 'none',
};

export function getViewportTier(width: number): ViewportTier {
  if (width < 640) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

export function getCanvasDprForTier(tier: DeviceTier): DprRange {
  return DPR_BY_TIER[tier];
}

export function getParticleCountForTierViewport(tier: DeviceTier, viewport: ViewportTier): number {
  return PARTICLE_COUNT_BY_TIER_VIEWPORT[tier][viewport];
}

export function getBokehCountForTier(tier: DeviceTier): number {
  return BOKEH_COUNT_BY_TIER[tier];
}

export function getPostFxModeForTier(tier: DeviceTier): PostFxMode {
  return POST_FX_BY_TIER[tier];
}
