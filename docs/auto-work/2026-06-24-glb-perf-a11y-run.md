# Auto-work run - 2026-06-24 - branch auto/glb-perf-a11y

Branch off `main` (039573e). Three increments, each verified and committed
separately. Not deployed; awaiting review and merge.

## What shipped

Increment A - Lumi GLB drop-in readiness (commit 2b12d68)
- `components/canvas/GltfLumi.tsx`: drei `useGLTF` loader, gated by
  `NEXT_PUBLIC_LUMI_GLB`, `scene.clone` + GPU disposal on unmount, reuses the
  scroll choreography.
- `components/canvas/GenieScene.tsx`: module-scope `useGLTF.preload` (only
  evaluated via the CanvasMount dynamic import, so gated), Suspense boundary,
  conditional `GltfLumi` vs procedural `LumiPlaceholder`.
- `components/canvas/GlbBoundary.tsx`: in-canvas React error boundary - a failed
  GLB load falls back to the procedural Lumi, never throws or blanks.
- `components/canvas/LumiPlaceholder.tsx`: dispose the hand-built aura
  `ShaderMaterial` on unmount.
- `docs/3d/lumi-glb-integration.md`: enable steps + Meshy export checklist.
- FR outcome: FR-SCENE-010 shipped. FR-CHAR-022 and FR-SCENE-009 stay planned -
  their drop-in wiring and GPU disposal are in place, but the real model
  (CHAR-022) and distance LOD (SCENE-009) remain. Default (no env) keeps the
  procedural Lumi unchanged.

Increment B - served-route accessibility gate (commit 631271b)
- `scripts/axe-routes.mjs`: serves the build and drives puppeteer to run axe-core
  over `/en`, `/vi`, `/en/work`, `/en/careers`, and a case study; WCAG2 A/AA;
  fails on serious/critical; prints rule + helpUrl + selector + route.
- `npm run check:a11y:routes`; new CI job `a11y` (continue-on-error advisory,
  same staged rollout the Lighthouse gate used). `puppeteer` added as devDep.
- Proven locally without a browser (the dev sandbox is arm64 and puppeteer ships
  an x86_64 Chrome): fetched the real served-build SSR HTML for all five routes
  and ran axe in jsdom per route - all clean on structural WCAG A/AA (20-25 rules
  each, zero serious/critical). color-contrast is covered by the CI Chrome job
  plus the APCA tooling.
- FR outcome: FR-A11Y-003 stays planned until the job is observed green on x86_64
  CI and flipped to required.

Increment C - bundle analysis + code-split audit (commit f0db578)
- `next.config.ts`: `@next/bundle-analyzer`, `ANALYZE`-gated; `npm run analyze`
  emits `.next/analyze/{client,nodejs,edge}.html`. Off by default.
- `docs/perf/bundle-audit.md`: first-load and 3D async chunk tables with
  parsed/gzip sizes and totals, for regression comparison against `check:assets`.
- Analyzer-proven: the first-load shared chunks carry no `three`/`@react-three`/
  `gsap`; the 3D stack (about 304 KB gzip) is split into async chunks loaded only
  when CanvasMount dynamically imports the scene. First Load JS stays 176 KB.
- FR outcome: FR-PERF-004 shipped.

## Verification (each increment)

tsc clean; vitest 52/52; `next lint` clean; `next build` green (and a GLB-set
build for increment A); `check:assets` within budget. Sandbox build dir
`/tmp/lp-build` on linux node_modules.

## Backlog

56 shipped / 1 hold / 36 planned (was 54/1/38 at the start of this run).

## Follow-ups for the operator

1. Push `auto/glb-perf-a11y`; confirm the build job is green and watch the new
   advisory `a11y` job's first run on x86_64 CI.
2. Once the `a11y` job is green on CI, flip it to a required gate (remove
   `continue-on-error`) and move FR-A11Y-003 to shipped.
3. Lumi model: when the Meshy GLB is ready, drop it at `public/models/lumi.glb`,
   set `NEXT_PUBLIC_LUMI_GLB`, redeploy; then FR-CHAR-022 can move to shipped and
   FR-SCENE-009 LOD can be revisited against the real geometry.
