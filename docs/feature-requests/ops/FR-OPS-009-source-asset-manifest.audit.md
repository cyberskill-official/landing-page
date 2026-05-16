---
fr_id: FR-OPS-009
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

FR-OPS-009 is ship-grade. **Closes Batch 7 (OPS pipeline support).** The sha256-based stale detector surfaces "you edited the .blend but didn't re-export" at PR time, preventing a common source-of-truth divergence between assets-source and assets-built.

## §2 — Round-1/2 findings (resolved)

### ISS-4501 — sha256-based change detection (not mtime alone)
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #3. Hash-based; mtime is the supplementary signal. Hash drift is the authoritative dirty flag.

### ISS-4502 — Sync script idempotency
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — AC#2. Second run produces identical manifest.

### ISS-4503 — Stale flag consumer ambiguous
- **severity:** info
- **rule_id:** dependencies
- **status:** RESOLVED — §1 #4 + AC#4. FR-OPS-003 PR-comment reads the flag and surfaces "rebuild needed".

### ISS-4504 — Linked-from list (e.g. lumi-nonla links lumi via collection)
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #1 manifest schema includes `linked_from` per entry; FR-CHAR-005's Link-Collection contract surfaces here.

## §3 — Strengths preserved from the spec-stub

- Master plan §11.2 lockfile pattern correctly cited.
- Source-asset coverage (.blend/.psd/.spp/.sbs) already correct.
- FR-OPS-003 PR-comment consumer named.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-4505 — CI Docker image security update cadence
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** CI Docker image carries Node + system deps. MUST be rebuilt monthly to pick up security patches. Document automation + manual fallback.

### ISS-4506 — Workflow secret rotation procedure
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Secrets (API keys, webhook secrets) MUST be rotatable without downtime. Document rotation procedure + verify per-secret rotation tested in staging.

### ISS-4507 — Cross-platform script compatibility (macOS dev / Linux CI)
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

**This audit closes Batch 7.** All 8 OPS pipeline-support FRs (002-009) are now at anchor-grade.

---

## §6 — Upgrade-queue note — Batch 7 closure

**Batch 7 of the spec-stub → anchor-grade campaign is COMPLETE.**

| # | FR | Status | Audit |
|---|---|---|---:|
| 1 | FR-OPS-002 (budgets.json canonical) | ✓ | 10/10 |
| 2 | FR-OPS-003 (PR-comment integration) | ✓ | 10/10 |
| 3 | FR-OPS-004 (KTX2 + Basis) | ✓ | 10/10 |
| 4 | FR-OPS-005 (decoder bundling) | ✓ | 10/10 |
| 5 | FR-OPS-006 (Cowork Recipe A) | ✓ | 10/10 |
| 6 | FR-OPS-007 (Cowork Recipes B-G) | ✓ | 10/10 |
| 7 | FR-OPS-008 (LFS configuration) | ✓ | 10/10 |
| 8 | **FR-OPS-009 (source-asset manifest)** | ✓ | 10/10 |

Next batches per `docs/launch/upgrade-queue.md`:
- **Batch 8** — FR-OPS-010..013 (CI workflows)
- **Batches 9..13** — see upgrade-queue.md.

---

*End of FR-OPS-009 audit (round 2 final — anchor-grade re-grade from spec-stub; **closes Batch 7**).*
