---
id: FR-CTA-007
title: "Real-time lead notification to Slack and email"
module: CTA
priority: SHOULD
status: planned
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CTA-001]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture)"
---

## §1 Requirement (BCP-14 normative)

The team MUST learn about a new lead in near real time so follow-up can start
fast.

1. On each valid submission the handler MUST fan out a notification to a Slack
   webhook and SHOULD also send an email alert to the sales inbox.
2. The notification MUST carry enough to act on (name, company, intent, and a
   short message excerpt) and MUST NOT include the honeypot or raw secrets.
3. A failed notification MUST be logged and MUST NOT fail the user's submission.
4. The notification template MUST be bilingual-safe: it MUST render Vietnamese
   diacritics correctly and label fields in English for the internal team.

## §2 Acceptance

- A valid lead posts a readable Slack message within seconds.
- A notification outage still returns 200 to the user.

## §3 Evidence

Not yet implemented; acceptance pending build.
