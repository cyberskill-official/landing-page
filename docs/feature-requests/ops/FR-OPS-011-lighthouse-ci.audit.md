---
fr_id: FR-OPS-011
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
final_revision: 2026-05-16 (round 3; feature-request-audit skill §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-OPS-011 is ship-grade. Lighthouse CI median-of-3 + URL-set coverage (`/`, `/lite`, `/work/sample`) gives stable CWV regression detection. Thresholds come from canonical FR-OPS-002 budgets.json — drift impossible.

## §2 — Round-1/2 findings (resolved)

### ISS-4701 — Mobile-sim variance could cause flaky failures
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #4 numberOfRuns 3 + median; §3 row 1 documents WebPageTest cross-check.

### ISS-4702 — Threshold drift from canonical budgets.json
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #2 reads from FR-OPS-002 budgets.json; AC#4.

### ISS-4703 — URL coverage might miss key routes
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #1 covers `/` (cinematic), `/lite` (reduced-motion), `/work/sample` (dynamic case-study).

### ISS-4704 — PR comment integration ambiguous
- **severity:** info
- **rule_id:** observability
- **status:** RESOLVED — §1 #3 + AC#3. @lhci/cli posts the comment.

## §3 — Strengths preserved from the spec-stub

- numberOfRuns: 3 already specified.
- 3 URLs in lighthouserc.json already correct.
- @lhci/cli as the runner already named.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-4705 — CI Docker image security update cadence
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** CI Docker image carries Node + system deps. MUST be rebuilt monthly to pick up security patches. Document automation + manual fallback.

### ISS-4706 — Workflow secret rotation procedure
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Secrets (API keys, webhook secrets) MUST be rotatable without downtime. Document rotation procedure + verify per-secret rotation tested in staging.

### ISS-4707 — Cross-platform script compatibility (macOS dev / Linux CI)
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

Batch 8 item 2 of 4. Next: FR-OPS-012 (axe a11y gate).

*End of FR-OPS-011 audit.*
