export const accent = {
  flag_red: '#DA251D',
  star_yellow: '#FFEB3B',
} as const satisfies Readonly<Record<string, `#${string}`>>;

export const SCOPED = true as const;
export type AccentToken = keyof typeof accent;
export type AllowedSceneForAccents = 'scene-5' | 'scene-6' | 'footer';

const ALLOWED: ReadonlySet<string> = new Set(['scene-5', 'scene-6', 'footer']);

export function assertSceneAllowsAccent(sceneId: string): asserts sceneId is AllowedSceneForAccents {
  if (!ALLOWED.has(sceneId)) {
    throw new Error(
      `[FR-DS-005] accent.* tokens MUST NOT be used in '${sceneId}'. ` +
      `Allowed scenes: ${[...ALLOWED].join(', ')}. See master plan §3.4.`,
    );
  }
}
