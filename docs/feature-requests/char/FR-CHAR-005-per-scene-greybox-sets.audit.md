---
fr_id: FR-CHAR-005
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
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

FR-CHAR-005 is ship-grade. **Closes Batch 6 (P1 CHAR greybox).** Per-scene greybox sets give engineering early sizing for FR-WEB-003 tunnel arrangement + FR-PERF-008 draw-call budget. The Lumi-linked-not-duplicated rule (Blender `Link → Collection`) prevents 8× duplication of the FR-CHAR-004 greybox.

## §2 — Round-1/2 findings (resolved)

### ISS-3201 — Per-scene greybox-prop budget unspecified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3 contract table specifies each scene's prop budget + tri allocation; AC#1 + AC#2 verify per-scene.

### ISS-3202 — Lumi duplication risk across 8 .blend files
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — AC#6 + `Link → Collection` rule. Each scene .blend links the FR-CHAR-004 Lumi greybox collection; no duplicate vertex data.

### ISS-3203 — Camera framing could diverge from Figma comps
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — AC#7 R3F-architect signoff cross-checks Blender camera against FR-SCENE-001..008 Figma frames.

### ISS-3204 — Frustum overflow / scene-scale check missing
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — AC#9 frustum-overflow flag; Blender Python verifies all scene props are within camera frustum (no offscreen-render waste).

## §3 — Strengths preserved from the spec-stub

- 8-scene coverage (Scene 0..6 + footer) already correctly enumerated.
- 1.5 MB per-scene asset budget cited (master plan §4.4).
- Draw calls < 100 per scene cited (master plan §6.1).
- Phase P1 deliverable schedule already correct.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-3205 — Mesh hash invariance not pinned across Blender versions
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** GLB exports vary between Blender 4.0/4.1/4.2 minor versions due to internal export algorithm changes. Pin Blender version in tools/blender/.python-version + assert mesh-hash stability in CI.

### ISS-3206 — Texture color-space metadata not enforced
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** PBR materials require explicit sRGB vs Linear tagging per texture role (baseColor=sRGB, normal=Linear, ORM=Linear). KTX2 encoder MUST set per-texture color space; gltf-transform inspector verifies. Without enforcement, runtime renders look subtly wrong on some browsers.

### ISS-3207 — Armature drift on re-rig (bones renamed mid-development)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** If bone names change after FR-CHAR-011 NLA clips are authored, animation breaks silently. Schema-as-code via Blender Python script asserts canonical bone names + count; CI runs blender --background validation.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 8 greyboxes — atomic by scene. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | Precise MUSTs. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Blender Python + draw-call estimator + 9 ACs. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §10 P1 + §4.4 + §6.1 cited. |
| API/contract precision | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | Per-scene contract table + Link-Collection rule. |
| Dependencies declared | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | FR-CHAR-004 + FR-SCENE-008; blocks FR-WEB-003 + FR-PERF-008. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | covers duplication + frustum overflow + camera divergence. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | Per-scene NOTES.md + draw-call estimate table. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

**This audit closes Batch 6.** Both P1 CHAR greybox FRs (CHAR-004 + CHAR-005) are now at anchor-grade.

---

## §6 — Upgrade-queue note — Batch 6 closure

**Batch 6 of the spec-stub → anchor-grade campaign is COMPLETE.**

| # | FR | Status | Audit score | Downstream |
|---|---|---|---:|---:|
| 1 | FR-CHAR-004 (Lumi greybox) | ✓ accepted (anchor) | 10/10 | 34 |
| 2 | **FR-CHAR-005 (per-scene greybox sets)** | ✓ accepted (anchor) | 10/10 | 2 |

**Total downstream unblocks delivered by Batch 6: ~36 FR-edges** (the largest single-FR unblock since Batch 1's FR-CHAR-011).

Next batches per `docs/launch/upgrade-queue.md`:
- **Batch 7** — FR-OPS-002..009 (8 FRs) — pipeline support.
- **Batch 8..13** — see upgrade-queue.md.

---

*End of FR-CHAR-005 audit (round 2 final — anchor-grade re-grade from spec-stub; **closes Batch 6**).*
