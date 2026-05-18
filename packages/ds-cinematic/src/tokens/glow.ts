export const glow = {
  genie_rim:  'rgba(255, 196, 64, 0.85)',
  genie_soft: 'rgba(232, 181, 35, 0.45)',
  scene_edge: 'rgba(232, 181, 35, 0.15)',
} as const;

export type GlowToken = keyof typeof glow;

export function boxShadowGlow(token: GlowToken, blur = 16, spread = 0): string {
  return `0 0 ${blur}px ${spread}px ${glow[token]}`;
}

export function filterDropShadow(token: GlowToken, blur = 8): string {
  return `drop-shadow(0 0 ${blur}px ${glow[token]})`;
}

export function glowAsThreeColor(token: GlowToken): { color: string; intensity: number } {
  const m = glow[token].match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
  if (!m) throw new Error(`[FR-DS-008] cannot parse ${token}: ${glow[token]}`);
  const r = m[1];
  const g = m[2];
  const b = m[3];
  const a = m[4];
  if (!r || !g || !b || !a) throw new Error(`[FR-DS-008] incomplete rgba match for ${token}`);
  const toHex = (n: string) => Number(n).toString(16).padStart(2, '0');
  return { color: `#${toHex(r)}${toHex(g)}${toHex(b)}`, intensity: Number(a) };
}
