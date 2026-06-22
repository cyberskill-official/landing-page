# DEC: Single Next.js app at repo root, not a pnpm monorepo

- Date: 2026-06-22
- Status: accepted
- Modules: OPS
- Deciders: CyberOS agent (operator informed)

## Context

The prior build was a pnpm workspace with a `@cyberskill/ds-cinematic` package
and `apps/web`. The research doc only requires one deployable site.

## Decision

Ship a single Next.js App Router app at the repository root. Author design tokens
and component styles in `app/globals.css` rather than a separate package.

## Consequences

- Fewer moving parts; `npm install && npm run build` with no workspace wiring.
- Lower risk for an environment that cannot run a full install during authoring.
- If a shared DS package is later published, tokens can move into it without
  changing component code (everything reads `--cs-*` custom properties).

## Related

[[FR-DS-001-token-port]] [[FR-OPS-001-ci-perf-gate]]
