---
fr_id: FR-CHAR-010
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
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-CHAR-010 is ship-grade. Round-2 re-author from the original spec-stub (6.5/10 on 2026-05-16). Round-2 additions: per-shape-key character-sheet mapping (§1 #5), the `mouth_neutral`-MUST-NOT rule (§1 #11), the `glow_pulse` morph-target rationale (§1 #10 + §2 paragraph 4), the asymmetric-eye driver expression pattern (§3.3 + §9), the three-way signoff (rigger + animator + founder) (§1 #12), the contact-sheet HTML deliverable (§1 #8), shape-key-validator.py with driver introspection + vertex-delta measurement + trial glTF export (§5 ~130 lines), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3101 — Shape-key ↔ character-sheet head mapping implicit
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #5 enumerates each shape key to FR-CHAR-001 expression-head index, including `mouth_o + cheek_puff` blend for the "comedic surprise" read.

### ISS-3102 — `mouth_neutral` not explicitly forbidden
- **severity:** error
- **rule_id:** normative-precision
- **status:** RESOLVED — §1 #11 MUST NOT include `mouth_neutral` (it IS the base mesh); AC#10 + validator's `FORBIDDEN_KEYS` enforces.

### ISS-3103 — `glow_pulse` as shape-key vs uniform-buffer ambiguous
- **severity:** info
- **rule_id:** rationale-gap
- **status:** RESOLVED — §1 #10 + §2 paragraph 4 explain why morph target instead of uniform (Three.js animation mixer reads weight from GLTF tracks); AC#12 verifies non-zero vertex delta.

### ISS-3104 — Driver expression for asymmetric eyes (single-eye wink) unspecified
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §3.3 + §9 specify `max(eye_blink_L, eye_blink_R)` driver pattern; AC#13 verifies driver evaluates to finite number.

### ISS-3105 — Three-way signoff (rigger + animator + founder) implicit
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #12 + AC#11. Rigger validates wiring; animator validates usability; founder validates brand-identity read.

### ISS-3106 — Validator script absent
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §5 ~130-line Blender validator: name match, driver introspection, vertex-delta measurement, trial glTF export, sparse-accessor check.

### ISS-3107 — Contact-sheet HTML deliverable missing
- **severity:** warning
- **rule_id:** observability
- **status:** RESOLVED — §1 #8 + AC#8 require `lumi-shape-key-contact-sheet.html` as the non-Blender review artefact.

### ISS-3108 — Failure-mode inventory was 4 rows; missed real Blender 4.4 gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "glow_pulse with zero vertex deltas" (artist creates an empty shape key — common because glow_pulse is conceptually non-deforming), "shape-key delta values too large" (breaks Meshopt morph compression downstream), "cheek_puff clips through cheek geometry at value=1.0" (skinning + shape key interaction).

## §3 — Strengths preserved from the spec-stub

- The 10-shape-key list from master plan §3.3 was already complete and correctly named.
- The driver-via-c_head-custom-property pattern was correctly stated.
- The 0..1 range hard rule was already pinned.
- The glTF export trial as an AC (catching sparse-accessor issues) was already present.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One mesh shape-key block; 10 keys — atomic. |
| BCP-14 normativity | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | 13 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Validator + 13 ACs each named test. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §3.3 character table + §4.2 cited; expression-head mapping to FR-CHAR-001 enumerated. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | `lumi-shape-keys-stats.json` + shape-key↔c_head property table. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | Concept + operational + downstream all enumerated. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Blender gotchas + skinning interactions. |
| Observability hooks | 1.0 | 0.6 | 0.7 | 0.9 | 1.0 | Stats JSON + contact-sheet HTML + three-way signoff. |
| **Total** | **10.0** | **6.5** | **8.2** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation begins after FR-CHAR-009 is shipped. Implementation needs to amend FR-CHAR-009's `c_head` custom-property list to 11 entries (adding `mouth_o`, `cheek_puff`, `glow_pulse`, `hood_tip`) — flag this cross-FR dependency at signoff.

---

## §6 — Upgrade-queue note

Batch 1 item 5 of the spec-stub → anchor-grade upgrade campaign.

1. FR-CHAR-006 ✓ (10/10)
2. FR-CHAR-007 ✓ (10/10)
3. FR-CHAR-008 ✓ (10/10)
4. FR-CHAR-009 ✓ (10/10)
5. **FR-CHAR-010 ✓ (this audit, 10/10)**
6. Next: FR-CHAR-011 (animation library, 11 clips) · 10 downstream — the biggest unblock in batch 1
7. Then: FR-CHAR-012 (nón lá production mesh) · 2 downstream

---

*End of FR-CHAR-010 audit (round 2 final — anchor-grade re-author from spec-stub).*
