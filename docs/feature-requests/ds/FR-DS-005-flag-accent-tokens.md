---
id: FR-DS-005
title: "Vietnamese-flag accent tokens — Scene-5-scoped via CSS cascade + TS runtime guard"
module: DS
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P1
slice: 1
owner: Designer + Frontend Lead
created: 2026-05-16
shipped: null
related_frs: [FR-DS-002, FR-DS-003, FR-DS-004, FR-CHAR-003, FR-CHAR-012, FR-SCENE-006, FR-SCENE-017]
depends_on: [FR-DS-003, FR-DS-002]
blocks: [FR-CHAR-012, FR-SCENE-006, FR-SCENE-017]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.2 (Vietnamese-flag accents — RESERVED for Scene 5 only)
  - docs/01-master-plan-v2.md §3.4 Scene 5 (only scene that uses --accent-flag-red + --accent-star-yellow)

language: typescript 5.6 + css
service: packages/ds-cinematic/src/tokens/
new_files:
  - packages/ds-cinematic/src/tokens/accents.ts
  - packages/ds-cinematic/src/tokens/accents.css
  - packages/ds-cinematic/src/tokens/__tests__/accents.test.ts
effort_hours: 2
risk_if_skipped: "Without scoped accent tokens, the flag colours leak across scenes; cultural framing breaks (master plan §3.4)."
---

## §1 — Description (BCP-14 normative)

The `@cyberskill/ds-cinematic/tokens/accents` module **MUST** export the Vietnamese-flag accent palette as **Scene-5-scoped** tokens with import-time guards against off-scene usage.

1. **MUST** export `accent.flag_red = '#DA251D'` and `accent.star_yellow = '#FFEB3B'` byte-identical to `palette-canonical.json`.
2. **MUST** ship `accents.css` declaring `--accent-flag-red` + `--accent-star-yellow` BUT **only** inside a `[data-scene="scene-5"]` selector (and any persistent post-Scene-5 selectors per master plan §3.3b: nón lá stays on through the footer, so `[data-scene-after="scene-5"]` is also legal).
3. **MUST** export a runtime guard `assertSceneAllowsAccent(sceneId: SceneId): void` that throws if `sceneId ∉ {'scene-5', 'scene-6', 'footer'}` — the post-Scene-5 scope per master plan §3.3b.
4. **MUST NOT** declare the flag tokens at `:root` level. The whole point of Scene-5-scoped is the cascade prevents leakage.
5. **MUST** ship a test asserting that `getComputedStyle(document.body).getPropertyValue('--accent-flag-red')` returns **empty** (no value) when `data-scene` is unset or in scenes 0-4.
6. **MUST** import-guard via TypeScript: the `accents` module exports a `SCOPED: true` const sentinel; tooling rejects imports from outside the documented allowed surfaces (the `lumi-nonla` mesh in FR-CHAR-012, the Scene 5 implementation in FR-SCENE-017, and the footer `lumi_corner_avatar` component).
7. **MUST** be reviewed alongside FR-CHAR-003 (cultural-note.md) — the cultural rationale is shared.

---

## §2 — Why this design

**Why scoped?** Master plan §3.2 + §3.4 are explicit: flag colours appear ONLY in Scene 5 entry through the footer. CSS-cascade scoping prevents a sibling scene's `<button color: var(--accent-flag-red)>` from rendering anywhere it shouldn't, even if a developer typos.

**Why the SceneId guard and SCOPED sentinel?** Defence in depth. CSS scope catches accidental visual leakage. The TS guard catches an explicit import from a wrong scene. CODEOWNERS catches the PR diff if both miss.

---

## §3 — Public surface

```ts
// accents.ts
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
      `Allowed scenes: ${[...ALLOWED].join(', ')}. ` +
      `See master plan §3.4.`,
    );
  }
}
```

```css
/* accents.css */
[data-scene="scene-5"],
[data-scene="scene-6"],
[data-scene="footer"] {
  --accent-flag-red:    #DA251D;
  --accent-star-yellow: #FFEB3B;
}
```

---

## §4 — Acceptance criteria

1. **Tokens present + byte-identical** — vs palette-canonical.json.
2. **CSS scope is selector-based, not :root** — `grep ':root' accents.css` MUST return 0.
3. **Scoped selectors present** — `grep -c '\[data-scene=' accents.css` MUST be ≥ 3.
4. **Guard throws for disallowed scenes** — Vitest: `assertSceneAllowsAccent('scene-0')` throws; `assertSceneAllowsAccent('scene-5')` does NOT throw.
5. **Bundle-side leak test** — In JSDOM, set `document.body.dataset.scene = 'scene-3'`; `getComputedStyle(body).getPropertyValue('--accent-flag-red')` MUST be empty. Set to `'scene-5'`; MUST equal `'#DA251D'`.
6. **No `var(--accent-flag-red)` in non-Scene-5 components** — `grep -r 'accent-flag-red\|accent-star-yellow' apps/web/components/` MUST only return hits in `apps/web/components/scenes/scene-5*` and `apps/web/components/footer/` (CI lint).

## §5 — Verification

Vitest: AC#4 + AC#5 (with JSDOM `<body data-scene>` attribute manipulation). Shell: AC#2 / #3 / #6 grep assertions.

## §6 — Dependencies

FR-DS-002 (canonical palette), FR-DS-003 (package skeleton).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| `:root` declaration smuggles tokens globally | AC#2 grep | Remove; use only data-scene selectors |
| A developer wraps an unrelated component in `data-scene="scene-5"` | Code review | Reject; data-scene is owned by the scene-orchestrator (FR-SCENE-020) |
| Footer doesn't get accent tokens (scope ends at scene-6) | Visual smoke during P4 | Verify `data-scene-after="scene-5"` OR add explicit `[data-scene="footer"]` selector |
| Tests pass with mocked data-scene but fail in real R3F mount | Manual smoke | Verify FR-SCENE-020's orchestrator sets `data-scene` on `<body>` correctly |

*End of FR-DS-005. Audit: companion file.*
