---
id: FR-CTA-014
title: "Newsletter capture with double opt-in"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: [FR-OPS-013]
routed_back_count: 0
awh: N/A
traces_to: [growth/NURT-01, audit-A/phase-3]
---

# FR-CTA-014: Newsletter capture with double opt-in

## 0. Why (evidence)

The site has no way to keep a warm list. A build-notes newsletter is the cheapest nurture channel and the natural home for
the insights the reports ask the company to publish (FR-CMS-007).

## 1. Description (normative)

- 1.1 A `/api/subscribe` route SHALL accept a validated email, locale and honeypot; on success it SHALL add the contact to the audience and send a double opt-in confirmation with a signed, expiring link.
- 1.2 Only confirmed contacts SHALL be marked subscribed; an unconfirmed contact SHALL expire.
- 1.3 Capture points SHALL be the footer, the post-FAQ band and the thank-you panel, with a named promise ('one email a month: what we shipped, one lesson, one teardown'), EN and VN.
- 1.4 Without the provider env var the route SHALL no-op safely and the UI SHALL hide the capture.
- 1.5 An unsubscribe link SHALL be present in every send and SHALL work in one click.

## 2. Acceptance criteria

- [ ] AC for 1.1 - subscribing sends a confirmation with a signed link - test: `api/subscribe-double-optin`
- [ ] AC for 1.2 - an unconfirmed contact never receives a broadcast - test: `api/subscribe-double-optin`
- [ ] AC for 1.3 - honeypot and validation reject junk - test: `api/subscribe-validation`
- [ ] AC for 1.4 - with no env var the route no-ops and the UI hides - test: `api/subscribe-env-gate`
- [ ] AC for 1.5 - the unsubscribe link removes the contact - test: `api/subscribe-unsubscribe`

## 3. Edge cases

- A replayed or expired confirmation link.
- The same address subscribing twice.
- PDPL: consent must be explicit, granular and recorded with a timestamp.

## 4. Out of scope / non-goals

- Writing the welcome sequence (FR-BIZ-010).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.2: secrets live only in server env; no NEXT_PUBLIC_ secret, ever.
- Marketing email is sent only to a contact with a recorded, confirmed opt-in.
