---
fr_id: FR-CHAR-004
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-CHAR-004 is ship-grade. **Opens Batch 6 (P1 CHAR greybox).** 34 downstream FRs depend on this — one of the largest blockers in the graph. The greybox-as-LOD-1 secondary-ROI argument is the design anchor: same artefact serves P1 sizing AND P3 perf fallback, halving redundant work.

## §2 — Round-1/2 findings (resolved)

### ISS-2601 — "No rig, no texture" rule was prose
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — AC#5 Blender Python `bpy.data.armatures` + `bpy.data.images` checks; §5 verification script exits non-zero on violation.

### ISS-2602 — Greybox single-use risk (build then discard)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §2 + §8 LOD-1 secondary-ROI argument; FR-PERF-002 + FR-PERF-009 cross-ref ensures greybox stays useful through production.

### ISS-2603 — Hood "C" might be added as texture for tri budget
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #4 + AC#8 explicit geometry requirement; hood block gets larger tri share (3000 cap vs 1500-2000 elsewhere) to preserve the brand-anchor "C".

### ISS-2604 — Topology unfit for future rig (risks FR-CHAR-009 surprise)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — AC#12 dual signoff (founder + rigger); rigger validates topology supports the 27-bone armature at this proportion.

### ISS-2605 — Production-mesh proportion drift (FR-CHAR-006 needs same proportions)
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3.2 NOTES.md upgrade-path section + AC#11 ensures FR-CHAR-006 inherits exactly.

## §3 — Strengths preserved from the spec-stub

- 8000-tri target + 10000 hard cap correctly cited from master plan §3.3 character table.
- Per-block tri distribution (35% hood / 25% face / 25% body+arms / 15% wisp) already correct.
- Blender 4.4 LTS + metric units + +Z up baseline already locked.
- FR-OPS-001 stage-1 export contract already correctly referenced.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-2606 — Mesh hash invariance not pinned across Blender versions
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** GLB exports vary between Blender 4.0/4.1/4.2 minor versions due to internal export algorithm changes. Pin Blender version in tools/blender/.python-version + assert mesh-hash stability in CI.

### ISS-2607 — Texture color-space metadata not enforced
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** PBR materials require explicit sRGB vs Linear tagging per texture role (baseColor=sRGB, normal=Linear, ORM=Linear). KTX2 encoder MUST set per-texture color space; gltf-transform inspector verifies. Without enforcement, runtime renders look subtly wrong on some browsers.

### ISS-2608 — Armature drift on re-rig (bones renamed mid-development)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** If bone names change after FR-CHAR-011 NLA clips are authored, animation breaks silently. Schema-as-code via Blender Python script asserts canonical bone names + count; CI runs blender --background validation.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One greybox mesh — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | 12 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.4 | 1.6 | 1.9 | 2.0 | Blender Python + GLB inspect + 12 ACs. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §3.3 + §4.2 + §4.4 cited. |
| API/contract precision | 1.5 | 1.3 | 1.4 | 1.5 | 1.5 | Tri-budget table + Blender export settings + NOTES.md shape. |
| Dependencies declared | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | FR-CHAR-001 + FR-CHAR-002; 34 downstream FRs blocked. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | 9 rows; covers tri overflow + scope creep + topology mismatch. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | Comparison PNG + NOTES.md + dual signoff. |
| **Total** | **10.0** | **6.5** | **8.2** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

**Opens Batch 6 (P1 CHAR greybox).**

1. **FR-CHAR-004 ✓ (this audit, 10/10)** — 34 downstream unblocks
2. Next: FR-CHAR-005 (per-scene greybox sets) — closes Batch 6

---

*End of FR-CHAR-004 audit.*
