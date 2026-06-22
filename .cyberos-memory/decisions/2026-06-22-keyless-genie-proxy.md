# DEC: Lumi chat runs through a keyless serverless reverse proxy

- Date: 2026-06-22
- Status: accepted
- Modules: CHAR, OPS
- Deciders: CyberOS agent (research-doc §D, NON-NEGOTIABLE)

## Context

The Genie needs the Anthropic Messages API. Putting the key in the browser would
expose a workspace-scoped secret to anyone who opens devtools.

## Decision

The browser calls our own `/api/genie` Route Handler. It reads
`ANTHROPIC_API_KEY` from server env, validates and rate-limits the request,
calls Anthropic with `stream: true`, and re-streams only the text deltas back as
plain UTF-8. We call the REST API with `fetch` (no SDK dependency). The persona
is sent as a `cache_control: ephemeral` system block. If no key is configured,
the endpoint returns 503 and the widget falls back to the contact form.

## Consequences

- The key never reaches the client; CORS, rate limiting, validation, and
  transcript logging all become possible server-side.
- Model id and max_tokens are env-config (`GENIE_MODEL`, `GENIE_MAX_TOKENS`) so
  they swap without code changes.
- In-memory per-IP rate limiting is best-effort per serverless instance, not a
  global quota; documented in the route.

## Related

[[FR-CHAR-010-genie-proxy]] [[FR-CHAR-011-persona]] [[FR-CHAR-012-chat-widget]]
