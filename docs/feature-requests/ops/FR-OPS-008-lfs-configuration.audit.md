---
fr_id: FR-OPS-008
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 7.0/10
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

FR-OPS-008 is ship-grade. The source-vs-derived distinction (LFS source-only; never LFS the .glb/.ktx2 output) is the governance anchor. Without it, build artifacts accumulate in LFS and the project balloons past free-tier limits.

## §2 — Round-1/2 findings (resolved)

### ISS-4401 — `.glb` / `.ktx2` could be LFS-tracked by accident (derived, not source)
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #3 + AC#2. Output files live in `assets-built/optimized/` which is `.gitignore`d.

### ISS-4402 — LFS smoke test missing
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — AC#3. Round-trip large .blend through push/checkout.

### ISS-4403 — Contributor onboarding step (`git lfs install`)
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 #4 + AC#4. README contributor section.

### ISS-4404 — HDRI environment maps not on initial pattern list
- **severity:** info
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #1 adds `.exr` + `.hdr`.

## §3 — Strengths preserved from the spec-stub

- LFS pattern list correctly enumerated.
- `.gitattributes` as the canonical config file.
- Master plan §11.2 reference correct.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-4405 — CI Docker image security update cadence
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** CI Docker image carries Node + system deps. MUST be rebuilt monthly to pick up security patches. Document automation + manual fallback.

### ISS-4406 — Workflow secret rotation procedure
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Secrets (API keys, webhook secrets) MUST be rotatable without downtime. Document rotation procedure + verify per-secret rotation tested in staging.

### ISS-4407 — Cross-platform script compatibility (macOS dev / Linux CI)
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

Batch 7 item 7 of 8. Next: FR-OPS-009 (source-asset manifest) — closes Batch 7.

*End of FR-OPS-008 audit.*
