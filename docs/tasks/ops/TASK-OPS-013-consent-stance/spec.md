---
id: TASK-OPS-013
title: "Decide and implement the consent stance before any non-cookieless tag ships"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-A/section-8, growth/NURT-09, audit-C/ui-ux]
---

# TASK-OPS-013: Decide and implement the consent stance before any non-cookieless tag ships

## 0. Why (evidence)

The site is genuinely cookieless today, which is why it defensibly ships no banner - but it already loads Google Tag
Manager, and audit A's PDPL analysis (Law 91/2025/QH15, effective 1 Jan 2026, consent-centric, fines to 5% of prior-year
revenue for cross-border transfer breaches) means the stance must be deliberate and written down before any pixel,
replay tool or retargeting tag is added.

## 1. Description (normative)

- 1.1 A decision record SHALL state: what triggers the need for consent (any non-cookieless tag, any pixel, any replay tool), the chosen mechanism, and the PDPL/GDPR reasoning.
- 1.2 A consent gate SHALL be implemented as a typed API that every optional tag must call before loading; tags SHALL default to not loading.
- 1.3 The privacy page SHALL describe exactly the tags that can load and under what condition, in EN and VN.
- 1.4 The Lumi chat's cross-border transfer to Anthropic SHALL be disclosed at the point of use, with the existing consent affordance verified against the PDPL requirement.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the decision record exists and names the trigger conditions - test: `docs/consent-decision-record`
- [ ] AC for 1.2 - a tag that skips the gate fails typecheck or CI - test: `analytics/consent-gate`
- [ ] AC for 1.3 - the privacy page and the shipped tag set agree - test: `content/privacy-analytics-parity`
- [ ] AC for 1.4 - the chat discloses the Anthropic transfer before the first message is sent, EN and VN - test: `genie/transfer-disclosure`

## 3. Edge cases

- EU visitors (GDPR) and VN visitors (PDPL) may need different defaults - the gate must support per-region rules.
- A consent banner would itself hurt CWV - it must be lightweight and only render when a gated tag exists.

## 4. Out of scope / non-goals

- The formal PDPL legal review (TASK-BIZ-012).

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.2: the Anthropic key lives only in server env; no NEXT_PUBLIC_ secret, ever.
- Personal data is never transferred cross-border without a disclosed, recorded basis.
