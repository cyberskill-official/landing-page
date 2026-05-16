---
fr_id: FR-SCENE-011
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 6.5/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 6
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-SCENE-011 is ship-grade. The dual hero+sticky CTA pattern with 200ms ease-genie crossfade preserves above-fold conversion path through entire cinematic. DOM-not-Drei-Html discipline + z-index ordering (skip-pill > sticky > scenes) ensures a11y + visual layering correctness.

## §2 — Round-1/2 findings (resolved)

### ISS-3501 — Sticky-variant transition implementation unspecified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #2 + §3 GSAP ScrollTrigger timeline with scrub: 0.2; AC#2 + AC#7 verify.

### ISS-3502 — Z-index ordering implicit (sticky-CTA could cover skip-pill)
- **severity:** error
- **rule_id:** a11y
- **status:** RESOLVED — §1 #6 + AC#5. skip-story-pill (FR-A11Y-002) > sticky-CTA > scenes.

### ISS-3503 — `/lite` route presence ambiguous
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #9 + AC#8. Lite path uses 7-panel storyboard with CTA only in panel 7.

### ISS-3504 — Deep-link `?action=book` behavior undefined
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #10 + AC#9. Auto-opens modal after Scene 0 mount per FR-CTA-001 §1 #15.

### ISS-3505 — Crossfade duration could drift (hardcoded)
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — §1 #8 + AC#7 require 200ms imported from FR-DS-006 motion module.

### ISS-3506 — SSR-safety of GSAP ScrollTrigger registration
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #11 + AC#10 require registration in useEffect; SSR build clean.

## §3 — Strengths preserved from the spec-stub

- DOM-element rule (not Drei Html) correctly cited from FR-CTA-001.
- 44×44 target size correctly cited from FR-A11Y-009.
- Buyer-track buy modal binding correctly named.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One CTA component — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 12 MUSTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Playwright + 12 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §9.1 + §2.1 + §5.2 + §7.4 cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | Scene0CTA component + GSAP timeline + Playwright. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | SCENE-009 + CTA-001 + WEB-002 + downstream SCENE-012. |
| Failure modes | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers HMR + SSR + a11y + analytics wiring. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | Playwright bounding-box + Vitest + a11y. |
| **Total** | **10.0** | **6.5** | **8.2** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 5 item 3 of 4.

1-2. ✓
3. **FR-SCENE-011 ✓ (this audit, 10/10)**
4. Next: FR-SCENE-012 (particulate dust) — closes Batch 5

---

*End of FR-SCENE-011 audit.*
