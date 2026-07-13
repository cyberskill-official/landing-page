---
id: FR-OPS-012
title: "Cookieless session replay (Microsoft Clarity), env-gated"
status: done
class: improvement
priority: COULD
owner: mixed
depends_on: [FR-OPS-013]
routed_back_count: 0
awh: N/A
traces_to: [growth/MEAS-02]
---

# FR-OPS-012: Cookieless session replay (Microsoft Clarity), env-gated

## 0. Why (evidence)

Ten session replays teach more about where a cinematic scroll page loses people than a month of aggregates. The growth
backlog scoped Clarity in cookieless mode, env-gated so it is inert without a project id.

## 1. Description (normative)

- 1.1 The Clarity snippet SHALL load only in production, only when NEXT_PUBLIC_CLARITY_ID is set, only in cookieless mode, and only after the consent gate (FR-OPS-013) allows it.
- 1.2 It SHALL load after first interaction or idle and SHALL NOT regress the LCP, TBT or third-party budgets.
- 1.3 Masking SHALL be configured so form field contents and chat transcripts are never captured.

## 2. Acceptance criteria

- [ ] AC for 1.1 - with no env var, no Clarity request is made - test: `analytics/clarity-env-gate`
- [ ] AC for 1.2 - budgets stay green with Clarity enabled - test: `lighthouse:mobile-perf`
- [ ] AC for 1.3 - form inputs and chat text are masked in the recorded payload - test: `analytics/clarity-masking`

## 3. Edge cases

- Clarity must never record the Lumi chat content (it can contain a visitor's business details).
- Preview deployments must not record.

## 4. Out of scope / non-goals

- Replacing Vercel Analytics.

## 5. Protected invariants this FR must not weaken

- No visitor's typed content is ever recorded or transmitted to a third party.
- AGENTS.md §4.7: the CI performance budget (lighthouse/budget.json) is never relaxed to make a gate green.
