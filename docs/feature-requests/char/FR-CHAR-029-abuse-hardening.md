---
id: FR-CHAR-029
title: "Harden per-IP rate limiting, input validation, and prompt-injection defence on the proxy"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: mixed
depends_on: [FR-OPS-004]
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-I, research-doc/section-G]
---

# FR-CHAR-029: Harden per-IP rate limiting, input validation, and prompt-injection defence on the proxy

## 0. Why (evidence)

Research doc §I + §G. Substantially hardened already; one item remains, and it needs a datastore the operator must provision.

Already true (verified: tsc clean, vitest 44/44, lint clean, next build rc=0):
- Input validation is a pure, unit-tested function (`parseChatRequest`, `tests/genie-validate.test.ts`, 7 cases): rejects
  non-array / empty / over-30 histories, requires the first valid message to be the user, caps each message at 4,000 chars
  and the request at 12,000, drops invalid roles, strips C0/C1 control characters.
- Prompt-injection defence: the system prompt is a structurally separate `system` block, never concatenated with user
  turns, and carries an explicit rule to treat all conversation as the visitor's words and refuse persona override or
  prompt disclosure.
- Fail-safe: 429 returns Retry-After with no internal detail; the limiter prunes expired buckets; upstream errors are
  logged server-side, not leaked.

Open: the rate limiter is per-serverless-instance, so a global limit does not hold across instances. That needs an
external KV (Vercel KV / Upstash), which is a datastore plus a secret - operator input.

## 1. Description (normative)

- 1.1 Per-IP rate limiting SHALL use a durable store so the limit holds across serverless instances, not only within one process.
- 1.2 The handler SHALL validate and bound every request field (message length, history size, shape) and SHALL reject anything malformed before it reaches upstream.
- 1.3 The system prompt and any grounded context SHALL stay structurally isolated from user input, so prompt injection cannot override the persona or exfiltrate instructions.
- 1.4 Abuse responses SHALL fail safe: the handler SHALL throttle or refuse without leaking internal errors, and SHALL log the event.

## 2. Acceptance criteria

- [ ] AC for 1.1 - rapid requests are throttled consistently when served by two different instances - test: `genie/rate-limit-durable`
- [ ] AC for 1.2 - malformed and oversized requests are rejected before upstream - test: `tests/genie-validate.test.ts`
- [ ] AC for 1.3 - a scripted injection attempt changes neither the persona nor reveals the prompt - test: `genie/injection-resistance`
- [ ] AC for 1.4 - a throttled response carries Retry-After and no internal detail, and the event is logged - test: `genie/fail-safe-429`

## 3. Edge cases

- A shared corporate IP (one office, many visitors) must not be locked out by a per-IP limit.
- The KV being down must fail closed on abuse, not open.
- An injection payload written in Vietnamese.

## 4. Out of scope / non-goals

- Provisioning the KV (FR-OPS-004 owns the env and secret scoping).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.2: the Anthropic and every other key lives only in server env; no NEXT_PUBLIC_ secret, ever.
- The persona and the system prompt are never disclosed or overridable by visitor input.
