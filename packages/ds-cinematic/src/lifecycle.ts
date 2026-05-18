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

export interface StageHistoryEntry {
  componentId: string;
  stage: LifecycleStage;
  enteredAt: string;
  nextTarget?: string;
  notes?: string;
  consumerCount?: number;
}

const STAGES: ReadonlySet<string> = new Set(['Experimental', 'Stable', 'Promoted', 'Deprecated']);

export function getStageHistory(componentId: string, tableMd: string): StageHistoryEntry[] {
  const rows: StageHistoryEntry[] = [];
  for (const line of tableMd.split('\n')) {
    if (!line.startsWith('| ')) continue;
    if (line.includes('|---')) continue;
    const cols = line.split('|').map((value) => value.trim());
    const id = cols[1];
    const stage = cols[2];
    const enteredAt = cols[3];
    const nextTarget = cols[4];
    const consumerCount = cols[5];
    const notes = cols[6];
    if (!id || id === 'Component / Token') continue;
    if (id !== componentId) continue;
    if (!stage || !STAGES.has(stage)) continue;
    rows.push({
      componentId: id,
      stage: stage as LifecycleStage,
      enteredAt: enteredAt ?? '',
      nextTarget: nextTarget || undefined,
      consumerCount: consumerCount ? Number(consumerCount) : undefined,
      notes: notes || undefined,
    });
  }
  return rows;
}

export const LIFECYCLE_BADGE_COLORS = {
  Experimental: { background: '#4A2208', foreground: '#F9D966', border: '#E8B523' },
  Stable: { background: '#2C1304', foreground: '#F9D966', border: '#F9D966' },
  Promoted: { background: '#E8B523', foreground: '#2C1304', border: '#FCEAA8' },
  Deprecated: { background: '#6E3A18', foreground: '#F4E5D6', border: '#DDB995' },
} as const satisfies Readonly<Record<LifecycleStage, {
  background: `#${string}`;
  foreground: `#${string}`;
  border: `#${string}`;
}>>;

export interface LifecycleBadgeProps {
  stage: LifecycleStage;
  label?: string;
}

export function LifecycleBadge({ stage, label = stage }: LifecycleBadgeProps): string {
  const color = LIFECYCLE_BADGE_COLORS[stage];
  return `<span data-lifecycle-stage="${stage}" style="display:inline-flex;align-items:center;border:1px solid ${color.border};border-radius:999px;background:${color.background};color:${color.foreground};font:600 12px/1 system-ui,sans-serif;padding:4px 8px;">${escapeHtml(label)}</span>`;
}

function escapeHtml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}
