---
id: TASK-OPS-011
title: "One event taxonomy across both lead paths, with UTM source capture"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [growth/MEAS-01, growth/MEAS-03, audit-A/section-9]
---

# TASK-OPS-011: One event taxonomy across both lead paths, with UTM source capture

## 0. Why (evidence)

The Lumi chat panel already emits wish_flow_started and lead_submitted (source "lumi-chat"); the classic form emits nothing, so the main funnel is invisible and audit A's "form starts vs completions" review cannot be run. There is also no UTM standard, so the external profiles and directories the reports ask for (TASK-BIZ-005) would arrive unattributed.

## 1. Description (normative)

- 1.1 A single typed event taxonomy SHALL be defined and documented: lead_submitted {source, locale}, cta_clicked {location, label}, booking_clicked, newsletter_subscribed {placement}, faq_opened {id}, chapter_reached {chapter} (once per chapter per session), form_started, form_abandoned.
- 1.2 Both lead paths (classic form and Lumi chat) SHALL emit the same events with the same schema.
- 1.3 A UTM standard SHALL be documented, utm_* params SHALL be persisted on landing (sessionStorage) and attached to the lead and subscription payloads, forwarded unchanged to the CRM.
- 1.4 No event SHALL carry personal data beyond what the lead payload already carries, and analytics SHALL remain cookieless.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the taxonomy is a typed module; an unknown event name fails typecheck - test: `analytics/event-taxonomy-types`
- [ ] AC for 1.2 - both paths emit lead_submitted with the correct source - test: `analytics/both-lead-paths`
- [ ] AC for 1.3 - a landing with utm params attaches them to a later lead payload - test: `analytics/utm-capture`
- [ ] AC for 1.4 - no event payload contains a field outside the allowlist - test: `analytics/no-pii-in-events`

## 3. Edge cases

- A visitor who arrives without UTMs: the fields are absent, not empty strings.
- Session storage cleared mid-visit.
- chapter_reached must be throttled or it floods on a scroll-heavy page.

## 4. Out of scope / non-goals

- Choosing an analytics vendor.

## 5. Protected invariants this task must not weaken

- The privacy page's cookieless, first-party claim stays true.
- AGENTS.md §4.2: the Anthropic key lives only in server env; no NEXT_PUBLIC_ secret, ever.
