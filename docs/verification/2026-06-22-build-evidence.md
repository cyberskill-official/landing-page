# Build evidence - 2026-06-22

Session: `auto/landing-page-cyberos`. This is the honest evidence ledger for the
awh testing-to-done gate (AGENTS.md §5). It records what was verified in the
build environment and what is deferred to the operator's machine. It does not
claim a green `next build` that was not run.

## Environment constraint

The build ran in a sandbox with Node 22 and create-but-limited filesystem access
to the repo, and without a full dependency install (no `pnpm`/`npm install` of
the Next + R3F + three + GSAP tree, and no network to the npm registry for it).
So `tsc --noEmit` and `next build` could not run here. Authoring used the file
tools; git commits ran against the real repo.

## Verified here (static)

- Import integrity: `scripts/verify-static.mjs` scanned all source files and
  found 0 unresolved `@/` path-alias imports.
- JSON validity: `package.json`, `tsconfig.json`, `lighthouse/budget.json` parse.
- Structure: App Router tree is coherent - root layout owns `<html>`, `[lang]`
  routes carry `generateStaticParams` for en/vi, API route handlers export POST.
- Progressive-enhancement wiring: the 3D scene is imported only through a
  `dynamic(..., { ssr: false })` boundary that fails closed; the chat panel is
  likewise lazy. Neither is on the first-paint path.
- Secret hygiene: `ANTHROPIC_API_KEY` is read only in `app/api/genie/route.ts`
  (server). No `NEXT_PUBLIC_` secret exists. `.env.example` documents the split.
- Bilingual coverage: `lib/i18n/dictionaries.ts` defines every UI key for both
  `en` and `vi`; structured content carries `{en, vi}` pairs.
- CyberOS artifacts: 16 FRs + 5 NFRs authored; every BACKLOG link resolves;
  decision records and awh logs written.

## Deferred to the operator (must run before launch)

1. `npm install && npm run typecheck && npm run build` - confirm a clean type
   pass and production build. This is the real "green" gate.
2. Route smoke test: `/`, `/en`, `/vi`, `/en/work`, `/en/careers`, `/en/lite`,
   404 on an invalid locale.
3. Lumi chat with a real `ANTHROPIC_API_KEY`: streaming reply, rate-limit and
   503-fallback behaviour, persona grounding, EN/VN mirroring.
4. Lead form end to end: validation, honeypot, consent, Slack/CRM fanout.
5. Performance: Lighthouse on mobile emulation against `lighthouse/budget.json`;
   confirm LCP < 2.5s with the hero text as the LCP element.
6. Accessibility: axe + manual VoiceOver/NVDA; reduced-motion and `/lite` paths;
   an APCA Lc measurement pass on the rendered glass surfaces.
7. Seal the BRAIN binlog with the CyberOS memory tooling (`cyberos --store
   .cyberos-memory doctor`) so the decision-record chain anchors are genuine.

## awh gate result

Recorded in `.awh/promotion-log.jsonl`: 15 PROMOTE (Phases P0-P3 anchor slices,
static gate passed) and 1 HOLD (`FR-CHAR-021`, the commissioned GLB, blocked on
the art asset). Net: the implemented slices pass the static gate; the build
gate (items 1-6 above) is the operator's to run.
