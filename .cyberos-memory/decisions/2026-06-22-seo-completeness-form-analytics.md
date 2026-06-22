# DEC: SEO completeness + form analytics sprint

- Date: 2026-06-22
- Status: accepted
- Modules: SEO, CTA
- Deciders: Stephen Cheng (operator), agent (judgment call)

## Context

After the accessibility/privacy sprint, the operator said to continue into the
next cluster and pointed at the remaining SEO and CTA items as the best value.
The buildable, no-external-dependency subset was SEO completeness plus the
first-party form-funnel events.

## Decision

Shipped four FRs in one verified increment:

- FR-SEO-009: a shared `lib/seo/metadata.ts` `pageMetadata()` helper that builds
  canonical, hreflang, OpenGraph, and Twitter from caller content.
- FR-SEO-005: applied the helper to work, work/[slug], careers, privacy, and
  accessibility so each declares one canonical and a full en/vi/x-default
  hreflang set; the home route already got the same set from the `[lang]` layout.
- FR-SEO-008: a per-case-study `opengraph-image.tsx` rendering the case title,
  client, and brand mark at 1200x630 with system fonts; the root OG image stays
  the safe default.
- FR-CTA-009: `form_start`, `lead_submitted`, and `lead_abandoned` events from
  the lead form, through the existing cookieless `/api/analytics` layer.

## Consequences

- BACKLOG totals move to 34 shipped / 1 hold / 58 planned. Per-module shipped:
  SEO 7, CTA 4.
- Verified in a clean Linux build: tsc clean, vitest 21/21 (3 new metadata
  tests), next lint clean, next build rc=0 with 26/26 pages and the case-study
  OG route registered. Pushed to GitHub; Vercel redeploys from main.
- Two honest scope notes carried in the FR evidence: FR-SEO-005 and FR-SEO-008
  ship for case studies and static routes only, because the insights route does
  not exist yet (insights content FRs remain planned).
- Judgment call to confirm: FR-CTA-009 fires `form_start` on first focus, before
  the lead-data consent checkbox is ticked. The events are cookieless and carry
  no personal data (only `{ source }`), matching the anonymous analytics in the
  privacy notice, so they are treated as outside the contact-data consent. If you
  want analytics gated behind an explicit tracking consent, that is a separate
  decision.

## Related

[[FR-SEO-005-hreflang-completeness]] [[FR-SEO-008-og-images]] [[FR-SEO-009-meta-templates]] [[FR-CTA-009-form-abandonment]] [[FR-OPS-002-first-party-analytics]] [[FR-SEO-001-discoverability]]
