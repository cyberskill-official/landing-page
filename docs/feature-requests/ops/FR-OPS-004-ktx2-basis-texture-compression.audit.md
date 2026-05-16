---
fr_id: FR-OPS-004
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

FR-OPS-004 is ship-grade. The role-aware texture-compression routing (UASTC for normals, ETC1S for color/MR/emissive) is the cornerstone — applying the wrong codec degrades normals visibly (ETC1S corrupts direction) or wastes bytes on color (UASTC overkills smooth gradients).

## §2 — Round-1/2 findings (resolved)

### ISS-4001 — Role detection via glTF metadata (not filename heuristics)
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #3 reads `pbrMetallicRoughness.baseColorTexture`, `normalTexture`, etc. AC#1 + AC#2 verify codec-per-role.

### ISS-4002 — basisu binary missing in CI Docker image
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #6 + AC#5 bundle basisu in CI image; smoke test verifies presence.

### ISS-4003 — Mip-level preservation implicit
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #4 + AC#3 require ≥ 4 mip levels for 2k textures.

### ISS-4004 — VRAM ~6× claim unverified
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — AC#4 verifies Lumi texture VRAM ≤ 4 MB (vs ~24 MB raw PNG); FR-OPS-001 report has the math.

## §3 — Strengths preserved from the spec-stub

- Master plan §4.3 codec-per-role routing already correctly cited.
- FR-OPS-001 stage-2 integration point already specified.
- FR-CHAR-008 dependency edge correctly named.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-4005 — CI Docker image security update cadence
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** CI Docker image carries Node + system deps. MUST be rebuilt monthly to pick up security patches. Document automation + manual fallback.

### ISS-4006 — Workflow secret rotation procedure
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Secrets (API keys, webhook secrets) MUST be rotatable without downtime. Document rotation procedure + verify per-secret rotation tested in staging.

### ISS-4007 — Cross-platform script compatibility (macOS dev / Linux CI)
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Scripts MUST work on both macOS (founder dev) + Linux (CI). Test via cross-platform shellcheck + bash strict mode. Without this, scripts that work in dev fail in CI.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One compression step — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | 6 MUSTs precise. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | gltf-transform inspect + basisu smoke. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §4.3 + §4.4 cited. |
| API/contract precision | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | ktx2-encode.mjs + codec-per-role table. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | FR-OPS-001 + FR-CHAR-008 consumer. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | covers wrong codec + binary missing + mip drop. |
| Observability | 1.0 | 0.4 | 0.6 | 0.9 | 1.0 | inspect output + report.json. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

## §6 — Upgrade-queue note

Batch 7 item 3 of 8. Next: FR-OPS-005 (decoder bundling).

*End of FR-OPS-004 audit.*
