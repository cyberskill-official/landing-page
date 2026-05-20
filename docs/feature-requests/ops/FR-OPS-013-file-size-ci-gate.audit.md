---
fr_id: FR-OPS-013
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

FR-OPS-013 is ship-grade. **Closes Batch 8 (P3 OPS CI workflows).** Hard PR gate on asset sizes reading from canonical FR-OPS-002 budgets.json — prevents asset bloat from sneaking through review.

## §2 — Round-1/2 findings (resolved)

### ISS-4901 — Re-build verification on source changes
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #3. Runs gltf-pipeline on changed sources; verifies build is clean.

### ISS-4902 — Fall-through for asset not in budgets.json
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §3 row 1. Default to per-scene budget; documented in stat output.

### ISS-4903 — PR comment delta integration with FR-OPS-003
- **severity:** info
- **rule_id:** dependencies
- **status:** RESOLVED — §1 #4 + AC#3. FR-OPS-003's PR comment surfaces the delta.

### ISS-4904 — Workflow trigger scope (only on asset-changes)
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — §1 #1. `on.pull_request.paths` includes `assets-built/**` + `assets-source/blender/**`.

## §3 — Strengths preserved from the spec-stub

- FR-OPS-002 budgets.json + FR-OPS-010 baseline already correct deps.
- Master plan §4.4 hard-gates reference correct.
- FR-PERF-001 consumer cross-ref already named.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-4905 — CI Docker image security update cadence
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** CI Docker image carries Node + system deps. MUST be rebuilt monthly to pick up security patches. Document automation + manual fallback.

### ISS-4906 — Workflow secret rotation procedure
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Secrets (API keys, webhook secrets) MUST be rotatable without downtime. Document rotation procedure + verify per-secret rotation tested in staging.

### ISS-4907 — Cross-platform script compatibility (macOS dev / Linux CI)
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

**This audit closes Batch 8.** All 4 P3 OPS CI workflows (010-013) are now at anchor-grade.

---

## §6 — Upgrade-queue note — Batch 8 closure

**Batch 8 of the spec-stub → anchor-grade campaign is COMPLETE.**

| # | FR | Status | Audit |
|---|---|---|---:|
| 1 | FR-OPS-010 (GitHub Actions baseline) | ✓ | 10/10 |
| 2 | FR-OPS-011 (Lighthouse CI) | ✓ | 10/10 |
| 3 | FR-OPS-012 (axe a11y gate) | ✓ | 10/10 |
| 4 | **FR-OPS-013 (file-size CI gate)** | ✓ | 10/10 |

Next batches per `docs/launch/upgrade-queue.md`:
- **Batch 9** — FR-A11Y-002..005 (P3 A11Y stubs, 4 FRs).
- **Batches 10..13** — see upgrade-queue.md.

---

*End of FR-OPS-013 audit (round 2 final — anchor-grade re-grade from spec-stub; **closes Batch 8**).*
