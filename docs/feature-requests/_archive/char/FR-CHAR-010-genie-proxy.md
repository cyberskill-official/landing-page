---
id: FR-CHAR-010
title: "Keyless serverless Claude proxy (/api/genie) with streaming and rate limiting"
module: CHAR
priority: MUST
status: done
class: product
verify: T
phase: P2
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-CHAR-011]
blocks: [FR-CHAR-012]
source_pages:
  - "research doc §I (conversational Genie), §G (secrets + privacy)"
new_files:
  - app/api/genie/route.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The browser MUST never see the Anthropic key; it talks only to our proxy.

1. `ANTHROPIC_API_KEY` MUST be read server-side only. The client MUST call
   `/api/genie` and MUST NOT call the Anthropic API directly.
2. The handler MUST call the Messages API with `stream: true` and MUST re-stream
   the model output to the browser as plain text chunks.
3. The handler MUST apply a per-IP, in-memory rate limit (best-effort) and MUST
   validate the request body before calling upstream.
4. When no key is configured the handler MUST return HTTP 503 so the client can
   fall back to the contact form.
5. The model id and max tokens MUST come from environment variables
   (`GENIE_MODEL`, token budget), not hardcoded.

## §2 Acceptance

- A request with the key set streams plain text back token-by-token.
- With the key unset, the route returns 503 and the UI offers the form.
- Rapid repeat requests from one IP are throttled.

## §3 Evidence

Static: `app/api/genie/route.ts` reads `process.env`, streams text, validates
input, returns 503 when keyless, and rate-limits per IP. Deferred: live stream
and throttle behaviour on the operator machine with a real key.
