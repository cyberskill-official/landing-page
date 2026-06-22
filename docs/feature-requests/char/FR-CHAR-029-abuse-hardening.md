---
id: FR-CHAR-029
title: "Harden per-IP rate limiting, input validation, and prompt-injection defence on the proxy"
module: CHAR
priority: SHOULD
status: planned
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CHAR-010]
related_frs: [FR-CHAR-011, FR-CHAR-028]
source_pages:
  - "research doc §I (conversational Genie), §G (secrets + privacy)"
---

## §1 Requirement (BCP-14 normative)

The proxy MUST resist abuse and injection beyond the best-effort baseline.

1. Per-IP rate limiting MUST be hardened with a durable store so limits hold
   across serverless instances, not only in one process.
2. The handler MUST validate and bound every request field (message length,
   history size, shape) and MUST reject anything malformed.
3. The system prompt and grounded context MUST be isolated from user input so
   prompt-injection cannot override the persona or exfiltrate instructions.
4. Abuse responses MUST fail safe: the handler MUST throttle or refuse without
   leaking internal errors, and MUST log the event.

## §2 Acceptance

- Rapid requests are throttled consistently across instances.
- Malformed or oversized requests are rejected before reaching upstream.
- An injection attempt does not change Lumi's persona or reveal the prompt.

## §3 Evidence

Not yet implemented; acceptance pending build.
