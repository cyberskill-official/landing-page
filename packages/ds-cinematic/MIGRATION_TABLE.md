# Cinematic Pack Migration Table — FR-DS-009

All token groups start at `Experimental` for P1. Advancement requires a sibling `FR-DS-NNN-lifecycle-advance-<component>.md` and the day-count / consumer-count gates in `src/lifecycle.ts`.

| Component / Token | Current stage | Entered stage | Next target | Consumer count | Notes |
|---|---|---|---|---:|---|
| package-skeleton | Experimental | 2026-05-17 | Stable after launch + 28 bug-clean days | 1 | FR-DS-003; package surface only |
| colors | Experimental | 2026-05-17 | Stable after launch + 28 bug-clean days | 1 | FR-DS-004; gold + brown ramps |
| accents | Experimental | 2026-05-17 | Stable after launch + 28 bug-clean days | 1 | FR-DS-005; Scene 5 / post-reveal only |
| motion | Experimental | 2026-05-17 | Stable after launch + 28 bug-clean days | 1 | FR-DS-006; duration + easing tokens |
| typography | Experimental | 2026-05-17 | Stable after launch + 28 bug-clean days | 1 | FR-DS-007; Inter Display + JetBrains Mono |
| glow | Experimental | 2026-05-17 | Stable after launch + 28 bug-clean days | 1 | FR-DS-008; three glow recipes |
| lifecycle | Experimental | 2026-05-17 | Stable after launch + 28 bug-clean days | 1 | FR-DS-009; governs this table |

## Advancement Rule

Experimental to Stable requires:

- at least 28 days in Experimental after launch;
- no open P0/P1 token bugs;
- passing package tests and typecheck;
- an explicit lifecycle-advance FR.

Stable to Promoted requires:

- at least 180 days in Stable;
- at least 2 active consumers;
- an explicit lifecycle-advance FR.

Deprecated requires:

- successor identified;
- 90-day sunset notice in this table and changelog.
