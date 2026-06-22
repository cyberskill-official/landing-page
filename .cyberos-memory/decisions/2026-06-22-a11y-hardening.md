# DEC: Accessibility hardening (forced-colors shipped, axe gate started)

- Date: 2026-06-22
- Status: accepted
- Modules: A11Y
- Deciders: Stephen Cheng (operator), agent (judgment call)

## Context

Continuing the autonomous FR run, the next clean, buildable cluster was the
accessibility hardening pair: forced-colors / high-contrast support, and
automated axe checks in CI.

## Decision

- FR-A11Y-007 (shipped): extended the `@media (forced-colors: active)` block in
  `globals.css` so the keyboard focus ring uses `Highlight`, glass surfaces stay
  opaque and bordered, and buttons, inputs, the chat panel, the persistent CTA,
  tags, and process steps keep a system-colour border. Everything uses CSS
  system-colour keywords and is scoped to the media query, so default themes are
  untouched.
- FR-A11Y-003 (kept planned, partial): added a real automated axe gate that runs
  in the existing CI test job. `tests/axe.test.ts` renders TrustBand, Faq, and
  SiteFooter to server markup in jsdom and runs `axe-core` for `en` and `vi`,
  failing on any violation. This required `axe-core` + `jsdom` devDeps and a
  vitest config change (`esbuild: { jsx: "automatic" }`) so component JSX renders
  in tests without a React global.

## Consequences

- BACKLOG totals: 35 shipped / 1 hold / 57 planned. A11Y shipped count is 4.
- Verified in a clean Linux build: tsc clean, vitest 23/23 (including 2 new axe
  tests), next lint clean, next build rc=0 (26/26 pages).
- Honesty call: FR-A11Y-003 stays planned rather than shipped. Its acceptance
  requires axe across full rendered routes (home, /work, /careers, a case study)
  on a served build with color-contrast and landmark rules. The component-level
  test is a down-payment, not the whole requirement, so the FR is not marked
  done. The remaining work is a served-build axe job (pa11y-ci / @axe-core/cli
  against `next start`, or Playwright + @axe-core/playwright).
- Test harness changed (new test infra + devDeps); recorded in the awh evolution
  log with `harness_changed: true`.

## Related

[[FR-A11Y-007-forced-colors]] [[FR-A11Y-003-axe-ci]] [[FR-A11Y-004-keyboard-focus]] [[FR-A11Y-008-manual-sr-pass]]
