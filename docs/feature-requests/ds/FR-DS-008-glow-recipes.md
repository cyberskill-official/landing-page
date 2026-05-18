---
id: FR-DS-008
title: "Glow recipes — rim / soft / scene-edge token set"
module: DS
priority: SHOULD
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P1
slice: 1
owner: Designer + Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-DS-002, FR-DS-003, FR-DS-004, FR-SCENE-009, FR-CHAR-008, FR-WEB-006]
depends_on: [FR-DS-003]
blocks: [FR-SCENE-009, FR-CHAR-008, FR-WEB-006]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.2 (Glow recipes — genie rim, soft, scene-edge)

language: typescript 5.6 + css
service: packages/ds-cinematic/src/tokens/
new_files:
  - packages/ds-cinematic/src/tokens/glow.ts
  - packages/ds-cinematic/src/tokens/glow.css
  - packages/ds-cinematic/src/tokens/__tests__/glow.test.ts
effort_hours: 3
risk_if_skipped: "Without locked glow recipes, every scene reinvents Lumi's rim-light + spotlight intensity in isolation; the genie's signature glow drifts visually scene-to-scene."
---

## §1 — Description (BCP-14 normative)

The `@cyberskill/ds-cinematic/tokens/glow` module **MUST** export 3 glow recipes as rgba strings + box-shadow / filter helper functions, byte-identical to master plan §3.2.

1. **MUST** export 3 rgba constants:
   - `genie_rim: 'rgba(255, 196, 64, 0.85)'`   (Lumi's primary rim glow)
   - `genie_soft: 'rgba(232, 181, 35, 0.45)'`  (subtle ambient halo)
   - `scene_edge: 'rgba(232, 181, 35, 0.15)'`  (per-scene edge vignette)
2. **MUST** ship `glow.css` declaring `--glow-genie-rim`, `--glow-genie-soft`, `--glow-scene-edge` at `:root`.
3. **MUST** export 2 helper functions:
   - `boxShadowGlow(token: GlowToken, blur = 16, spread = 0): string` — returns `'0 0 <blur>px <spread>px <rgba>'` for use in `box-shadow`.
   - `filterDropShadow(token: GlowToken, blur = 8): string` — returns `'drop-shadow(0 0 <blur>px <rgba>)'` for use in `filter`.
4. **MUST NOT** include any additional glow recipes. Master plan §3.2 specifies exactly three. New recipes require an FR-DS-NNN amendment.
5. **MUST** be SSR-safe — helpers do not touch `window` / `document`.
6. **SHOULD** export a Three.js / R3F adapter `glowAsThreeColor(token: GlowToken): { color: string, intensity: number }` that splits the rgba into a color + opacity-as-intensity pair (R3F materials prefer separate channels).

---

## §2 — Why this design

**Why locked at 3?** Master plan §3.2 enumerates exactly 3 recipes; each has a job. `genie_rim` reads at all distances (Lumi's signature). `genie_soft` reads close-up only (ambient halo around the wisp). `scene_edge` reads at viewport edges (vignette).

**Why helpers?** Consumers compose differently. DOM consumers want `box-shadow` or `filter`. R3F consumers want a `<directionalLight color intensity>` pair. The helpers hide the format conversion without leaking the raw rgba everywhere.

---

## §3 — Public surface

```ts
// glow.ts
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
  const [, r, g, b, a] = m;
  const toHex = (n: string) => Number(n).toString(16).padStart(2, '0');
  return { color: `#${toHex(r)}${toHex(g)}${toHex(b)}`, intensity: Number(a) };
}
```

```css
/* glow.css */
:root {
  --glow-genie-rim:  rgba(255, 196, 64, 0.85);
  --glow-genie-soft: rgba(232, 181, 35, 0.45);
  --glow-scene-edge: rgba(232, 181, 35, 0.15);
}
```

---

## §4 — Acceptance criteria

1. **3 glow recipes byte-identical to master plan §3.2** — Vitest equality.
2. **Helpers return well-formed CSS strings** — `boxShadowGlow('genie_rim')` returns `'0 0 16px 0px rgba(255, 196, 64, 0.85)'`.
3. **`glowAsThreeColor` splits correctly** — `glowAsThreeColor('genie_rim')` returns `{ color: '#ffc440', intensity: 0.85 }`.
4. **No additional recipes** — `Object.keys(glow).length === 3` Vitest assertion.
5. **CSS declares all three** — `grep -c '^\s*--glow-' glow.css` MUST equal 3.
6. **SSR-safe** — Vitest with `globalThis.window` undefined: all helpers run without throwing.

## §5 — Verification

```ts
import { glow, boxShadowGlow, filterDropShadow, glowAsThreeColor } from '../glow';
test('AC#1: rgba strings match plan §3.2', () => {
  expect(glow.genie_rim).toBe('rgba(255, 196, 64, 0.85)');
  expect(glow.genie_soft).toBe('rgba(232, 181, 35, 0.45)');
  expect(glow.scene_edge).toBe('rgba(232, 181, 35, 0.15)');
});
test('AC#2: box-shadow helper', () => {
  expect(boxShadowGlow('genie_rim')).toBe('0 0 16px 0px rgba(255, 196, 64, 0.85)');
  expect(boxShadowGlow('genie_soft', 24, 2)).toBe('0 0 24px 2px rgba(232, 181, 35, 0.45)');
});
test('AC#3: three-color adapter', () => {
  const r = glowAsThreeColor('genie_rim');
  expect(r).toEqual({ color: '#ffc440', intensity: 0.85 });
});
test('AC#4: closed set of 3', () => {
  expect(Object.keys(glow)).toHaveLength(3);
});
```

## §6 — Dependencies

FR-DS-003 (package skeleton).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Wrong rgba precision (e.g. 0.84 vs 0.85) | AC#1 fail | Restore from master plan §3.2 |
| Additional recipe added in PR | AC#4 fail | Reject; require FR-DS-NNN amendment |
| `glowAsThreeColor` hex casing inconsistency | AC#3 fail | Always lowercase via `.toString(16)` |
| Helper called with invalid token (TS bypassed at runtime) | Throw | Throw early with FR-DS-008 prefix for easy grep |

*End of FR-DS-008.*
