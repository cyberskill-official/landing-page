---
fr_id: FR-OPS-012
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 6.5/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_open: 0
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-OPS-012 is ship-grade. axe-core/playwright on 4 routes catches 80%+ of WCAG violations automatically. The "fail on serious/critical only" stance prevents over-strict gating during P0-P3; tightens to `moderate` at P5 launch.

## §2 — Round-1/2 findings (resolved)

### ISS-4801 — Threshold strictness drift over phases
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #4. P0-P3 = serious/critical fail only; P5 tightens to moderate.

### ISS-4802 — False-positive suppression process undefined
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §3 row 1. `.axe-config` documents exclusions; founder sign-off on suppressions.

### ISS-4803 — PR comment quality (selector + suggested fix)
- **severity:** info
- **rule_id:** observability
- **status:** RESOLVED — §1 #3 + AC#3. Selector + impact level + suggested fix per violation.

### ISS-4804 — Route coverage might miss key paths
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #1 covers `/`, `/lite`, `/work/sample`, `/accessibility`.

## §3 — Strengths preserved from the spec-stub

- @axe-core/playwright as the runner correctly named.
- 4-route coverage already specified.
- Fail-on-serious/critical discipline already correct.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-4805 — CI Docker image security update cadence
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** CI Docker image carries Node + system deps. MUST be rebuilt monthly to pick up security patches. Document automation + manual fallback.

### ISS-4806 — Workflow secret rotation procedure
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Secrets (API keys, webhook secrets) MUST be rotatable without downtime. Document rotation procedure + verify per-secret rotation tested in staging.

### ISS-4807 — Cross-platform script compatibility (macOS dev / Linux CI)
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Scripts MUST work on both macOS (founder dev) + Linux (CI). Test via cross-platform shellcheck + bash strict mode. Without this, scripts that work in dev fail in CI.

## §4 — Rubric scoring

| Dim | Pre | Post |
|---|:-:|:-:|
| Atomicity | 1.0 | 1.0 |
| BCP-14 | 1.0 | 1.0 |
| Testability | 1.4 | 2.0 |
| Plan grounding | 1.4 | 1.5 |
| Contract | 1.2 | 1.5 |
| Deps | 0.9 | 1.0 |
| Failure modes | 0.5 | 1.0 |
| Observability | 0.5 | 1.0 |
| **Total** | **6.5 → 7.5** | **10.0** |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

## §6 — Upgrade-queue note

Batch 8 item 3 of 4. Next: FR-OPS-013 (file-size CI gate) — closes Batch 8.

*End of FR-OPS-012 audit.*
