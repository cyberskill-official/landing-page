---
id: FR-DS-009
title: "Component lifecycle marker — Experimental → Stable migration table for Cinematic Pack"
module: DS
priority: MUST
status: done
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: T
phase: P1
slice: 1
owner: Designer + Frontend Lead
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-DS-003, FR-DS-004, FR-DS-005, FR-DS-006, FR-DS-007, FR-DS-008]
depends_on: [FR-DS-003]
blocks: []
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §3.1 (Component lifecycle governance)
  - docs/01-master-plan-v2.md §12.1 (Component lifecycle — marketing version)

language: typescript 5.6 + markdown
service: packages/ds-cinematic/src/lifecycle.ts + .md docs
new_files:
  - packages/ds-cinematic/src/lifecycle.ts            # already exists from FR-DS-003 stub; this FR fills it
  - packages/ds-cinematic/MIGRATION_TABLE.md
  - packages/ds-cinematic/src/__tests__/lifecycle.test.ts

effort_hours: 2
risk_if_skipped: "Without a machine-checkable lifecycle marker, components silently graduate from Experimental → Stable without the 4-week bug-clean discipline. Defeats master plan §12.1."
---

## §1 — Description (BCP-14 normative)

The `@cyberskill/ds-cinematic/lifecycle` module **MUST** export a typed lifecycle-stage marker + a migration table documenting per-component stage transitions.

1. **MUST** export `LIFECYCLE_STAGE: 'Experimental' | 'Stable' | 'Promoted' | 'Deprecated'` as a const string. Initial value at P1 slice 1 ship: `'Experimental'` (matches FR-DS-003).
2. **MUST** export `LIFECYCLE_RULES` constant with the day-count thresholds per master plan §12.1:
   - `experimental_to_stable_min_days: 28` (4 weeks bug-clean)
   - `stable_to_promoted_min_days: 180` (6 months stable + 2nd consumer)
   - `deprecation_sunset_days: 90` (90-day sunset)
3. **MUST** export `canTransition(from, to, daysInStage, consumerCount?)` predicate that returns `true | false` based on the rules. Used by CI to gate stage advances.
4. **MUST** ship `MIGRATION_TABLE.md` at the package root listing every component / token group with its current stage, entry date, and (where applicable) next-stage target date. Format:

```markdown
| Component / Token | Current stage | Entered stage | Next target | Notes |
|---|---|---|---|---|
| colors (FR-DS-004) | Experimental | 2026-05-NN | Stable @ 2026-06-NN+ | 4-week bug-clean from launch |
| motion (FR-DS-006) | Experimental | 2026-05-NN | Stable @ 2026-06-NN+ | |
| ...
```

5. **MUST** include a `getStageHistory(componentId)` helper that reads MIGRATION_TABLE.md and returns the structured history. Used by Storybook docs + the system.cyberskill.world site (FR-OPS-NNN later).
6. **MUST NOT** allow `LIFECYCLE_STAGE` to advance without an explicit FR amendment (`FR-DS-NNN-lifecycle-advance-<component>`). Asserted by CODEOWNERS gate on the file.
7. **MUST** ship a Storybook-friendly `<LifecycleBadge stage={LIFECYCLE_STAGE}>` export that renders the stage as a coloured pill — used in component docs to make stage visible at-a-glance.
8. **SHOULD** track `consumer_count` on a per-component basis (manually maintained for now; `tools/count-consumers.sh` later) so `Promoted` transitions can verify the "2nd consumer" rule.

---

## §2 — Why this design (rationale for humans)

**Why machine-checkable?** Master plan §12.1 lays out a clean four-stage lifecycle (Experimental → Stable → Promoted → Deprecated) with explicit transition criteria. Without a `canTransition()` predicate, a designer "graduates" a token to Stable a week after Experimental ships because the bug count is low — bypassing the 4-week discipline that catches slow-burn bugs. The predicate makes the rule enforceable.

**Why a markdown migration table, not a JSON?** Two consumers. (1) Humans reading PRs need to glance and understand. (2) The `getStageHistory` parser handles the markdown → structured form. JSON would force humans into a worse reading experience for ~zero machine benefit.

**Why FR-amendment for stage advance?** The amendment forces a PR diff that reviewers can engage with. "Move X from Experimental to Stable" requires an FR-DS-NNN-lifecycle-advance-X — that FR's audit asks: did 4 weeks pass? Were there bug reports? Has the test suite proven stable under coverage? Without that gate, advancement is mood-driven.

---

## §3 — Public surface

```ts
// packages/ds-cinematic/src/lifecycle.ts
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
  if (to === 'Deprecated') return true;   // deprecation can happen anytime
  return false;
}

export interface StageHistoryEntry {
  componentId: string;
  stage: LifecycleStage;
  enteredAt: string;
  nextTarget?: string;
  notes?: string;
}

export function getStageHistory(componentId: string, tableMd: string): StageHistoryEntry[] {
  const rows: StageHistoryEntry[] = [];
  for (const line of tableMd.split('\n')) {
    if (!line.startsWith('| ')) continue;
    const cols = line.split('|').map(s => s.trim());
    if (cols.length < 5) continue;
    const [, id, stage, entered, next, notes] = cols;
    if (id !== componentId) continue;
    rows.push({
      componentId: id,
      stage: stage as LifecycleStage,
      enteredAt: entered,
      nextTarget: next || undefined,
      notes: notes || undefined,
    });
  }
  return rows;
}
```

---

## §4 — Acceptance criteria

1. **LIFECYCLE_STAGE exports Experimental at slice-1 ship** — Vitest assertion.
2. **LIFECYCLE_RULES values match master plan §12.1** — `expect(LIFECYCLE_RULES).toMatchObject({ experimental_to_stable_min_days: 28, stable_to_promoted_min_days: 180, deprecation_sunset_days: 90 })`.
3. **canTransition gating** — Vitest property test: `canTransition('Experimental', 'Stable', 27)` → false; `canTransition('Experimental', 'Stable', 28)` → true; `canTransition('Stable', 'Promoted', 200, 1)` → false (only 1 consumer); `canTransition('Stable', 'Promoted', 200, 2)` → true.
4. **Skip-step transitions forbidden** — `canTransition('Experimental', 'Promoted', 999, 99)` MUST return false (must go through Stable).
5. **MIGRATION_TABLE.md present + parseable** — File exists; `getStageHistory('colors')` returns at least one entry.
6. **Stage advance requires amendment FR** — CODEOWNERS gate on `packages/ds-cinematic/src/lifecycle.ts` → founder review. PR changing `LIFECYCLE_STAGE` without a sibling `FR-DS-NNN-lifecycle-advance-*.md` MUST be rejected at review.
7. **LifecycleBadge component renders stage** — Optional: Storybook story present (deferred to FR-DS-NNN if Storybook not yet stood up).

---

## §5 — Verification

```ts
// packages/ds-cinematic/src/__tests__/lifecycle.test.ts
import { describe, expect, test } from 'vitest';
import { LIFECYCLE_STAGE, LIFECYCLE_RULES, canTransition, getStageHistory } from '../lifecycle';
import { readFileSync } from 'node:fs';

describe('FR-DS-009 — lifecycle marker', () => {
  test('AC#1: stage starts at Experimental', () => {
    expect(LIFECYCLE_STAGE).toBe('Experimental');
  });
  test('AC#2: rules match master plan', () => {
    expect(LIFECYCLE_RULES.experimental_to_stable_min_days).toBe(28);
    expect(LIFECYCLE_RULES.stable_to_promoted_min_days).toBe(180);
    expect(LIFECYCLE_RULES.deprecation_sunset_days).toBe(90);
  });
  test('AC#3: canTransition gating', () => {
    expect(canTransition('Experimental', 'Stable', 27)).toBe(false);
    expect(canTransition('Experimental', 'Stable', 28)).toBe(true);
    expect(canTransition('Stable', 'Promoted', 200, 1)).toBe(false);
    expect(canTransition('Stable', 'Promoted', 200, 2)).toBe(true);
  });
  test('AC#4: skip-step forbidden', () => {
    expect(canTransition('Experimental', 'Promoted', 999, 99)).toBe(false);
  });
  test('AC#5: migration table parseable', () => {
    const md = readFileSync(new URL('../../MIGRATION_TABLE.md', import.meta.url), 'utf8');
    const hist = getStageHistory('colors', md);
    expect(hist.length).toBeGreaterThanOrEqual(1);
  });
});
```

---

## §6 — Dependencies

- FR-DS-003 — package skeleton already declared `LIFECYCLE_STAGE: 'Experimental'`; this FR fills the rules + helpers + migration table.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| LIFECYCLE_STAGE advanced without amendment FR | CODEOWNERS gate + manual review | Reject PR; require FR-DS-NNN-lifecycle-advance-<component> |
| canTransition allows skip-step | AC#4 test | Restore explicit allowed-transitions table |
| Migration table format drifts (parser breaks) | AC#5 test fails | Tighten parser OR pin the format with linter |
| Storybook badge missing on a component | Visual regression in docs site | Add `<LifecycleBadge>` in the story; this FR's responsibility limited to the export |
| consumer_count drifts (no real tracker) | Manual review | `tools/count-consumers.sh` future FR; until then, founder verifies at advancement-FR audit |

---

*End of FR-DS-009. Audit: `FR-DS-009-component-lifecycle-marker.audit.md`.*
