---
id: FR-CTA-005
title: "Call-booking path for high-intent leads (link, not embed)"
status: done
class: product
priority: SHOULD
owner: mixed
depends_on: [FR-BIZ-013, FR-CTA-010]
routed_back_count: 0
awh: N/A
traces_to: [growth/CONV-02, audit-A/section-9, audit-B/finding-2-high]
---

# FR-CTA-005: Call-booking path for high-intent leads (link, not embed)

## 0. Why (evidence)

Many buyers pick a time slot but never write a message. Scope corrected on 2026-07-11: this is a link, not an embed. A
third-party booking iframe would cost page weight, a consent surface and a CSP allowance (FR-OPS-009) on a page that is
already fighting a mobile performance problem (audit B: 1,370 ms TBT, ~900 KB JS).

## 1. Description (normative)

- 1.1 A secondary action ("Book a 30-minute call") SHALL render in the contact section and on the thank-you panel (FR-CTA-010), opening the booking URL in a new tab.
- 1.2 The action SHALL be gated on `NEXT_PUBLIC_BOOKING_URL`: it renders only when the URL is configured, and no booking script SHALL be loaded at any time.
- 1.3 The click SHALL emit `booking_clicked` (FR-OPS-011).
- 1.4 Labels SHALL ship EN and VN in the same commit, from the dictionaries.

## 2. Acceptance criteria

- [x] AC for 1.1 - the action renders in both places and opens the URL in a new tab - test: `cta/booking-action`
- [x] AC for 1.2 - with the env unset, nothing renders and no third-party request is made - test: `cta/booking-action`
- [x] AC for 1.3 - the click emits booking_clicked with its location - test: `analytics/both-lead-paths`
- [x] AC for 1.4 - both locales render the label - test: `content/cta-copy`

## 3. Edge cases

- A booking URL that 404s must not be shipped - validate it at build time.
- The new tab must carry rel="noopener".

## 4. Out of scope / non-goals

- Creating the booking account and supplying the URL (FR-BIZ-013).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.2: every secret lives only in server env; no NEXT_PUBLIC_ secret, ever (NFR-SEC-001).
