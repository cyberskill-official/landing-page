# DEC: Motion tokens (DS-009) + GEO service schema (SEO-007)

- Date: 2026-06-22
- Status: accepted
- Modules: DS, SEO
- Deciders: Stephen Cheng (operator: "do both"), agent

## Context

After draining the no-input-needed queue, the two remaining pure-build items were
FR-DS-009 (motion tokens) and FR-SEO-007 (GEO). Stephen said to do both.

## Decision

- FR-DS-009 (shipped): the motion scale lives once in `:root` (`--cs-ease`,
  `--cs-dur-fast`/`--cs-dur`/`--cs-dur-slow`, plus `--cs-dur-scroll` and
  `--cs-dur-shimmer`). All CSS transitions already referenced the tokens; the last
  hardcoded value (skeleton `1.4s ease`) now uses `var(--cs-dur-shimmer) linear`.
  The 3D scene reads the same scale: `lib/motion/tokens.ts` `readDurationSeconds`
  parses `--cs-dur-scroll` and `lib/scroll/lenis-gsap.ts` passes it to Lenis as the
  smooth-scroll `duration`. Under `prefers-reduced-motion` the UI duration tokens
  collapse to `0.01ms`, while `--cs-dur-scroll` is left intact so the always-on
  storytelling motion (a prior explicit decision) is unaffected.
- FR-SEO-007 (shipped): `components/seo/ServicesJsonLd.tsx` emits an `OfferCatalog`
  of `Service` entries from the existing `site.ts` service facts, provided by the
  `#organization` node, localized, on the home page. The DOM Services lead summary,
  one-sentence service definitions, and FAQ-matching-JSON-LD already satisfied the
  prose clauses; this adds the citable structured layer.

## Consequences

- BACKLOG totals: 39 shipped / 1 hold / 53 planned. DS shipped 3, SEO shipped 8.
- Verified in a clean Linux build: tsc clean, vitest 32/32 (2 new motion-token
  tests), next lint clean, next build rc=0 (26/26 pages). Pushed; Vercel redeploys.
- Behaviour note: the smooth-scroll duration is now token-driven (1100ms via
  `--cs-dur-scroll`), close to the prior Lenis default; fails closed to 1.1s if the
  token is unreadable.
- Honesty note: FR-SEO-007 is realized on the home page's Services section, not a
  standalone `/services/[slug]` page (that is FR-WEB-008, still planned); the
  per-service leading-summary page lands when WEB-008 ships.
- With these two, the pure-build queue with no decision/asset/service/content
  dependency is now drained; remaining planned FRs need Stephen's input.

## Related

[[FR-DS-009-motion-tokens]] [[FR-SEO-007-geo-ai-answers]] [[2026-06-22-always-motion-override]] [[FR-WEB-008-services-detail-pages]]
