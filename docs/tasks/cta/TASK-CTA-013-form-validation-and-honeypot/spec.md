---
id: TASK-CTA-013
title: "Mark required fields in the markup, validate, and verify the honeypot"
status: done
class: improvement
priority: MUST
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-C/ui-ux-gaps, audit-C/phase-1]
---

# TASK-CTA-013: Mark required fields in the markup, validate, and verify the honeypot

## 0. Why (evidence)

Audit C: the classic contact form marks no fields as required in the markup - not name, email or message - so a no-JS or
assistive-technology user gets no native constraint and incomplete submissions are only caught client-side by react-hook-form.
Audit C also asks to confirm the leading input named `website` is a honeypot properly hidden from real users and from
assistive technology (LeadForm.tsx renders it with a visible <label>Leave this empty</label> and tabIndex=-1).

## 1. Description (normative)

- 1.1 Every required field SHALL carry the native `required` attribute and `aria-required`, in addition to the existing schema validation.
- 1.2 Server-side validation SHALL remain authoritative: the API SHALL reject an incomplete or malformed payload with a specific error, regardless of what the client sent.
- 1.3 The honeypot field SHALL be hidden from sighted users and from assistive technology (`aria-hidden`, off-screen or hidden, `tabIndex=-1`, `autocomplete="off"`) and SHALL NOT be announced by a screen reader.
- 1.4 A submission that fills the honeypot SHALL be discarded server-side and SHALL NOT reach any sink.
- 1.5 Error messages SHALL be associated with their field (`aria-describedby`) and announced, in EN and VN.

## 2. Acceptance criteria

- [ ] AC for 1.1 - required and aria-required present on name, email and message - test: `cta/form-required-attrs`
- [ ] AC for 1.2 - the API rejects a payload missing email with a 400 and a named error - test: `api/lead-validation`
- [ ] AC for 1.3 - axe reports the honeypot as not exposed; a screen-reader snapshot omits it - test: `check:a11y:routes`
- [ ] AC for 1.4 - a honeypot-filled payload reaches no sink - test: `api/lead-honeypot`
- [ ] AC for 1.5 - errors are announced and associated, both locales - test: `a11y/form-errors`

## 3. Edge cases

- A no-JS submit must produce a usable native validation experience.
- Consent checkbox: required, and its refusal must not silently submit.
- A legitimate visitor whose autofill fills the honeypot - keep the field name unattractive to autofill.

## 4. Out of scope / non-goals

- Rate limiting (TASK-CHAR-029).

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
- A lead is never accepted without the consent checkbox (PDPL).
