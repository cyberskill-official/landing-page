---
id: FR-BIZ-002
title: "Deploy the CyberOS lead-intake endpoint and wire the webhook"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: human
depends_on: [FR-BIZ-001, FR-BIZ-016]
routed_back_count: 0
awh: N/A
traces_to: [growth/LEAD-02]
---

# FR-BIZ-002: Deploy the CyberOS lead-intake endpoint and wire the webhook

## 0. Why (evidence)

CyberOS is the intended durable system of record for leads. Until it is live there is no queryable lead store, only email
and Slack - which is where leads go to be forgotten.

## 1. Description (normative)

- 1.1 The CyberOS lead-intake endpoint SHALL be reviewed, merged and deployed, with shared-secret authentication (platform capability FR-BIZ-016).
- 1.2 LEAD_CRM_WEBHOOK_URL and LEAD_CRM_TOKEN SHALL be set in Vercel production and the landing page redeployed.
- 1.3 A POST from the production site SHALL return 2xx and the lead row SHALL be visible in CyberOS as the **primary system of record**.
- 1.4 The forwarded payload SHALL carry intent, source, locale and UTM fields unchanged (FR-OPS-011).
- 1.5 Local `lib/db` persistence (FR-OPS-005/014) remains best-effort dual-write / fail-open buffer (FR-OPS-020); it SHALL NOT replace CyberOS as the CRM of truth when CyberOS is configured.

## 2. Acceptance criteria

- [ ] AC for 1.1 - the endpoint is live and rejects an unauthenticated POST - evidence: request log
- [ ] AC for 1.2 - a production lead appears in CyberOS within seconds - evidence: FR-BIZ-003
- [ ] AC for 1.3 - the payload fields survive the hop - test: `api/lead-intent-routing`
- [ ] AC for 1.4 - the CyberOS record shows intent, source, locale and utm_* exactly as submitted - test: `api/lead-intent-routing`
- [ ] AC for 1.5 - dual-write behaviour is documented and fail-open - test: `lead/dual-write` (FR-OPS-020)

## 3. Edge cases

- The shared secret rotating must not silently drop leads (FR-OPS-010 alerts on it).
- A CyberOS outage must not fail the visitor's submission.

## 4. Out of scope / non-goals

- Building the CyberOS platform product itself (FR-BIZ-016).
- One-time historical migration of local leads (FR-OPS-020).

## 5. Protected invariants this FR must not weaken

- Secrets live only in server env; no NEXT_PUBLIC_ secret, ever.
- A submitted lead is never silently lost.
