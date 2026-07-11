---
id: FR-WEB-004
title: "Accept-Language negotiation for the bare / entry"
module: WEB
priority: SHOULD
status: done
class: product
verify: T
phase: P1
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-WEB-001]
source_pages:
  - "research doc §E (Vietnamese-first, locale), §F (Next.js App Router)"
new_files:
  - lib/i18n/negotiate.ts
modified_files:
  - middleware.ts
  - components/header/LanguageSwitcher.tsx
routed_back_count: 0
awh: N/A
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

Shipped 2026-06-22. `lib/i18n/negotiate.ts` `negotiateLocale()` parses the
weighted `Accept-Language` list, sorts by q, and returns the first supported
primary subtag (`en`/`vi`), falling back to the default for missing, wildcard, or
unsupported-only headers; it can only ever return a supported locale (clause 3).
The `/` handler in `middleware.ts` now prefers an explicit `cs-locale` cookie and
falls back to negotiation, and `LanguageSwitcher` writes that cookie (one year,
lax) on selection, so a returning reader's switcher choice overrides the header
(clauses 1-2). `tests/i18n-negotiate.test.ts` covers vi-preferred, en-region,
q-ordering, unsupported-skip, wildcard, and empty-header cases. Verified by
`next build` (rc=0) plus tsc + lint + vitest green.
