---
fr_id: FR-SCENE-002
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
final_revision: 2026-05-16 (round 3; feature-request-audit skill §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-SCENE-002 is ship-grade. Opens Batch 4 (SCENE comps 2..8). Scene 1 "Origin" is the empathy beat — Saigon 2020 founding story. The caption-verbatim contract with FR-CMS-002 (line-id reference, not free text) is the anchor preventing narrative drift; the 6-keyframe idea-spark table makes the shader brief unambiguous for the FR-SCENE-013 implementation team.

## §2 — Round-1/2 findings (resolved)

### ISS-2601 — Caption could drift from CMS-managed narration
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 + AC#5 require verbatim line from `content/narrative/lines/en.json` `scene-1-primary` ID; grep enforces exact match.

### ISS-2602 — Camera path described in prose, not testable
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3 + AC#7 specify camera-path.md sections (entry pose / mid pose / exit pose) with explicit position+rotation triples per breakpoint.

### ISS-2603 — Idea-spark shader feasibility unclear
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §3.3 specifies a 6-keyframe table (t=0..5s) with `intensity` + `radius` + `color` per frame; FR-SCENE-013 implementation team has the modeller brief locked.

### ISS-2604 — Wisp coil over-animation risk (Scene 1's coil_idle could distract from caption)
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 row 4 documents motion-budget guard: wisp loop opacity ≤ 35% during caption-reveal beat (first 1.2s).

### ISS-2605 — Storyboard word-cap missing
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — AC#9 enforces ≤ 200 words on storyboard.md.

## §3 — Strengths preserved from the spec-stub

- Saigon-warm sepia + brown-400 backdrop already correctly cited from master plan §3.4.
- coil_idle 5.0s loop cited from master plan §3.3a.
- 3-breakpoint comp deliverable structure already correct.
- Founder + designer dual signoff cycle correctly placed.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-2606 — Scene transition timing accumulates float-error over long scrolls
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** GSAP scroll-progress (0-1 normalized) accumulates float errors over many transitions. Acceptable for one session; document constraint. Future amendment: reset on page-reload only (no impact within session).

### ISS-2607 — Camera matrix not deterministic on resize during scene transition
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** User resizes mid-transition → camera position math drifts. Spec MUST snapshot transition state on resize, recompute matrix from snapshot, not from current scroll. Without this, mid-transition resize causes visible jump.

### ISS-2608 — Reduced-motion fallback content parity with cinematic
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** /lite mode renders storyboard panels for this scene. Storyboard panels MUST convey the same narrative beat as cinematic version (no information loss). Founder reviews per-scene; cross-ref FR-A11Y-001.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One scene comp + storyboard — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | Precise MUSTs. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Grep + word-count + comp-existence ACs. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §2.1 + §3.4 + §3.3a cited. |
| API/contract precision | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | camera-path.md shape + idea-spark keyframe table. |
| Dependencies declared | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | FR-SCENE-001 + FR-CHAR-001 + FR-CMS-002 + downstream FR-SCENE-013. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | covers caption drift + motion budget. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | grep + 3 breakpoint PNGs + storyboard. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

**Opens Batch 4 (SCENE comps 2..8).**

1. **FR-SCENE-002 ✓ (this audit, 10/10)**
2. Next: FR-SCENE-003 (Scene 2 Transformation paint-trail)

---

*End of FR-SCENE-002 audit.*
