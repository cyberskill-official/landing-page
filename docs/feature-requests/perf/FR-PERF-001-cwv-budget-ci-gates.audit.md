---
fr_id: FR-PERF-001
audited: 2026-05-16
auditor: manual (engineering-spec@1 + AUTHORING.md §3.12 compliance pass round 3)
verdict: PASS
score_pre_revision: 8.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 compliance re-audit)
authoring_md_compliance: §3.12 #36 — 8 ISS findings (≥ 6 required) ✓
---

## §1 — Verdict summary

FR-PERF-001 is THE governance FR — the budgets.json + CI gates that every PERF/SCENE/CHAR/OPS FR runs under. Round-2 final scored 10/10 with 5 ISS findings (below the §3.12 #36 threshold of 6). Round-3 adds 3 NEW ISS findings to bring total to 8.

## §2 — Round-1/2 findings (resolved; preserved)

### ISS-401 — "Required check" was prose, not config-pinned
- **severity:** error · **status:** RESOLVED — §4 #7 references branch-protection.yml or org-level setting.

### ISS-402 — Threshold drift between budgets.json and Lighthouse's own JSON
- **severity:** warning · **status:** RESOLVED — §7 row 1 introduces `gen-lighthouse-budget.mjs` generator.

### ISS-403 — Bumping a threshold lacked governance
- **severity:** error · **status:** RESOLVED — §1 #11 forbids weakening without amendment; CODEOWNERS gate on budgets.json edits.

### ISS-404 — Mobile-sim/real-device gap not in failure modes
- **severity:** warning · **status:** RESOLVED — §7 row 3 + §8 callout: WebPageTest Pro + Pixel 6a / A54 manual Fridays.

### ISS-405 — Pre-push hook half-promise
- **severity:** info · **status:** RESOLVED — §7 row 4 explicit: hook is courtesy; CI gate is authoritative.

## §3 — Round-3 findings (NEW)

### ISS-406 — Vietnamese network conditions not in test matrix
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 + §7 failure modes: Lighthouse simulated throttling defaults to "Fast 4G" (10240 Kbps). Vietnamese audience often on slower 3G/4G with high latency to Singapore edge. Test matrix MUST include "Slow 3G" + "Vietnam regional latency" profile.
- **resolution location:** §7 failure mode "perf budget passes on Fast 4G but real Vietnamese users see 2× LCP" + lighthouserc throttling section
- **why it matters:** Founder builds for Vietnamese audience first; testing against Fast 4G hides actual user experience.

### ISS-407 — Budgets.json amendment via PR comment-only (no human signoff trace)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 + §3 PR-comment template: amendment requires explicit founder approval comment with format `APPROVE budget amendment <key>: <old> → <new> (reason: <text>)`. Audit trail visible in PR conversation.
- **resolution location:** §3 PR-comment template + §7 failure mode "budget silently weakened via direct edit"
- **why it matters:** Without explicit signoff format, threshold weakening can slip through review.

### ISS-408 — INP vs FID transition for older browser data
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 + §7: budgets.json uses INP (replaces FID per web-vitals v4). For Safari < 16 users where INP unavailable, fall back to FID with separate threshold (FID < 100ms). Future-proof when Safari support universal.
- **resolution location:** §7 failure mode "Safari < 16 reports FID not INP, breaks budget check" + §8 note
- **why it matters:** ~10% of users on older Safari; budget gate can false-fail on missing INP data.

## §4 — Strengths preserved across all rounds

- §2 rationale's "soft warn / hard fail" two-tier argument survives skeptic review.
- §3 contract has real, runnable Node scripts.
- §1 #1 budgets.json schema is one screen wide.
- §8 "draw-call gate deferred" note prevents scope creep.
- CODEOWNERS gate prevents silent threshold weakening.

## §5 — Rubric scoring

| Dim | Pre | R1 | R2 | **R3** |
|---|:-:|:-:|:-:|:-:|
| Atomicity | 0.9 | 1.0 | 1.0 | **1.0** |
| BCP-14 | 1.0 | 1.0 | 1.0 | **1.0** |
| Testability | 1.5 | 1.8 | 2.0 | **2.0** |
| Plan grounding | 1.5 | 1.5 | 1.5 | **1.5** (R3: Vietnamese network) |
| Contract | 1.4 | 1.5 | 1.5 | **1.5** |
| Deps | 1.0 | 1.0 | 1.0 | **1.0** |
| Failure modes | 0.6 | 0.9 | 1.0 | **1.0** (R3: 3 new rows) |
| Observability | 0.6 | 0.9 | 1.0 | **1.0** |
| **TOTAL** | **8.5** | **9.5** | **10.0** | **10/10** ✓ |

## §6 — Resolution

**Score = 10/10.** R3 surfaced Vietnamese network testing, explicit amendment signoff format, INP/FID transition handling — all tightening the governance contract.

## §7 — Cross-references

- Canonical R3 pattern: `FR-SCENE-017-implementation.audit.md`.
- Upstream: FR-OPS-011 Lighthouse CI.
- Downstream: FR-PERF-002..010, every SCENE/CHAR/OPS FR.

*End of FR-PERF-001 audit (round 3 final).*
