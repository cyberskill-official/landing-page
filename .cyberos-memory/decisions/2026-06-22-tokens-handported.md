# DEC: Hand-port design-system tokens (Phase 0 resolution)

- Date: 2026-06-22
- Status: accepted
- Modules: DS
- Deciders: CyberOS agent (research-doc Phase 0)

## Context

The design-system doctrine (`DESIGN.md` v1.3.0) documents `@cyberskill/tokens` /
`@cyberskill/react` / `@cyberskill/style-packs`, but the research doc could not
confirm they are published to a registry this project can install from.

## Decision

Treat the design system as a source of tokens, rules, and visual doctrine, not
an installable dependency. Hand-port the anchors (Umber `#45210E`, Ochre
`#F4BA17`), the Liquid Glass five materials, depth, type, and space scales into
`--cs-*` CSS custom properties in `app/globals.css`, with the documented
fallbacks (reduced-transparency, forced-colors, no-backdrop-filter, print).

## Consequences

- Components reference `--cs-*`, never magic hex, so a future published token
  package can replace `globals.css` values without touching components.
- Open question logged: confirm whether a private registry / GitHub Packages
  feed exists; if so, switch to "consume + theme".
- APCA Lc targets (>=75 body, >=90 interactive) are an intent; colours meet
  WCAG 2.2 AA as the verifiable floor pending an APCA measurement pass.

## Related

[[FR-DS-001-token-port]] [[FR-A11Y-001-reduced-motion-lite]]
