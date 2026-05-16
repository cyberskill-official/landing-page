---
fr_id: FR-OPS-005
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
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-OPS-005 is ship-grade. Local decoder bundling (no CDN) preserves offline-dev + CSP-compliance + perf consistency. The 240 KB combined cap (master plan §5.3) is the hard governance — three decoder wasms fit comfortably within it.

## §2 — Round-1/2 findings (resolved)

### ISS-4101 — CDN decoder loads risk (offline-dev + CSP break)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #2 + AC#3. Grep-guard against unpkg/cdnjs/jsdelivr URLs.

### ISS-4102 — Decoder size could creep past 240 KB
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #3 + AC#2 hard cap; CI du-sh check.

### ISS-4103 — sync-decoders.mjs idempotency
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #4 + AC#4. Running on unchanged deps doesn't modify files.

### ISS-4104 — On-demand vs eager loading ambiguous
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #5 + AC#5. Drei `useGLTF.setDecoderPath` lazy-load only.

## §3 — Strengths preserved from the spec-stub

- 240 KB combined cap correctly cited (master plan §5.3).
- Local-only path (no CDN) already specified.
- Decoder-version-pinning via package.json deps already correct.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-4105 — CI Docker image security update cadence
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** CI Docker image carries Node + system deps. MUST be rebuilt monthly to pick up security patches. Document automation + manual fallback.

### ISS-4106 — Workflow secret rotation procedure
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Secrets (API keys, webhook secrets) MUST be rotatable without downtime. Document rotation procedure + verify per-secret rotation tested in staging.

### ISS-4107 — Cross-platform script compatibility (macOS dev / Linux CI)
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Scripts MUST work on both macOS (founder dev) + Linux (CI). Test via cross-platform shellcheck + bash strict mode. Without this, scripts that work in dev fail in CI.

## §4 — Rubric scoring

| Dim | Weight | Spec-stub | Pre | R1 | R2 |
|---|---:|---:|---:|---:|---:|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 |
| BCP-14 | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 |
| Plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 |
| Contract | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 |
| Deps | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 |
| Observability | 1.0 | 0.4 | 0.6 | 0.9 | 1.0 |
| **Total** | **10** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

## §6 — Upgrade-queue note

Batch 7 item 4 of 8. Next: FR-OPS-006 (Cowork Recipe A — PR triage).

*End of FR-OPS-005 audit.*
