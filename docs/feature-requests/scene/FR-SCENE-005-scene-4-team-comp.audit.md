---
fr_id: FR-SCENE-005
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 4
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-grade from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-SCENE-005 is ship-grade. Scene 4 "Team" is the trust beat — humanise without commodifying. The exactly-10 avatar count is brand-proof copy ("Ten of us"); privacy-by-default hover anonymisation (name + role only, no photos) preserves team safety while still landing the warmth.

## §2 — Round-1/2 findings (resolved)

### ISS-2901 — Avatar count could drift (9 or 11 weakens "Ten of us")
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #3 + AC#1 lock at exactly 10; failure mode row 1 documents the brand-proof-copy rationale.

### ISS-2902 — Privacy / photo-leak risk on team profiles
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #8 + AC#7 forbid photos + LinkedIn links; hover reveals first name + role only.

### ISS-2903 — Recruit-hook prominence ambiguous (could be loud CTA)
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #6 + AC#5 require visually subordinate text-link (not button); master plan §9.1 Track 3 explicit "whisper".

### ISS-2904 — Lumi dim-discipline implicit (could blow Scene-0 emissive level)
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #4 + §5 row 4 specify emissive 0.1 (vs default 0.2); Lumi positioned above frame centre + smaller scale.

## §3 — Strengths preserved from the spec-stub

- Warm golden-hour palette correctly cited (master plan §3.4).
- MeshTransmissionMaterial bokeh hint correct.
- "We're hiring" caption hook from master plan §9.1 Track 3.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One scene comp + avatar-placement — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | Precise MUSTs. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Count + emissive + privacy ACs. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §2.1 + §3.4 + §9.1 cited. |
| API/contract precision | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | avatar-placement.md + Lumi dim numbers. |
| Dependencies declared | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | depends on SCENE-001 + CHAR-001 + CMS-002; blocks FR-SCENE-016. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | covers count drift + photo leak + CTA over-prominence. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | 3 breakpoints + storyboard + placement.md. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 4 item 4 of 7.

1-3. ✓
4. **FR-SCENE-005 ✓ (this audit, 10/10)**
5. Next: FR-SCENE-006 (Scene 5 Vietnam→Global)

---

*End of FR-SCENE-005 audit.*
