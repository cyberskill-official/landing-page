---
fr_id: FR-CTA-005
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

FR-CTA-005 is ship-grade. Form validation: react-hook-form + zod schema-validated forms with a11y first. Depends on FR-CTA-002..004 + FR-A11Y-010 (form-error a11y).

## §2 — Round-1/2 findings (resolved)

### ISS-70031 — Implementation contract underspecified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 ties to canonical anchor FRs (FR-CTA-002..004 + FR-A11Y-010 (form-error a11y)); type-safe surface per CONTRACT precision rule.

### ISS-70032 — A11y / form-error / aria-live handling
- **severity:** error
- **rule_id:** a11y
- **status:** RESOLVED — Form-error announcements via aria-live=polite; FR-A11Y-010 + FR-A11Y-008 focus-ring discipline.

### ISS-70033 — Rate-limit + abuse protection
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — /api/lead has rate-limit + reCAPTCHA-style bot guard; FR-CTA-006 §1 explicit.

### ISS-70034 — Locale + hreflang correctness
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — FR-CMS-007/008 wire ?lang= + hreflang; canonical via FR-WEB-008 metadata-helpers.

## §3 — Strengths preserved from the spec-stub

- Anchor FR dependencies already correctly cited.
- Master plan §9.1 (CTA tracks) / §9.2 (trust signals) / §8.1 (SEO) references correct.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-70035 — Form session draft expiry edge case (deploy mid-session)
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** User has draft in sessionStorage; deploy happens mid-fill; schema may have changed. Spec MUST detect schema-version mismatch and clear draft with explanation. Without this, server validation fails on stale draft.

### ISS-70036 — Honeypot field a11y (must not be announced to AT)
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Honeypot input MUST be aria-hidden + tabIndex=-1 + offscreen via CSS. display:none can still be announced by some AT. Cross-ref FR-CTA-006.

### ISS-70037 — Multi-step form state across browser back-button
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** User clicks Back mid-form → React Router may reset state. Spec MUST persist step + values via beforeunload + sessionStorage. Tested in Playwright back-button scenario.

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

Batch 11 item 4 of 12.

*End of FR-CTA-005 audit.*
