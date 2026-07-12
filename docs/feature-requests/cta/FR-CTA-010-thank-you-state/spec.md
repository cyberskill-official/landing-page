---
id: FR-CTA-010
title: "Thank-you state with next steps, and a trust line under the form"
status: ready_to_implement
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [growth/CONV-03, audit-A/section-9]
---

# FR-CTA-010: Thank-you state with next steps, and a trust line under the form

## 0. Why (evidence)

The moment after submit is the highest-attention moment in the funnel and today it is a bare success message. The
one-business-day promise appears only before the form, and the visitor learns nothing about what happens next. Audit A
rates the form itself as best-practice (3 required fields, honeypot, consent) and locates the throttle elsewhere - so the
cheapest conversion gain is what surrounds it.

## 1. Description (normative)

- 1.1 On success, components/cta/LeadForm.tsx SHALL render a panel stating: the message was received, who reads it, when a person replies (one business day), which address the reply comes from, and the next available action (booking button when configured, newsletter opt-in when configured).
- 1.2 A trust line SHALL render under the Send button before submit, naming the reader and the reply address.
- 1.3 The Lumi chat lead flow SHALL confirm capture with the same information.
- 1.4 All strings SHALL live in the dictionaries and ship EN and VN in the same commit.

## 2. Acceptance criteria

- [ ] AC for 1.1 - submitting renders the panel with all five elements, both locales - test: `cta/thank-you-panel`
- [ ] AC for 1.2 - the pre-submit trust line renders - test: `cta/thank-you-panel`
- [ ] AC for 1.3 - the chat capture confirmation matches the form's - test: `genie/capture-confirmation`
- [ ] AC for 1.4 - the error path still renders the error, not the panel - test: `cta/thank-you-panel`

## 3. Edge cases

- A failed POST must not show the thank-you panel.
- Double submit must not create two leads.
- The booking and newsletter affordances are absent when unconfigured - the panel must still make sense.

## 4. Out of scope / non-goals

- The booking URL itself (FR-CTA-005).
- The acknowledgement email (FR-CTA-011).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- A submitted lead is never silently lost (FR-OPS-010).
