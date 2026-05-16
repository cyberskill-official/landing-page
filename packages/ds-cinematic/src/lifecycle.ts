export type LifecycleStage = 'Experimental' | 'Stable' | 'Promoted' | 'Deprecated';

export const LIFECYCLE_STAGE: LifecycleStage = 'Experimental';

export const LIFECYCLE_RULES = {
  experimental_to_stable_min_days: 28,
  stable_to_promoted_min_days: 180,
  deprecation_sunset_days: 90,
  promoted_min_consumers: 2,
} as const;

const ALLOWED_TRANSITIONS: Record<LifecycleStage, LifecycleStage[]> = {
  Experimental: ['Stable'],
  Stable: ['Promoted', 'Deprecated'],
  Promoted: ['Deprecated'],
  Deprecated: [],
};

export function canTransition(
  from: LifecycleStage,
  to: LifecycleStage,
  daysInStage: number,
  consumerCount = 1,
): boolean {
  if (!ALLOWED_TRANSITIONS[from].includes(to)) return false;
  if (from === 'Experimental' && to === 'Stable') {
    return daysInStage >= LIFECYCLE_RULES.experimental_to_stable_min_days;
  }
  if (from === 'Stable' && to === 'Promoted') {
    return daysInStage >= LIFECYCLE_RULES.stable_to_promoted_min_days
        && consumerCount >= LIFECYCLE_RULES.promoted_min_consumers;
  }
  if (to === 'Deprecated') return true;
  return false;
}
