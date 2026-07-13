---
id: FR-CTA-011
title: "Auto-acknowledgement email to the lead, localized"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [growth/CONV-04, audit-A/section-9]
---

# FR-CTA-011: Auto-acknowledgement email to the lead, localized

## 0. Why (evidence)

An instant confirmation sets the reply expectation, proves deliverability of the sending domain, and opens the nurture
path. app/api/lead/route.ts today emails the company, never the lead.

## 1. Description (normative)

- 1.1 The lead route SHALL add a best-effort acknowledgement sink that emails the lead from a named human sender, in the lead's locale.
- 1.2 The email SHALL state what happens next, the one-business-day promise, the contact details, and the booking link when configured. Plain text, no tracking pixel.
- 1.3 Failure of this sink SHALL never fail the request nor the other sinks.
- 1.4 Synthetic leads (FR-OPS-010) SHALL be skipped.
- 1.5 Without the mail provider env var the acknowledgement sink SHALL be skipped (not failed), the lead SHALL still be accepted, and the skip SHALL NOT count as a sink failure in FR-OPS-010.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a VN lead receives the VN template - test: `lead/ack-email-locale`
- [ ] AC for 1.2 - the body contains the promise, the contact details and (when set) the booking link - test: `lead/ack-email-content`
- [ ] AC for 1.3 - a rejecting mail provider does not change the ok:true response - test: `lead/ack-email-failure`
- [ ] AC for 1.4 - source=synthetic sends no acknowledgement - test: `lead/synthetic-path`
- [ ] AC for 1.5 - with no provider env, the lead is accepted, no mail is attempted, and no alert fires - test: `lead/ack-email-env-gate`

## 3. Edge cases

- An invalid or disposable address must not retry-loop.
- Reply-To must reach a human who can answer.
- The email must not be sent twice on a double submit.

## 4. Out of scope / non-goals

- Domain verification and the API key (FR-BIZ-001).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- AGENTS.md §4.2: secrets live only in server env; no NEXT_PUBLIC_ secret, ever.
- No marketing content is sent to a lead who did not opt in - this is a transactional acknowledgement only.
