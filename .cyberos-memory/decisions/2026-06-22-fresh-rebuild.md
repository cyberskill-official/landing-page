# DEC: Rebuild the landing page fresh from the research doc

- Date: 2026-06-22
- Status: accepted
- Modules: OPS, WEB
- Deciders: Stephen Cheng (operator, explicit), CyberOS agent

## Context

A large prior implementation (~1050 files: pnpm monorepo, apps/web, a "Lumi"
scene, FR/audit docs) existed at commit `1006aef` but was wiped by commit
`ceac2a9 reset` on 2026-06-19. `main` and `codex/cyberskill-storytelling-landing`
now hold only the research doc. The prior tree is recoverable from git history.

## Decision

Start fresh, strictly to the PRD/SRS research doc, on branch
`auto/landing-page-cyberos`. Do not restore the reset tree. The reset was
deliberate; the operator chose a clean rebuild over recovery.

## Consequences

- No inherited baggage; the codebase maps 1:1 to the research doc phases.
- Prior effort is not reused; the conventions (module catalogue, FR format,
  Lumi name, stack) are honoured so the rebuild is recognisably CyberSkill.
- The reset commit remains in history if recovery is ever wanted.

## Related

[[FR-WEB-001-app-shell-i18n]] [[FR-DS-001-token-port]]
