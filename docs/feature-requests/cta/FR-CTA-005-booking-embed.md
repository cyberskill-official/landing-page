---
id: FR-CTA-005
title: "Calendar booking embed for high-intent leads"
module: CTA
priority: SHOULD
status: ready_to_implement
class: product
verify: T
phase: P6
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: [FR-CTA-001]
blocks: []
source_pages:
  - "research doc §D (conversion + lead capture)"
routed_back_count: 0
awh: N/A
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

## Addendum - 2026-07-11 audits

Scope confirmed by the migrated growth task CONV-02: this is a **link, not an
embed**. A third-party booking iframe would cost page weight, a consent surface and
a CSP allowance (FR-OPS-009) for a page that is already fighting a mobile
performance problem (FR-PERF-008).

- Render a "Book a 30-minute call" secondary action in the contact section and on
  the thank-you panel (FR-CTA-010), opening the booking URL in a new tab.
- Gate it on `NEXT_PUBLIC_BOOKING_URL`: the button renders only when the URL is set.
- Emit `booking_clicked` (FR-OPS-011). EN and VN labels ship together.
- The booking account and the URL are the owner's to supply (FR-BIZ-013).

Traces: growth/CONV-02, audit-A/section-9.
