---
id: FR-DS-003
engineering_anchor: true
title: "@cyberskill/ds-cinematic package skeleton — workspace, exports, peer-dep on ds-foundations"
module: DS
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P1
milestone: P1 · slice 1
slice: 1
owner: Designer (Art Director) + Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
brain_chain_hash: null
related_frs: [FR-DS-001, FR-DS-002, FR-DS-004, FR-DS-005, FR-DS-006, FR-DS-007, FR-DS-008, FR-DS-009]
depends_on: [FR-DS-002]               # palette swatch + WCAG matrix must exist as canonical input
blocks:
  - FR-DS-004        # gold + brown CSS tokens
  - FR-DS-005        # flag accent tokens
  - FR-DS-006        # motion tokens
  - FR-DS-007        # typography pair
  - FR-DS-008        # glow recipes
  - FR-DS-009        # lifecycle marker
  - FR-WEB-001       # Next.js bootstrap consumes ds-cinematic

source_pages:
  - docs/01-master-plan-v2.md §3.1 (Relationship to the existing Design System)
  - docs/01-master-plan-v2.md §3.2 (Saigon Dusk palette)
  - docs/01-master-plan-v2.md §12.1 (Component lifecycle — marketing version)

source_decisions:
  - "v2 §3.1: extend ds-foundations, do NOT fork — non-replacing extension package"
  - "v2 §12.1: starts Experimental → graduates Stable post-launch + 4 weeks bug-clean"

# Build envelope
language: typescript 5.6
service: packages/ds-cinematic/
new_files:
  - packages/ds-cinematic/package.json
  - packages/ds-cinematic/tsconfig.json
  - packages/ds-cinematic/src/index.ts
  - packages/ds-cinematic/src/tokens/index.ts
  - packages/ds-cinematic/src/tokens/colors.ts
  - packages/ds-cinematic/src/tokens/motion.ts
  - packages/ds-cinematic/src/tokens/typography.ts
  - packages/ds-cinematic/src/tokens/glow.ts
  - packages/ds-cinematic/src/lifecycle.ts
  - packages/ds-cinematic/tests/exports.test.ts
  - packages/ds-cinematic/README.md
modified_files:
  - package.json                 # add workspace entry
  - pnpm-workspace.yaml          # or npm/yarn equivalent
allowed_tools:
  - file_read: packages/ds-foundations/**           # peer-dep introspection
  - file_write: packages/ds-cinematic/**
  - bash: pnpm install
  - bash: pnpm -F @cyberskill/ds-cinematic test
disallowed_tools:
  - copy any token verbatim from ds-foundations (must extend, not duplicate)
  - publish to npm registry (this is workspace-private until Promoted per §12.1)
  - introduce a runtime dependency (tokens-only package; tree-shake-friendly)

effort_hours: 6
sub_tasks:
  - "1h: pnpm workspace registration + package.json (sideEffects: false, exports field)"
  - "1h: tsconfig extends root with composite + emitDeclarationOnly"
  - "1h: src/tokens/index.ts barrel + stub exports per FR-DS-004..008"
  - "1h: src/lifecycle.ts — Experimental marker constant + CHANGELOG seed"
  - "1h: tests/exports.test.ts — assert every documented export is reachable"
  - "1h: README.md — usage + lifecycle stage + 'do not fork ds-foundations' note"

risk_if_skipped: |
  Without a published-but-private package skeleton, every consumer (Next.js app, Storybook docs site
  system.cyberskill.world, marketing case-study pages) ends up reaching into raw CSS variables or
  forking ds-foundations. Both paths violate master plan §3.1 governance. Skipping → 1-2 weeks of
  reorganisation in P3.
---

## §1 — Description (BCP-14 normative)

The `@cyberskill/ds-cinematic` package **MUST** be created as a workspace-private TypeScript package that *extends* `@cyberskill/ds-foundations` without forking or duplicating any of its tokens.

1. **MUST** be a `pnpm` (or `npm`/`yarn`) workspace member; package name MUST be exactly `@cyberskill/ds-cinematic`.
2. **MUST** declare `@cyberskill/ds-foundations` as a **peerDependency** with version `^1.0.0` (or whatever the current foundations version is at FR ship time). No `dependencies:` entry. No `bundledDependencies:`.
3. **MUST** set `"sideEffects": false` in `package.json` so consumers tree-shake unused tokens.
4. **MUST** expose the following barrel exports from `src/index.ts`:
   - `tokens/colors` — re-exports + extends gold/brown palette (defined in FR-DS-004)
   - `tokens/colors/accents` — Vietnamese-flag accents, scene-5-scoped (FR-DS-005)
   - `tokens/motion` — duration scale + easing curves (FR-DS-006)
   - `tokens/typography` — display + caption faces (FR-DS-007)
   - `tokens/glow` — rim / soft / scene-edge recipes (FR-DS-008)
   - `lifecycle` — current lifecycle stage marker (FR-DS-009)
5. **MUST** declare its initial lifecycle stage as `"Experimental"` (constant exported as `LIFECYCLE_STAGE` from `lifecycle.ts`). The constant graduates to `"Stable"` only via FR-DS-009 transitions, which require 4 weeks of bug-clean operation post-launch per master plan §12.1.
6. **MUST** be private to the monorepo (`"private": true` in `package.json`) and MUST NOT be published to a public registry. The "Promoted" stage in FR-DS-009 is the only path to publishing.
7. **MUST** ship a test (`tests/exports.test.ts`) that asserts the documented public surface compiles and is reachable. Stub tokens are acceptable for slice 1 — FR-DS-004…008 fill them in.
8. **MUST** include a README.md at the package root containing: package purpose (1 paragraph), lifecycle stage badge, "do not fork ds-foundations" governance note (cite master plan §3.1), and a single import example.
9. **SHOULD** ship a CHANGELOG.md seeded with a v0.0.1 entry timestamped today and a placeholder for v0.1.0 (the first time real tokens land via FR-DS-004).
10. **MUST NOT** introduce any runtime dependency. The package is tokens-only at slice 1; runtime components (Lumi shells, scene wrappers) land in slice 2.

This is the **package scaffolding** FR. It exists to open the workspace slot so FR-DS-004 through FR-DS-009 can land tokens into a real, testable, importable surface.

---

## §2 — Why this design (rationale for humans)

**Why a separate package, not folder inside ds-foundations?** Master plan §3.1 mandates the non-replacing extension pattern. A separate package lets the Cinematic Pack version independently, sunset cleanly (the deprecation lane in §12.1), and graduate selected primitives back into foundations without dragging marketing-only code into the product UI system.

**Why "Experimental" first?** Master plan §12.1 explicitly mandates this: marketing pack starts Experimental, no docs, no consumers outside this site. Stable lands 4 weeks bug-clean after launch. Promoted requires 6 months stable + 2 consumers. The Lifecycle Stage constant is the machine-enforceable form of that policy.

**Why peerDependency, not dependency?** A peerDep prevents the monorepo from accidentally shipping two copies of `ds-foundations` (one resolved by the app, one by Cinematic Pack). It also makes the version contract explicit: Cinematic Pack v0.x.x works with Foundations v1.x.x; bumping Foundations to v2 forces a coordinated Cinematic Pack release.

**Why `sideEffects: false`?** This is a hard prerequisite for tree-shaking in the 200 KB JS budget (master plan §6.1). Without it, importing a single colour token pulls in every other token. With it, each token is its own ESM symbol; the bundler discards everything unused.

---

## §3 — Public surface contract

### §3.1 `package.json` (excerpt)

```jsonc
{
  "name": "@cyberskill/ds-cinematic",
  "version": "0.0.1",
  "private": true,
  "sideEffects": false,
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    },
    "./tokens": {
      "types": "./dist/tokens/index.d.ts",
      "import": "./dist/tokens/index.js"
    },
    "./tokens/colors": {
      "types": "./dist/tokens/colors.d.ts",
      "import": "./dist/tokens/colors.js"
    },
    "./tokens/motion": { /* …same shape */ },
    "./tokens/typography": { /* … */ },
    "./tokens/glow": { /* … */ },
    "./lifecycle": { /* … */ }
  },
  "peerDependencies": {
    "@cyberskill/ds-foundations": "^1.0.0"
  },
  "devDependencies": {
    "typescript": "^5.6",
    "vitest": "^2"
  },
  "scripts": {
    "build": "tsc -b",
    "test": "vitest run",
    "typecheck": "tsc --noEmit"
  }
}
```

### §3.2 `src/index.ts` (barrel)

```ts
export * from './tokens';
export * from './lifecycle';
```

### §3.3 `src/tokens/index.ts` (sub-barrel)

```ts
export * as colors from './colors';
export * as motion from './motion';
export * as typography from './typography';
export * as glow from './glow';
```

### §3.4 `src/lifecycle.ts`

```ts
export type LifecycleStage = 'Experimental' | 'Stable' | 'Promoted' | 'Deprecated';

export const LIFECYCLE_STAGE: LifecycleStage = 'Experimental';

/**
 * Per master plan §12.1:
 *   Experimental → Stable: 4 weeks bug-clean post-launch
 *   Stable      → Promoted: 6 months stable + 2nd consumer
 *   Promoted    → Deprecated: 90-day sunset when successor lands
 * Transitions are governed by FR-DS-009.
 */
export const LIFECYCLE_RULES = {
  experimental_to_stable_min_days: 28,
  stable_to_promoted_min_days: 180,
  deprecation_sunset_days: 90,
} as const;
```

### §3.5 Token stubs (filled in by FR-DS-004…008)

```ts
// src/tokens/colors.ts — stub for slice 1
export const STUB = 'fill via FR-DS-004' as const;
```

Per-token files start as stubs; this FR only opens the surface. FR-DS-004 lands `gold` + `brown` ramps; FR-DS-005 lands `accent`; etc.

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **Workspace member** — `pnpm install` from the repo root (or npm/yarn equivalent) MUST resolve `@cyberskill/ds-cinematic` as a workspace package. `pnpm -F @cyberskill/ds-cinematic build` MUST succeed.
2. **Private flag** — `npm publish --dry-run` from `packages/ds-cinematic/` MUST fail with `EPRIVATE` (or equivalent registry-side rejection). The package is workspace-private.
3. **PeerDep declared, no dep** — `cat packages/ds-cinematic/package.json | jq '.dependencies'` MUST return `null`. `.peerDependencies` MUST contain `@cyberskill/ds-foundations`.
4. **sideEffects flag** — `cat packages/ds-cinematic/package.json | jq '.sideEffects'` MUST return `false`.
5. **Exports surface reachable** — The `tests/exports.test.ts` file MUST import every documented export path (`./tokens/colors`, `./tokens/motion`, `./tokens/typography`, `./tokens/glow`, `./lifecycle`) and assert they resolve to non-undefined values. Run via `pnpm -F @cyberskill/ds-cinematic test`. Test MUST pass.
6. **LIFECYCLE_STAGE** — `LIFECYCLE_STAGE` MUST be exactly the string literal `"Experimental"` at slice 1 ship. Asserted in `tests/exports.test.ts`.
7. **No runtime dependency** — `node -e "require('./packages/ds-cinematic/dist/index.js')"` MUST succeed with no missing-module errors. The package brings nothing into the runtime graph beyond peer-resolved ds-foundations symbols.
8. **README present** — `packages/ds-cinematic/README.md` MUST exist and contain: package purpose paragraph, current lifecycle stage, governance note linking master plan §3.1, one import example.
9. **CHANGELOG seeded** — `packages/ds-cinematic/CHANGELOG.md` MUST exist with a v0.0.1 entry dated within ±7 days of the FR ship date and a placeholder v0.1.0 entry for the first token landing.
10. **Typecheck clean** — `pnpm -F @cyberskill/ds-cinematic typecheck` MUST exit 0.

---

## §5 — Verification method

**Test (`verify: T`):**

```typescript
// packages/ds-cinematic/tests/exports.test.ts
import { describe, expect, test } from 'vitest';
import * as cinematic from '../src/index.js';
import * as tokens from '../src/tokens/index.js';
import { LIFECYCLE_STAGE, LIFECYCLE_RULES } from '../src/lifecycle.js';

describe('FR-DS-003 — Cinematic Pack package skeleton', () => {
  test('AC#5: documented exports are reachable', () => {
    expect(tokens.colors).toBeDefined();
    expect(tokens.motion).toBeDefined();
    expect(tokens.typography).toBeDefined();
    expect(tokens.glow).toBeDefined();
  });

  test('AC#6: lifecycle starts at Experimental', () => {
    expect(LIFECYCLE_STAGE).toBe('Experimental');
  });

  test('AC#6: lifecycle rules carry the §12.1 day-counts', () => {
    expect(LIFECYCLE_RULES.experimental_to_stable_min_days).toBe(28);
    expect(LIFECYCLE_RULES.stable_to_promoted_min_days).toBe(180);
    expect(LIFECYCLE_RULES.deprecation_sunset_days).toBe(90);
  });

  test('AC#1: barrel re-exports work', () => {
    expect(cinematic.colors).toBeDefined();
    expect(cinematic.motion).toBeDefined();
    expect(cinematic.LIFECYCLE_STAGE).toBe('Experimental');
  });
});
```

Run: `pnpm -F @cyberskill/ds-cinematic test`. CI gate: this test is in the `ds-cinematic` package; CI runs it on every PR touching `packages/ds-cinematic/**`. Failure blocks merge.

Plus a shell assertion (CI step or post-test hook):

```bash
# AC#2: must fail publish
cd packages/ds-cinematic && npm publish --dry-run 2>&1 | grep -qiE 'private|EPRIVATE'

# AC#3: no dependencies block
test "$(jq '.dependencies // {} | length' packages/ds-cinematic/package.json)" = "0"

# AC#4: sideEffects must be false
test "$(jq '.sideEffects' packages/ds-cinematic/package.json)" = "false"
```

---

## §6 — Implementation skeleton

```
packages/ds-cinematic/
├── package.json
├── tsconfig.json          (extends ../tsconfig.base.json, composite: true, emitDeclarationOnly: false)
├── README.md
├── CHANGELOG.md
├── src/
│   ├── index.ts
│   ├── tokens/
│   │   ├── index.ts
│   │   ├── colors.ts      (stub — FR-DS-004 lands real tokens)
│   │   ├── motion.ts      (stub — FR-DS-006)
│   │   ├── typography.ts  (stub — FR-DS-007)
│   │   └── glow.ts        (stub — FR-DS-008)
│   └── lifecycle.ts
└── tests/
    └── exports.test.ts
```

---

## §7 — Dependencies

**Code dependencies (must exist before this FR can build):**

- `@cyberskill/ds-foundations` v1.x.x in the workspace — already present (cite: master plan §3.1 says "the existing CyberSkill Design System").
- Workspace tool (pnpm / npm / yarn) configured at repo root.
- TypeScript ≥ 5.6, Vitest ≥ 2 in devDependencies of the workspace root.

**Concept dependencies:**

- `FR-DS-002` (palette swatch + WCAG matrix) — the locked palette this package will eventually expose. Must ship first because FR-DS-004 needs the exact hex values.

---

## §8 — Example consumer usage (forward-looking)

Once FR-DS-004 lands real tokens, an `apps/web` consumer imports:

```ts
import { colors, motion } from '@cyberskill/ds-cinematic';

const heroGold = colors.gold[400];        // '#E8B523'
const cinematicMs = motion.duration.cinematic;  // 720
```

CSS consumer:

```css
@import '@cyberskill/ds-cinematic/dist/tokens.css';

.hero { color: var(--brand-gold-400); transition: opacity var(--duration-cinematic) var(--ease-genie); }
```

Storybook consumer at `system.cyberskill.world`:

```ts
import { LIFECYCLE_STAGE } from '@cyberskill/ds-cinematic';

if (LIFECYCLE_STAGE === 'Experimental') {
  Storybook.addBadge('experimental', { tooltip: 'Marketing-only; not for product UI' });
}
```

---

## §9 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| `pnpm install` fails to resolve `@cyberskill/ds-cinematic` | CI `pnpm install` step | Fix workspace config in `pnpm-workspace.yaml`; verify package path |
| Test `tests/exports.test.ts` fails on missing export | CI test step | Fill the missing barrel re-export in `src/index.ts` |
| `npm publish` succeeds (private flag missing) | CI shell assertion fires | Add `"private": true` to `package.json`; re-run publish-dry |
| Bundler ships dead tokens despite `sideEffects: false` | Bundle-analyzer report shows unexpected size | Verify `sideEffects: false` propagates from package.json; check tsconfig `module: "ESNext"` |
| Two copies of `ds-foundations` resolved at runtime | `npm ls @cyberskill/ds-foundations` shows duplicates | Move ds-foundations to peerDependency (not dependency); re-install |
| Lifecycle stage advances accidentally | Vitest assertion `expect(LIFECYCLE_STAGE).toBe('Experimental')` fails on PR | Reject PR; only FR-DS-009 may transition the stage |
| TypeScript composite build chains fail | `pnpm -F @cyberskill/ds-cinematic build` reports project-reference error | Verify `tsconfig.json` has `references: [{ "path": "../ds-foundations" }]` |
| Test runner can't resolve `.js` extensions in TS imports | Vitest fails with ERR_MODULE_NOT_FOUND | Vitest config `resolve.alias` or use `tsx` for tests; recommended: NodeNext + `.js` extensions in imports |

---

## §10 — Notes

- Slice 1 is intentionally tokens-only. Runtime components (Lumi shells, scene wrappers, motion HOCs) land in slice 2 (FR-DS-010…015, TBD when slice 1 ships).
- The "do not fork ds-foundations" rule is enforced socially (README + audit gate) until we have a `tools/ds-fork-detector.py` lint. Future work.
- The CHANGELOG.md format follows Keep a Changelog 1.1.0 conventions; semver is enforced by `release-please` (TBD configuration in FR-OPS-010).

---

*End of FR-DS-003. Audit: `FR-DS-003-cinematic-pack-skeleton.audit.md`.*
