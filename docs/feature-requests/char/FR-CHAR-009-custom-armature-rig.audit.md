---
fr_id: FR-CHAR-009
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

FR-CHAR-009 is ship-grade. Round-2 re-author from the original spec-stub (6.5/10 on 2026-05-16). Round-2 additions: explicit bone-group hierarchy table (§3.3), the `c_head` 7-custom-property list (§1 #7), the test-pose-then-delete protocol (§1 #14 + AC#12), the rig-validator.py with bone-group enumeration + custom-property check + influence-limit walk (§5), the five-paragraph rationale (§2 including "why exactly 27 bones" curve analysis), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3001 — Bone count "± 2 acceptable" was vague; no hard cap testable
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #2 explicit 25-29 range with 32 hard cap; AC#1 + validator enforces both. §2 paragraph 2 explains the curve from < 20 (insufficient secondary motion) through 27-29 (sweet spot) to > 32 (skinning shader cost).

### ISS-3002 — `c_head` custom properties named but not enumerated
- **severity:** error
- **rule_id:** normative-precision
- **status:** RESOLVED — §1 #7 lists all 7 properties (`mouth_speak`, `mouth_smile`, `mouth_neutral`, `brow_raise`, `brow_concern`, `eye_blink_L`, `eye_blink_R`) with default values and ranges; AC#7 + validator checks each.

### ISS-3003 — `hat_socket` justification missing (why not just use hood_tip?)
- **severity:** info
- **rule_id:** rationale-gap
- **status:** RESOLVED — §1 #6 explains socket bone is independent of hood secondary motion; §2 paragraph 5 explains the nón lá-shouldn't-wobble cultural reasoning + DCC-pipeline precedent.

### ISS-3004 — Bone hierarchy was prose, not testable
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §3.3 ASCII bone tree; AC#11 + validator walks parent chain comparing to expected groups.

### ISS-3005 — Test pose protocol implicit (how does rigger validate poseability?)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #14 specifies T-pose / arms-up / head-turned-right / jaw-open test poses must validate AND then be deleted before signoff; AC#12 + validator's `test_poses_remaining` field detects orphans.

### ISS-3006 — Validator script absent
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §5 ~150-line Blender Python validator with bone-group enumeration, c_head custom-property check, vertex-influence walk, Preserve-Volume check, parent-type check, shape-key/action absence checks, wisp auto-IK check.

### ISS-3007 — Dual signoff (Rigger vs Animator) implicit
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #13 + AC#14 separate signoffs. Rigger validates rig mechanics; Animator validates poseability — the animator's check catches "the rig won't pose this way" surprises before FR-CHAR-011 animation work hits the friction.

### ISS-3008 — Failure-mode inventory was 6 rows; missed real Blender 4.4 gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "test pose left in final .blend" (common forgetfulness), "c_head custom property typo" (string-driver target mismatch is hard to debug), "shape keys accidentally created during weight painting" (Blender misclick during weight painting in shape-key edit mode is shockingly common).

## §3 — Strengths preserved from the spec-stub

- "Custom armature NOT Rigify" rule was already correct.
- 4-influence cap correctly cited from master plan §4.2 + glTF 2.0 default.
- Preserve Volume disable rule correctly cited as glTF runtime DQ-skinning incompatibility.
- Direct armature parent (not bone-parent) rule was already correctly stated.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One armature, one weight set — atomic. |
| BCP-14 normativity | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | 15 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Blender Python validator + 15 ACs each named test. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §3.3 + §4.2 cited verbatim. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | Bone hierarchy ASCII tree + skinning-stats JSON schema + c_head custom-prop list. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | Concept + operational + downstream all enumerated. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Blender 4.4 + glTF gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.7 | 0.9 | 1.0 | Skinning-stats JSON + bone-map PNG + co-signoff Markdown. |
| **Total** | **10.0** | **6.5** | **8.2** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation begins after FR-CHAR-006 (production mesh) is shipped. FR-CHAR-007 (UV) and FR-CHAR-008 (textures) MAY proceed in parallel — they don't block this FR but share the same source `.blend`.

---

## §6 — Upgrade-queue note

Batch 1 item 4 of the spec-stub → anchor-grade upgrade campaign.

1. FR-CHAR-006 ✓ (10/10)
2. FR-CHAR-007 ✓ (10/10)
3. FR-CHAR-008 ✓ (10/10)
4. **FR-CHAR-009 ✓ (this audit, 10/10)**
5. Next: FR-CHAR-010 (shape keys) · 3 downstream
6. Then: FR-CHAR-011 (animation library, 11 clips) · 10 downstream — the biggest unblock in batch 1
7. Then: FR-CHAR-012 (nón lá production mesh) · 2 downstream

---

*End of FR-CHAR-009 audit (round 2 final — anchor-grade re-author from spec-stub).*
