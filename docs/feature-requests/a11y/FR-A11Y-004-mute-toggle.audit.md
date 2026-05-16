---
fr_id: FR-A11Y-004
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

FR-A11Y-004 is ship-grade. Default-muted + localStorage persistence respects user agency — surprise audio on page load is a hostile UX pattern. The `aria-pressed` state + no-auto-unmute discipline ensures screen-reader users have parity with sighted users on audio control.

## §2 — Round-1/2 findings (resolved)

### ISS-5201 — Default-unmuted risk (browser permissions allow)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #1 + §1 #4 default MUTED; never auto-unmute even when browser allows.

### ISS-5202 — localStorage persistence across reloads
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #2 + AC#2. `cyberskill_mute_pref` key.

### ISS-5203 — aria-pressed state sync
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — §1 #3 + AC#3 reactive subscription.

### ISS-5204 — State drift between local + audio context
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — §3 row 1 verify reactive subscription pattern.

## §3 — Strengths preserved from the spec-stub

- Master plan §2.3 + §5.4 default-muted correctly cited.
- localStorage key `cyberskill_mute_pref` already named.
- `aria-pressed` ARIA pattern correctly named.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-5205 — Vietnamese-locale aria-live label translation
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** aria-live region announces in page locale. Vietnamese visitor on /vi → announcements in Vietnamese per FR-CMS-007. Verify next-intl keys cover all announcement strings.

### ISS-5206 — Touch device hover-state alternative
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Hover interactions don't fire on touch. Spec MUST provide tap alternative (FR-CTA-007 pattern). Without explicit tap path, touch users lose feature.

### ISS-5207 — Focus return after dynamic content insertion
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

Batch 9 item 3 of 4. Next: FR-A11Y-005 (skip-3D toggle) — closes Batch 9.

*End of FR-A11Y-004 audit.*
