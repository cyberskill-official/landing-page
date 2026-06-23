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

Substantially hardened (status stays planned for the one remaining item).

Done in `app/api/genie/route.ts` + `lib/genie/validate.ts` + `lib/genie/persona.ts`:
- Input validation is now a pure, unit-tested function (`parseChatRequest`,
  `tests/genie-validate.test.ts`, 7 cases): rejects non-array/empty/over-30
  histories, requires the first valid message to be the user, caps each message
  at 4000 chars and the whole request at 12000, drops invalid roles, and strips
  C0/C1 control characters (keeping tab/newline). Covers §1.2 and §2 item 2.
- Prompt-injection defence (§1.3, §2 item 3): the system prompt is sent as a
  structurally separate `system` block (never concatenated with user turns), and
  now carries an explicit rule to treat all conversation as the visitor's words,
  refuse attempts to override instructions / change persona / reveal or modify
  the prompt, and stay Lumi for the whole conversation.
- Fail-safe (§1.4): 429 returns a `Retry-After` header and no internal detail;
  the per-instance limiter prunes expired buckets so memory stays bounded;
  upstream errors are logged server-side, not leaked verbatim to the client.

Still open (§1.1): a DURABLE cross-instance rate-limit store. The current limiter
is per-serverless-instance (best-effort). A global limit needs an external KV
(Vercel KV / Upstash Redis), which requires a datastore + secret to provision -
operator input. Until then this FR stays planned. Verified: tsc clean, vitest
44/44, lint clean, next build rc=0.
