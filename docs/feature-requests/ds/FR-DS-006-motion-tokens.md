---
id: FR-DS-006
title: "Motion tokens — duration scale + easing curves (--ease-genie et al.) with reduced-motion honour"
module: DS
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P1
slice: 1
owner: Designer + Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-DS-003, FR-DS-004, FR-SCENE-009, FR-CHAR-011, FR-A11Y-001]
depends_on: [FR-DS-003]
blocks: [FR-SCENE-009, FR-SCENE-013, FR-SCENE-020]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.2 (Motion tokens — duration scale + easing curves)
  - docs/01-master-plan-v2.md §7.3 (Reduced motion handling — tokens MUST honour prefers-reduced-motion)

language: typescript 5.6 + css
service: packages/ds-cinematic/src/tokens/
new_files:
  - packages/ds-cinematic/src/tokens/motion.ts
  - packages/ds-cinematic/src/tokens/motion.css
  - packages/ds-cinematic/src/tokens/__tests__/motion.test.ts

effort_hours: 3
risk_if_skipped: "Without locked motion tokens, every R3F animation + DOM transition picks its own duration + easing. Lumi's signature ease-out-quint (the cinematic-genie feel from master plan §3.3a) gets diluted into framework defaults."
---

## §1 — Description (BCP-14 normative)

The `@cyberskill/ds-cinematic/tokens/motion` module **MUST** export a closed set of duration constants and easing curves, byte-identical to master plan §3.2.

1. **MUST** export 4 duration constants: `instant: 80`, `swift: 240`, `cinematic: 720`, `epic: 1400` (milliseconds).
2. **MUST** export 3 easing curves as `cubic-bezier` tuples + a CSS-formatted string:
   - `genie:  [0.22, 1, 0.36, 1]`     (out-quint — Lumi's signature)
   - `breath: [0.45, 0, 0.55, 1]`     (sin-like — idle loops)
   - `anchor: [0.65, 0, 0.35, 1]`     (scene snap)
3. **MUST** ship `motion.css` companion declaring `--duration-{instant,swift,cinematic,epic}` and `--ease-{genie,breath,anchor}` custom properties.
4. **MUST** include a `prefersReducedMotion(durationMs: number): number` helper that returns `0` (or 1ms, the minimum that still triggers `transitionend`) when `window.matchMedia('(prefers-reduced-motion: reduce)').matches` is true; else returns the duration unchanged. Per master plan §7.3.
5. **MUST** include a `cssEase(name: 'genie' | 'breath' | 'anchor'): string` helper returning `'cubic-bezier(0.22, 1, 0.36, 1)'`-style strings for use in JS-driven animation libraries (GSAP).
6. **MUST NOT** introduce additional durations or easings. New motion tokens require an FR-DS-NNN amendment.
7. **MUST** be SSR-safe: helpers MUST short-circuit on `typeof window === 'undefined'` without throwing.

---

## §2 — Why this design (rationale for humans)

**Why exactly 4 durations?** Master plan §3.2 enumerates them — they map to UX intent classes: micro-interaction (instant), standard transition (swift), camera move (cinematic), hero entry (epic). More durations = decision fatigue + visual incoherence.

**Why genie/breath/anchor names?** Each easing has a job. `genie` is Lumi's signature (the wisp-tail feel). `breath` is for idle loops (sine-like). `anchor` is for scene snap (S-curve). Naming by intent — not by curve shape — keeps the designer + dev conversation on the right level.

**Why `prefersReducedMotion` returns 0/1ms, not skipping?** The transition fires synchronously, so `transitionend` event listeners still fire — code paths that wait for transition completion don't deadlock. Master plan §7.3 mandates respect for the preference; this helper makes compliance automatic at consumer sites.

---

## §3 — Public surface

```ts
// packages/ds-cinematic/src/tokens/motion.ts
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

/** Honour prefers-reduced-motion (master plan §7.3, FR-A11Y-001). */
export function prefersReducedMotion(durationMs: number): number {
  if (typeof window === 'undefined') return durationMs;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 1 : durationMs;
}
```

```css
/* packages/ds-cinematic/src/tokens/motion.css */
:root {
  --duration-instant:   80ms;
  --duration-swift:    240ms;
  --duration-cinematic: 720ms;
  --duration-epic:    1400ms;

  --ease-genie:  cubic-bezier(0.22, 1, 0.36, 1);
  --ease-breath: cubic-bezier(0.45, 0, 0.55, 1);
  --ease-anchor: cubic-bezier(0.65, 0, 0.35, 1);
}

@media (prefers-reduced-motion: reduce) {
  :root {
    --duration-instant:   1ms;
    --duration-swift:     1ms;
    --duration-cinematic: 1ms;
    --duration-epic:      1ms;
  }
}
```

---

## §4 — Acceptance criteria

1. **motion.ts + motion.css present** — both files exist; typecheck clean.
2. **Duration values byte-identical to master plan** — `expect(duration).toEqual({instant:80, swift:240, cinematic:720, epic:1400})`.
3. **Easing curves byte-identical** — `expect(ease.genie).toEqual([0.22, 1, 0.36, 1])` and same for breath/anchor.
4. **cssEase returns canonical strings** — `expect(cssEase('genie')).toBe('cubic-bezier(0.22, 1, 0.36, 1)')`.
5. **prefersReducedMotion SSR-safe** — Vitest with `globalThis.window` undefined: function MUST return input unchanged, MUST NOT throw.
6. **prefersReducedMotion honours media query** — Vitest with mocked `window.matchMedia` returning `matches: true`: function MUST return 1.
7. **CSS @media block present** — `grep '@media (prefers-reduced-motion: reduce)' motion.css` MUST match.
8. **No additional tokens** — `grep -E '^\s*(instant|swift|cinematic|epic|genie|breath|anchor):' motion.ts | wc -l` MUST equal 7 (4 durations + 3 easings).

---

## §5 — Verification

```ts
// packages/ds-cinematic/src/tokens/__tests__/motion.test.ts
import { describe, expect, test, vi } from 'vitest';
import { duration, ease, cssEase, prefersReducedMotion } from '../motion';

describe('FR-DS-006 — motion tokens', () => {
  test('AC#2: durations match master plan §3.2', () => {
    expect(duration).toEqual({ instant: 80, swift: 240, cinematic: 720, epic: 1400 });
  });
  test('AC#3: easings match master plan §3.2', () => {
    expect(ease.genie).toEqual([0.22, 1, 0.36, 1]);
    expect(ease.breath).toEqual([0.45, 0, 0.55, 1]);
    expect(ease.anchor).toEqual([0.65, 0, 0.35, 1]);
  });
  test('AC#4: cssEase format', () => {
    expect(cssEase('genie')).toBe('cubic-bezier(0.22, 1, 0.36, 1)');
  });
  test('AC#5: SSR-safe', () => {
    const original = (globalThis as any).window;
    (globalThis as any).window = undefined;
    try { expect(prefersReducedMotion(720)).toBe(720); }
    finally { (globalThis as any).window = original; }
  });
  test('AC#6: reduced-motion clamps to 1', () => {
    (globalThis as any).window = { matchMedia: () => ({ matches: true }) };
    expect(prefersReducedMotion(720)).toBe(1);
  });
});
```

---

## §6 — Dependencies

- FR-DS-003 — Cinematic Pack package skeleton.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Easing curve typo (off by 0.01) | AC#3 diff | Restore from master plan §3.2 |
| CSS @media block missing | AC#7 grep | Re-add the reduced-motion override |
| prefersReducedMotion throws on SSR | AC#5 test | Guard with `typeof window === 'undefined'` |
| New easing added without amendment | AC#8 count | Reject; require FR-DS-NNN amendment |
| Hard-coded 700ms instead of `var(--duration-cinematic)` | Scene-FR audit | Replace with token reference; lint rule |
| GSAP consumer hand-types cubic-bezier | Code review | Use `cssEase('genie')` instead |

---

*End of FR-DS-006. Audit: `FR-DS-006-motion-tokens.audit.md`.*
