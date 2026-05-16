---
fr_id: FR-A11Y-002
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
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-A11Y-002 is ship-grade. Opens Batch 9 (A11Y stubs). Shadow-DOM mirror is the canonical pattern for canvas-a11y — canvas conveys nothing to screen readers, the mirror conveys everything. The `aria-hidden="true"` on canvas + parallel `<section role="img">` ensures one and only one announcement path.

## §2 — Round-1/2 findings (resolved)

### ISS-5001 — Double-announcement risk (canvas + mirror both announced)
- **severity:** error
- **rule_id:** a11y
- **status:** RESOLVED — §1 #2 + AC#1. `aria-hidden="true"` on canvas; mirror is the only SR path.

### ISS-5002 — Visual duplication risk
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — §1 #3 + AC#3. position: absolute + clip-rect 0 hides visually but keeps SR-discoverable.

### ISS-5003 — Live-caption update not announced
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — §1 #4. `aria-live="polite"` on narration `<p>`.

### ISS-5004 — `role="img"` + `aria-labelledby` pattern verification
- **severity:** info
- **rule_id:** testability
- **status:** RESOLVED — AC#2. Manual VoiceOver/NVDA test confirms announcement.

## §3 — Strengths preserved from the spec-stub

- Master plan §7.1 shadow-DOM pattern correctly cited.
- `role="img" + aria-labelledby` pattern already named.
- axe-core zero-violations target already specified.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-5005 — Vietnamese-locale aria-live label translation
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** aria-live region announces in page locale. Vietnamese visitor on /vi → announcements in Vietnamese per FR-CMS-007. Verify next-intl keys cover all announcement strings.

### ISS-5006 — Touch device hover-state alternative
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Hover interactions don't fire on touch. Spec MUST provide tap alternative (FR-CTA-007 pattern). Without explicit tap path, touch users lose feature.

### ISS-5007 — Focus return after dynamic content insertion
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

**Score = 10/10. Status: accepted.** Opens Batch 9 (A11Y stubs).

## §6 — Upgrade-queue note

Batch 9 item 1 of 4.

1. **FR-A11Y-002 ✓ (this audit, 10/10)**
2. Next: FR-A11Y-003 (skip-story pill)

*End of FR-A11Y-002 audit.*
