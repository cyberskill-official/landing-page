---
id: FR-CTA-018
title: "True capacity line near the contact heading"
status: ready_to_implement
class: improvement
priority: COULD
owner: mixed
depends_on: [FR-BIZ-013]
routed_back_count: 0
awh: N/A
traces_to: [growth/CONV-09]
---

# FR-CTA-018: True capacity line near the contact heading

## 0. Why (evidence)

Honest scarcity ("we start at most N new projects per quarter; next open slot: <month>") nudges a decision without pressure
tactics - and only works if it is true.

## 1. Description (normative)

- 1.1 A capacity config (projects per quarter, next open slot) SHALL render near the contact heading in both locales.
- 1.2 The line SHALL be hidden entirely when the config is unset or stale (older than one quarter).
- 1.3 The values SHALL be the owner's true numbers, reviewed quarterly.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the line renders from config, both locales - test: `content/capacity-line`
- [ ] AC for 1.2 - unset or stale config renders nothing - test: `content/capacity-line`
- [ ] AC for 1.3 - the rendered values equal the owner's recorded numbers (FR-BIZ-013) and carry a review date - test: `content/commercial-policy-record`

## 3. Edge cases

- A stale 'next open slot' in the past is worse than no line - the staleness guard is mandatory.

## 4. Out of scope / non-goals

- A booking calendar (FR-CTA-005).

## 5. Protected invariants this FR must not weaken

- Nothing published may claim a fact, metric, credential or client the company cannot evidence.
- AGENTS.md §4.5 Vietnamese-first: every user-facing string ships EN and VN in the same commit.
