# DEC: Brand imagery via Adobe Stock + next/image pipeline (WEB-009)

- Date: 2026-06-22
- Status: accepted
- Modules: WEB
- Deciders: Stephen Cheng (operator), agent

## Context

Stephen asked for AI-generated brand imagery. The Adobe connector in this
environment explicitly does not support Firefly text-to-image (its routing doc
lists generation as unavailable here), and no other connected tool produces
downloadable raster images. Offered the workable paths; Stephen chose Adobe Stock
end-to-end.

## Decision

Searched Adobe Stock (`asset_search`, StockAsset), inspected candidates by
downloading their public thumbnails, and picked asset 165569117 - a dark gold
particle wave with a warm light ray, which mirrors Lumi's glow and the
Umber/Ochre palette. Licensed it (`asset_license_and_download_stock`), downloaded
the full-res (slow S3, resumed in chunks), resized to 2000px (98 KB), and
committed it at `public/brand/aurora-gold.jpg`. Wired it through `next/image`
(static import -> blur placeholder + intrinsic dimensions, `sizes="100vw"`,
`fill`, no CLS) as the contact-section backdrop, shown only in dark theme at 0.28
opacity, hidden in light theme. This both delivers real on-brand imagery and
establishes the FR-WEB-009 image pipeline.

## Consequences

- BACKLOG totals: 43 shipped / 1 hold / 49 planned. WEB shipped 7.
- Verified: tsc clean, vitest 37/37, next lint clean, next build rc=0 (the image
  optimizer ran). Pushed; Vercel redeploys.
- Honest notes: this is licensed stock, not AI-generated (Firefly text-to-image
  is not available through this connector). It is one decorative backdrop; the
  same next/image pattern can extend to work-card and per-service imagery when
  those assets exist. As with the scene work, the live composite is confirmed on
  the deploy, since the dev screenshot tool cannot capture the animating page.
- Tooling note for future runs: Adobe Stock S3/CDN egress is very slow from the
  sandbox; download with resumable chunked curl.

## Related

[[FR-WEB-009-image-pipeline]] [[FR-SEO-008-og-images]] [[cyberskill-brand-assets]]
