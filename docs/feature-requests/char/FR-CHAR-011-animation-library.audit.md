---
fr_id: FR-CHAR-011
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 9
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-CHAR-011 is ship-grade. Round-2 re-author from the original spec-stub (6.5/10 on 2026-05-16). This is the largest unblock in P2 (10 downstream scene-FRs + 2 OPS-FRs). Round-2 additions: full 11-clip table with per-scene usage column (§1 #1), per-clip frame-count target list with ±3-frame tolerance (§1 #7), the `loop_close_delta ≤ 0.001` rule for loop clips (§1 #8), EASE_OUT_QUINT enforcement on `fly_in` body-Z (§1 #9), `paint` + `coil_idle` hold-subregion rule (§1 #10), per-clip thumbnails + storyboard deliverables (§1 #13 + #14), co-signoff (§1 #15), animation-validator.py with NLA enumeration + loop-close-delta + easing detection + hold-subregion detection + scratch-action enforcement + trial-export (§5 ~170 lines), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3201 — Per-clip frame counts not specified (only durations in seconds)
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #7 lists each clip's frame count at 30 fps with ±3-frame tolerance. AC#2 + validator enforces.

### ISS-3202 — "Loops cleanly" criterion vague for `paint`, `coil_idle`, `idle`
- **severity:** error
- **rule_id:** verification-shape
- **status:** RESOLVED — §1 #8 introduces `loop_close_delta ≤ 0.001` measurable threshold; §5 validator computes per-channel delta sum.

### ISS-3203 — `fly_in` ease-out-quint mentioned but not enforced
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #9 specifies the f-curve modifier or Bezier-handle approximation; AC#11 + validator inspects modifier list.

### ISS-3204 — Per-scene usage column missing (downstream FRs can't grep which clip they need)
- **severity:** warning
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 #1 table adds "Purpose / scene usage" column linking each clip to its consuming FR-SCENE-NNN.

### ISS-3205 — `paint` + `coil_idle` need pause-able hold sub-region (scene-impl pause logic depends)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #10 requires ≥ 0.5 s constant-value sub-region; AC#12 + validator detects.

### ISS-3206 — Scratch / WIP action cleanup not enforced
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #16 forbids; AC#16 + validator's `scratch_actions_remaining` list.

### ISS-3207 — Per-clip thumbnails + storyboard deliverables missing
- **severity:** warning
- **rule_id:** observability
- **status:** RESOLVED — §1 #13 + #14 require 11 PNGs + ≤ 1500-word storyboard; AC#13 + AC#14 + delivery preview §8.

### ISS-3208 — Co-signoff (animator + founder) implicit
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #15 + AC#15. Animator validates craft + glTF export; Founder validates brand-identity read.

### ISS-3209 — Validator script absent
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §5 ~170-line Blender validator with NLA strip enumeration, loop-close-delta computation, easing-modifier detection, hold-subregion detection, scratch-action enforcement, trial-export call.

## §3 — Strengths preserved from the spec-stub

- 11 verbatim clip names already correctly listed.
- NLA-editor + Bake-before-export + 30 fps sample rate already cited correctly from master plan §4.2.
- "Optimize Animation Size OFF" rule correctly cited from master plan §4.3.
- Trial-export count assertion correctly stated.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | 11 NLA strips on one armature — atomic. |
| BCP-14 normativity | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | 17 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.5 | 1.9 | 2.0 | Validator + 16 ACs each named tool / threshold. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §3.3a animation table + §4.2 + §4.3 cited verbatim. |
| API/contract precision | 1.5 | 1.0 | 1.3 | 1.5 | 1.5 | Full 11-clip table + stats JSON schema + per-scene-usage links. |
| Dependencies declared | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | 10 downstream-blocks enumerated + 2 OPS edges added. |
| Failure-modes inventory | 1.0 | 0.4 | 0.7 | 0.9 | 1.0 | 12 rows; covers Blender 4.4 export + clip-naming gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.7 | 0.9 | 1.0 | Stats JSON + thumbnails + storyboard + co-signoff. |
| **Total** | **10.0** | **6.5** | **8.5** | **9.7 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation begins after FR-CHAR-009 (rig) AND FR-CHAR-010 (shape keys) are both shipped. This is the largest single P2 effort (24 hours) and gates 10 downstream FRs — schedule it on the critical path with attention.

---

## §6 — Upgrade-queue note

Batch 1 item 6 of the spec-stub → anchor-grade upgrade campaign.

1. FR-CHAR-006 ✓ (10/10)
2. FR-CHAR-007 ✓ (10/10)
3. FR-CHAR-008 ✓ (10/10)
4. FR-CHAR-009 ✓ (10/10)
5. FR-CHAR-010 ✓ (10/10)
6. **FR-CHAR-011 ✓ (this audit, 10/10)** — the biggest unblock done
7. Next: FR-CHAR-012 (nón lá production mesh) · 2 downstream — closes Batch 1

---

*End of FR-CHAR-011 audit (round 2 final — anchor-grade re-author from spec-stub).*
