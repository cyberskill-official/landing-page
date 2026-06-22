---
id: NFR-SEC-001
category: Security
priority: MUST
status: enforced
owner: Stephen Cheng
created: 2026-06-22
---

## Requirement

No secret reaches the browser. `ANTHROPIC_API_KEY` and every other key live in
server-side environment variables only and are never exposed through a
`NEXT_PUBLIC_` name. The serverless proxy (`/api/genie`) enforces input
validation and per-IP rate limiting before calling upstream. The app sets a
baseline of security headers.

## Verification

A grep confirms no `NEXT_PUBLIC_` name carries a secret. `/api/genie` reads keys
from `process.env` at request time on the server. `.env.example` documents the
split between server-only and public variables (FR-CHAR-010).

## Current status

The keyless design is in place: the client calls the proxy, the proxy holds the
key server-side, and validation plus rate limiting are wired. Header delivery and
the no-leak grep are confirmed statically; a live header audit is deferred to the
operator.
