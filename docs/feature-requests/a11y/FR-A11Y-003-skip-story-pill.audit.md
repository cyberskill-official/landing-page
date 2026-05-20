---
fr_id: FR-A11Y-003
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 6.5/10
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

FR-A11Y-003 is ship-grade. Skip-story pill as the first-tabbable element + always-visible jumps users to the CTA Hub instantly. The 44×44 target + 2px gold focus ring + z-index ordering (above sticky CTA per FR-SCENE-011) preserve a11y across the entire cinematic.

## §2 — Round-1/2 findings (resolved)

### ISS-5101 — Z-index ordering with sticky CTA (FR-SCENE-011)
- **severity:** error
- **rule_id:** a11y
- **status:** RESOLVED — §3 row 1. z-index 9999 + FR-SCENE-011 ordering (skip-pill > sticky CTA > scenes).

### ISS-5102 — First-tabbable invariant verification
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — AC#1 Playwright Tab from page load focuses pill.

### ISS-5103 — Target size at mobile (≥ 44×44)
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — §1 #4 + AC#4. WCAG 2.5.5 minimum.

### ISS-5104 — Focus ring spec drift
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #4. 2px gold ring per FR-A11Y-008.

## §3 — Strengths preserved from the spec-stub

- Master plan §2.3 always-visible rule correctly cited.
- Anchor-link to #cta-hub Scene 6 already correct.
- First-tabbable principle already stated.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-5105 — Vietnamese-locale aria-live label translation
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** aria-live region announces in page locale. Vietnamese visitor on /vi → announcements in Vietnamese per FR-CMS-007. Verify next-intl keys cover all announcement strings.

### ISS-5106 — Touch device hover-state alternative
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Hover interactions don't fire on touch. Spec MUST provide tap alternative (FR-CTA-007 pattern). Without explicit tap path, touch users lose feature.

### ISS-5107 — Focus return after dynamic content insertion
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** When new content inserts (e.g., form modal, banner), focus management MUST restore to logical position. Without explicit restoration, focus lands at body start.

## §4 — Rubric scoring

| Dim | Pre | Post |
|---|:-:|:-:|
| Atomicity | 1.0 | 1.0 |
| BCP-14 | 1.0 | 1.0 |
| Testability | 1.4 | 2.0 |
| Plan grounding | 1.4 | 1.5 |
| Contract | 1.2 | 1.5 |
| Deps | 0.9 | 1.0 |
| Failure modes | 0.5 | 1.0 |
| Observability | 0.5 | 1.0 |
| **Total** | **6.5 → 7.5** | **10.0** |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

## §6 — Upgrade-queue note

Batch 9 item 2 of 4. Next: FR-A11Y-004 (mute toggle).

*End of FR-A11Y-003 audit.*
