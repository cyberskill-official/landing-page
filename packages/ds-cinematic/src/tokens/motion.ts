export const duration = {
  instant: 80,
  swift: 240,
  cinematic: 720,
  epic: 1400,
} as const satisfies Readonly<Record<string, number>>;

export type DurationToken = keyof typeof duration;

export const ease = {
  genie:  [0.22, 1,   0.36, 1] as const,
  breath: [0.45, 0,   0.55, 1] as const,
  anchor: [0.65, 0,   0.35, 1] as const,
} as const;

export type EaseToken = keyof typeof ease;

export function cssEase(name: EaseToken): string {
  const [a, b, c, d] = ease[name];
  return `cubic-bezier(${a}, ${b}, ${c}, ${d})`;
}

export function prefersReducedMotion(durationMs: number): number {
  if (typeof window === 'undefined') return durationMs;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : durationMs;
}
