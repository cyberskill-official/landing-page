---
id: TASK-CTA-007
title: "Real-time lead notification to Slack and email"
module: CTA
priority: SHOULD
status: done
class: product
verify: T
phase: P6
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-CTA-001]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture)"
modified_files:
  - app/api/lead/route.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The team MUST learn about a new lead in near real time so follow-up can start fast.

1. On each valid submission the handler MUST fan out a notification to a Slack webhook and SHOULD also send an email alert to the sales inbox.
2. The notification MUST carry enough to act on (name, company, intent, and a short message excerpt) and MUST NOT include the honeypot or raw secrets.
3. A failed notification MUST be logged and MUST NOT fail the user's submission.
4. The notification template MUST be bilingual-safe: it MUST render Vietnamese diacritics correctly and label fields in English for the internal team.

## §2 Acceptance

- A valid lead posts a readable Slack message within seconds.
- A notification outage still returns 200 to the user.

## §3 Evidence

Shipped 2026-06-22. `app/api/lead/route.ts` fans each valid submission out to three best-effort channels via `Promise.allSettled`: an email to the company inbox (`company.email` = info@cyberskill.world) through Resend (raw fetch, gated on `RESEND_API_KEY`, `reply_to` set to the lead so a reply goes straight back), the existing Slack webhook (`LEAD_SLACK_WEBHOOK_URL`), and the CRM webhook (`LEAD_CRM_WEBHOOK_URL`) (clause 1). Each notification carries name, email, company, intent, locale/source, and the full message; the honeypot submission is dropped before any notification and no secret is included (clause 2). Failures are logged per channel and the handler always returns 200, so a notification outage never breaks the user's submit (clause 3). The body is UTF-8 text with English field labels, so Vietnamese diacritics render and the internal team reads consistent labels (clause 4).

Activation note: set `RESEND_API_KEY` (and optionally `LEAD_EMAIL_FROM`, e.g. "CyberSkill <leads@cyberskill.world>" on a Resend-verified domain) in Vercel to turn the email on; until then it no-ops and the lead is still logged. Verified by tsc + lint + `next build`; the live send is confirmed once the key is set.
