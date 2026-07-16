---
id: TASK-BIZ-001
title: "Configure the lead sinks: Resend domain, API key, Slack webhook"
status: done
class: improvement
priority: MUST
owner: human
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [growth/LEAD-01, audit-A/section-9]
---

# TASK-BIZ-001: Configure the lead sinks: Resend domain, API key, Slack webhook

## 0. Why (evidence)

app/api/lead/route.ts fans out to Resend, Slack and a CRM webhook, all of which no-op until their env vars exist - so in
production a lead exists only as a console line in the Vercel function logs. Every conversion task in this backlog depends on
this being true first.

## 1. Description (normative)

- 1.1 The cyberskill.world sending domain SHALL be added and verified in Resend, with the SPF, DKIM and DMARC DNS records published.
- 1.2 RESEND_API_KEY (and LEAD_EMAIL_FROM if the default is not wanted) SHALL be set in the Vercel production environment; preview SHALL use a separate key or none (TASK-OPS-004).
- 1.3 LEAD_SLACK_WEBHOOK_URL SHALL be set if Slack notification is wanted. **Operator decision 2026-07-15: Slack is not used; CyberOS internal chat is the team notification path. Unset is intentional.**
- 1.4 The project SHALL be redeployed so the environment takes effect, and the change SHALL be recorded.

## 2. Acceptance criteria

- [x] AC for 1.1 - the Resend domain shows verified and SPF/DKIM/DMARC resolve in DNS - evidence: DNS lookup recorded
- [x] AC for 1.2 - the env vars are present in Vercel production and absent from the client bundle - test: `ci/no-public-secrets`
- [x] AC for 1.3 - Slack optional and declined (CyberOS chat); email path configured via Resend - evidence: `docs/verification/task-biz-001-lead-sinks-2026-07-15.md`
- [x] AC for 1.4 - the production deployment carries the new env and the change is recorded with a date - evidence: deployment record

## 3. Edge cases

- A key committed to the repo is a security incident - the keyless-secrets NFR (NFR-SEC-001) governs.
- A preview deployment must never email a real lead.

## 4. Out of scope / non-goals

- Code changes to the route (TASK-OPS-010).

## 5. Protected invariants this task must not weaken

- Secrets live only in server env; no NEXT_PUBLIC_ secret, ever.
- A submitted lead is never silently lost.
