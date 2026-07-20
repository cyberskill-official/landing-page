---
id: TASK-CHAR-027
title: "On LEAD_CAPTURED, write the lead to CRM and fire a Slack/email notification with the transcript"
status: done
class: product
priority: SHOULD
owner: agent
depends_on: [TASK-CHAR-026, TASK-OPS-010]
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-O, research-doc/section-G, growth/LEAD-02]
---

# TASK-CHAR-027: On LEAD_CAPTURED, write the lead to CRM and fire a Slack/email notification with the transcript

## 0. Why (evidence)

Research doc §O + §G. A qualified lead that never reaches a human is a lost lead, and the chat path is the one audit A rates as a genuine differentiator. The fan-out already exists in /api/lead; this task binds the chat's LEAD_CAPTURED state to it and adds the transcript so the team has the context that made the lead qualified.

## 1. Description (normative)

- 1.1 On LEAD_CAPTURED the server SHALL write the lead to the CRM of record with every collected field, the locale, the source and the UTM context.
- 1.2 The server SHALL fire a Slack or email notification carrying the conversation transcript so the team has the full context.
- 1.3 All CRM and notification credentials SHALL be read server-side only and SHALL NOT reach the client bundle.
- 1.4 A delivery failure SHALL be logged, retried best-effort, and SHALL NOT lose the lead silently nor break the chat - the total-failure alert in TASK-OPS-010 SHALL fire.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a captured lead appears in the CRM with every field, locale and source - test: `genie/crm-handoff`
- [ ] AC for 1.2 - the notification contains the transcript - test: `genie/crm-handoff`
- [ ] AC for 1.3 - no credential appears in the client bundle - test: `ci/no-public-secrets`
- [ ] AC for 1.4 - with every sink mocked to reject, the chat still completes and the alert fires - test: `lead/total-failure-alert`

## 3. Edge cases

- A transcript containing the visitor's confidential business details must not be posted to a public channel.
- A very long transcript must be truncated in the notification, never in the stored record (TASK-CHAR-028).
- A duplicate LEAD_CAPTURED (double submit) must not create two CRM records.

## 4. Out of scope / non-goals

- Provisioning the CRM endpoint (TASK-BIZ-002).

## 5. Protected invariants this task must not weaken

- AGENTS.md §4.2: the Anthropic and every other key lives only in server env; no NEXT_PUBLIC_ secret, ever.
- A captured lead is never silently lost.
