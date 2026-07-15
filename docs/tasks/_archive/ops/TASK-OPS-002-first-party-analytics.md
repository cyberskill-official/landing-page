---
id: TASK-OPS-002
title: "First-party cookieless analytics for funnel events"
module: OPS
priority: COULD
status: done
class: product
verify: T
phase: P4
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [TASK-CTA-001, TASK-CHAR-012]
blocks: []
source_pages:
  - "research doc §G (privacy, no third-party scripts), §L (funnel events)"
new_files:
  - app/api/analytics/route.ts
  - lib/analytics.ts
modified_files:
  - components/genie/GenieOpenButton.tsx
  - components/cta/LeadForm.tsx
  - .env.example
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Funnel events MUST be measurable without cookies or third-party scripts, and the
client tracker MUST never break the page.

1. `/api/analytics` MUST validate an event-name allowlist and log accepted
   events server-side, optionally forwarding to a configured webhook.
2. A client helper MUST send events via `navigator.sendBeacon` with a
   keepalive-`fetch` fallback, and MUST never throw.
3. The `genie_open` and `lead_submitted` events MUST be wired. No cookies and no
   third-party scripts may be used.

## §2 Acceptance

- A disallowed event name is rejected by the route; an allowed one is logged
  (and forwarded if a webhook is set).
- Opening the Genie and submitting a lead each emit their event; a failed send
  is swallowed and the UI keeps working.
- No cookie is set and no third-party analytics script is loaded.

## §3 Evidence

Static: `app/api/analytics/route.ts` checks the allowlist and logs/forwards
server-side; `lib/analytics.ts` uses `sendBeacon` with a keepalive-`fetch`
fallback wrapped so it cannot throw; `GenieOpenButton.tsx` and `LeadForm.tsx`
fire `genie_open` / `lead_submitted`; `.env.example` documents the webhook.
Deferred: live event capture on the operator machine.
