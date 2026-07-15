---
id: TASK-CTA-001
title: "Lead-capture form (<=5 fields) with honeypot, consent, and server validation"
module: CTA
priority: MUST
status: done
class: product
verify: T
phase: P1
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-WEB-001]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture), §G (privacy + consent)"
new_files:
  - lib/lead/schema.ts
  - components/cta/LeadForm.tsx
  - app/api/lead/route.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The form MUST stay low-friction and MUST validate on the server, never trusting
the client.

1. The form MUST show at most five visible fields (name, email, company, intent,
   message) plus a required consent checkbox and a hidden honeypot field.
2. The same Zod schema MUST validate input on the client (react-hook-form) and
   again in the route handler; the server MUST reject payloads that fail.
3. A tripped honeypot MUST return a fake success (HTTP 200) and MUST NOT fan out
   to any downstream, so bots get no signal.
4. Every valid submission MUST be logged server-side. The handler SHOULD fan out
   best-effort to a Slack webhook and a CRM webhook; a failed webhook MUST NOT
   fail the user's request.
5. No secret (webhook URL or token) may reach the client bundle.

## §2 Acceptance

- Missing consent or a malformed email is rejected by the server even if the
  client check is bypassed.
- A filled honeypot yields 200 with no Slack/CRM call.

## §3 Evidence

Static: shared schema in `lib/lead/schema.ts` imported by both the form and the
route; honeypot + consent fields present; webhook reads use `process.env`.
Deferred: live POST + webhook delivery test on the operator machine.
