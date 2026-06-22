---
id: FR-WEB-004
title: "Accept-Language negotiation for the bare / entry"
module: WEB
priority: SHOULD
status: planned
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-WEB-001]
source_pages:
  - "research doc §E (Vietnamese-first, locale), §F (Next.js App Router)"
modified_files:
  - middleware.ts
---

## §1 Requirement (BCP-14 normative)

The bare `/` entry SHOULD send a first-time reader to the locale that fits their
browser, while keeping the explicit switcher choice authoritative.

1. Middleware SHOULD parse the `Accept-Language` header on requests to `/` and
   redirect to `/en` or `/vi` by best match, defaulting sensibly when neither is
   preferred.
2. An explicit locale choice from the switcher MUST override negotiation on later
   visits, so a returning reader is not re-routed against their selection.
3. Negotiation MUST only choose among supported locales `{en, vi}` and MUST never
   produce an unsupported `lang`.

## §2 Acceptance

- A browser preferring Vietnamese hitting `/` lands on `/vi`; one preferring
  English lands on `/en`.
- After choosing a locale in the switcher, `/` honors that choice over the header.

## §3 Evidence

Not yet implemented; acceptance pending build.
