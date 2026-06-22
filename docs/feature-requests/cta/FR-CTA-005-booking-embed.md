---
id: FR-CTA-005
title: "Calendar booking embed for high-intent leads"
module: CTA
priority: SHOULD
status: planned
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CTA-001]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture)"
---

## §1 Requirement (BCP-14 normative)

High-intent leads MUST be able to book a call without leaving the page, and the
embed MUST load in a privacy-conscious way.

1. A booking embed (for example Calendly) MUST appear after a high-intent action
   (such as selecting a sales or demo intent), not on first paint.
2. The third-party script MUST load only after explicit user action or consent;
   it MUST NOT run before the consent gate from FR-CTA-001 is cleared.
3. The booking provider URL or key MUST come from `process.env` and MUST NOT be
   hard-coded in the client bundle.
4. The booking section MUST ship English and Vietnamese copy (EN: "Book a call."
   / VN: "Dat lich goi.") and MUST keep a non-embed fallback link.

## §2 Acceptance

- No booking script loads until the user opts in.
- A high-intent lead can reach a working booking flow on the page.

## §3 Evidence

Not yet implemented; acceptance pending build.
