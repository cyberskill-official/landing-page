---
fr_id: FR-CHAR-012
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 7.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub; closes Batch 1)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-CHAR-012 is ship-grade. Round-2 re-author from the original spec-stub (6.5/10 on 2026-05-16). This closes **Batch 1** (P2 production-mesh chain: CHAR-006..012 all at anchor-grade). Round-2 additions: explicit brim/cone dimensions with conical-not-sombrero rationale (§1 #1 + §2), the "single-star + 5-point + 30%" detection rule with blob-detection enforcement (§1 #5 + §5 detect_single_star), scale-and-rotation-applied rule (§1 #15, AC#12) explaining why post-parent scale-apply breaks tip animation, the canonical front render deliverable (§1 #13), the co-signoff with cultural-identity check (§1 #14), nonla-validator.py with triangulation + extents + parent introspection + colour sampling + star blob-detection + raw-GLB-size enforcement (§5 ~140 lines), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3301 — Brim/cone proportion rule vague ("12 cm and 8 cm relative to 1.6m")
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #1 specifies Blender-unit ranges (brim 0.075-0.080, cone 0.045-0.055) with "wider than tall" rationale to avoid witch-hat / sombrero failure modes. AC#2 + AC#3 + validator enforce.

### ISS-3302 — Star sizing "30% of brim diameter" + 5-point + front-centre not verifiable
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #5 specifies 5-point orientation with one point up, ~30% diameter, front-centre; AC#4 + validator's blob-detection enforces single-star count.

### ISS-3303 — Scale-and-rotation-applied rule missing (Blender default keeps scale unbaked)
- **severity:** error
- **rule_id:** normative-precision
- **status:** RESOLVED — §1 #15 forbids post-parent scale/rotation; AC#12 + validator checks `obj.scale == (1,1,1) AND obj.rotation_euler == (0,0,0)`. §2 paragraph 2 explains tip-animation breakage.

### ISS-3304 — Cultural-register prohibition was prose, not testable
- **severity:** warning
- **rule_id:** verification-shape
- **status:** RESOLVED — §1 #6 lists banned elements (woven texture, calligraphy, dragons, áo dài patterns); AC#8 + validator measures high-frequency content energy in BaseColor to detect pattern bake.

### ISS-3305 — Co-signoff (modeler + founder cultural check) implicit
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #14 + AC#16. Founder validates "casual everyday Vietnamese" cultural read vs ceremonial / touristy.

### ISS-3306 — Validator script absent
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §5 ~140-line Blender validator with triangulation count, extent measurement, parent introspection, custom-property check, dominant-colour sampling, star blob-detection, raw-GLB-size enforcement.

### ISS-3307 — Canonical front render PNG (founder-facing artefact) missing
- **severity:** warning
- **rule_id:** observability
- **status:** RESOLVED — §1 #13 + AC#15 requires `lumi-nonla-render.png` (512×512, transparent background, hat alone) as the async-signoff artefact.

### ISS-3308 — Failure-mode inventory was 5 rows; missed common Blender + cultural gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "scale not applied", "hat parented to head bone instead of hat_socket", "cone-vs-sombrero proportion fail", "founder rejects cultural read" (the signoff iteration loop).

## §3 — Strengths preserved from the spec-stub

- Exact flag-red `#DA251D` + interior-gold `#F9D966` + star-yellow `#FFEB3B` were already correctly cited from FR-CHAR-003 design spec.
- 30% star sizing already specified.
- Cultural-register prohibition on decorative patterns already correctly stated.
- `hat_socket` parent + `nonla_visible` toggle pattern already correctly defined.
- 600-tri hard cap correctly cited from master plan §3.3b.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One hat mesh + UV + parent — atomic. |
| BCP-14 normativity | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Validator + 16 ACs each named test. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §3.3b nón lá spec + §4.4 perf cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | Stats JSON + dimensions + colour anchors + raw-GLB target. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | FR-CHAR-003 cultural-note + FR-CHAR-009 hat_socket dependencies; downstream blocks FR-SCENE-017 + FR-CHAR-011. |
| Failure-modes inventory | 1.0 | 0.4 | 0.7 | 0.9 | 1.0 | 12 rows; covers Blender 4.4 + cultural-rejection gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.7 | 0.9 | 1.0 | Stats JSON + canonical render PNG + co-signoff. |
| **Total** | **10.0** | **6.5** | **8.2** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

**This audit closes Batch 1.** All 7 P2 production-mesh chain FRs (CHAR-006..012) are now at anchor-grade. Implementation may begin once FR-CHAR-003 (cultural-note + colour spec; shipped) and FR-CHAR-009 (rig with `hat_socket`; currently accepted at anchor-grade) are both production-ready.

---

## §6 — Upgrade-queue note — Batch 1 closure

**Batch 1 of the spec-stub → anchor-grade campaign is COMPLETE.**

| # | FR | Status | Audit score | Downstream blocks |
|---|---|---|---:|---:|
| 1 | FR-CHAR-006 (production mesh) | ✓ accepted (anchor) | 10/10 | 7 |
| 2 | FR-CHAR-007 (UV layout) | ✓ accepted (anchor) | 10/10 | 5 |
| 3 | FR-CHAR-008 (Substance textures) | ✓ accepted (anchor) | 10/10 | 4 |
| 4 | FR-CHAR-009 (custom armature) | ✓ accepted (anchor) | 10/10 | 4 |
| 5 | FR-CHAR-010 (shape keys) | ✓ accepted (anchor) | 10/10 | 3 |
| 6 | FR-CHAR-011 (animation library, 11 clips) | ✓ accepted (anchor) | 10/10 | 10 ← biggest unblock |
| 7 | FR-CHAR-012 (nón lá production mesh) | ✓ accepted (anchor) | 10/10 | 2 |

**Total downstream unblocks delivered by Batch 1: ~35 FR-edges.**

Next batches per `docs/launch/upgrade-queue.md`:
- **Batch 2** — FR-WEB-002..009 (8 FRs) — Web foundation.
- **Batch 3** — FR-DS-004..009 (6 FRs) — Design system rest.
- **Batch 4** — FR-SCENE-002..008 (7 FRs) — Scene comp follow-on.
- **Batch 5..13** — see upgrade-queue.md for the rest of ~100 remaining FRs.

---

*End of FR-CHAR-012 audit (round 2 final — anchor-grade re-author from spec-stub; **closes Batch 1**).*
