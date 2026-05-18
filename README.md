# CyberSkill Landing Page

CyberSkill's cinematic marketing site: a Next.js 15 app with a persistent R3F canvas shell, reduced-motion `/lite` experience, Sanity-backed work routes, SEO schema, cookieless analytics, accessibility controls, and launch-ops guardrails.

Canonical production domain: `https://cyberskill.world`

Current implementation truth lives in:

- `docs/feature-requests/BACKLOG.md` for FR status and dependencies.
- `docs/qa/FR-DELIVERABLE-AUDIT-2026-05-18.md` for one-by-one deliverable checks.
- `docs/qa/FR-TASK-MANIFEST-2026-05-18.md` for the current FR state manifest and validation transition log.
- `docs/qa/FR-EXTERNAL-DEPENDENCY-PACKET-2026-05-18.md` for exact blocker payloads, credentials, approvals, and production evidence needed to unblock remaining FRs.
- `docs/product/PRD.md`, `docs/product/SRS.md`, `docs/qa/TEST-CASES.md`, and `docs/qa/TEST-COVERAGE-MATRIX.md` for product/test traceability.

Do not treat audited/spec-accepted FRs as shipped. A shipped FR must have concrete deliverables, passing tests, and live browser verification where relevant.

## 1. Requirements

- Node.js `24.x` is currently used in this workspace.
- pnpm `11.x`.
- Git LFS for source design/3D files.
- Playwright browsers installed for E2E.
- Blender 4.4 LTS is required for real P1/P2 Blender validation. If `blender` is absent, Blender-dependent FRs may only ship as `mocked-dependency` after deterministic placeholder artifacts and contract tests pass.
- KTX-Software 4.x (`toktx` + `ktx2check`) is required for physical KTX2/Basis texture encoding. If absent, `scripts/ktx2-encode.mjs` writes deterministic mock `.ktx2` contract artifacts and marks the FR as `mocked-dependency`.

Check tools:

```bash
node --version
pnpm --version
git lfs version
command -v blender || echo "Blender missing - 3D asset FRs blocked"
command -v toktx && command -v ktx2check || echo "KTX2 encoder missing - texture compression uses mocked-dependency contracts"
```

## 2. Install

```bash
git clone <repo-url>
cd landing-page
git lfs install
pnpm install
```

If dependencies are already installed, avoid unnecessary reinstalls. Use package-local binaries for verification when possible.

## 3. Run Locally

Start the web app:

```bash
cd apps/web
node_modules/.bin/next dev --turbo --hostname 127.0.0.1 --port 3000
```

Open:

- `http://127.0.0.1:3000/`
- `http://127.0.0.1:3000/vi`
- `http://127.0.0.1:3000/lite`
- `http://127.0.0.1:3000/work/sample`
- `http://127.0.0.1:3000/accessibility`

If port 3000 is occupied:

```bash
lsof -nP -iTCP:3000 -sTCP:LISTEN
cd apps/web
node_modules/.bin/next dev --turbo --hostname 127.0.0.1 --port 3001
```

Clean restart after running `next build`:

```bash
cd apps/web
lsof -tiTCP:3000 -sTCP:LISTEN | xargs -r kill
if [ -d .next ]; then find .next -mindepth 1 -maxdepth 1 -exec rm -rf {} +; fi
node_modules/.bin/next dev --hostname 127.0.0.1 --port 3000
```

Why: `next build` writes production artifacts into `.next`. Cleaning before returning to dev avoids false browser-test failures from mixed build/dev state.

Local smoke path:

1. Open `/`.
2. Tab once and verify Skip Story is focused.
3. Activate Skip Story and verify focus lands on the CTA hub.
4. Open Buy, Partner, and Join forms.
5. Submit invalid values and verify visible + announced errors.
6. Use `/lite` and `/vi/accessibility`.
7. Run the targeted Playwright spec for the feature you changed.

## 4. Environment Variables

The app has offline/fallback behavior for local development. Production integrations need explicit env vars.

Recommended local file: `apps/web/.env.local`

```bash
NEXT_PUBLIC_SITE_URL=http://127.0.0.1:3000
NEXT_PUBLIC_CALENDLY_DISCOVERY_URL=https://calendly.com/cyberskill/discovery
NEXT_PUBLIC_WEB_VITALS_SAMPLE_RATE=1

SANITY_REVALIDATE_SECRET=<local-secret>

HUBSPOT_API_KEY=<optional-local-stub-falls-back-without-this>
HUBSPOT_PIPELINE_BUY=default
HUBSPOT_STAGE_BUY=inbound-discovery
HUBSPOT_PIPELINE_PARTNER=partners
HUBSPOT_STAGE_PARTNER=partner-pipeline

ATS_API_URL=<optional>
ATS_API_KEY=<optional>

SLACK_WEBHOOK_URL=<optional>
PERF_ALERT_WEBHOOK_URL=<optional>
LEAD_ALERT_EMAIL_WEBHOOK_URL=<optional>
LEAD_ALERT_EMAIL_TO=<optional>

NEXT_PUBLIC_PLAUSIBLE_DOMAIN=cyberskill.world
PLAUSIBLE_DOMAIN=cyberskill.world
PLAUSIBLE_SITE_ID=cyberskill.world
PLAUSIBLE_API_KEY=<optional-production-only>
GA4_MEASUREMENT_ID=<optional>
GA4_API_SECRET=<optional>
```

Never commit secrets. Production values belong in Vercel project environment settings.

Local fallback behavior:

- Missing HubSpot credentials create stable local lead IDs instead of calling HubSpot.
- Missing ATS credentials create stable local candidate IDs.
- Missing Slack/email webhooks skip notifications.
- Missing GA4 credentials skip GA4 forwarding.
- Plausible forwarding still targets the Plausible events API through `/api/analytics`; use production credentials to verify the live dashboard.

## 5. Runtime Architecture

- Smooth scrolling is owned by `apps/web/components/scroll/SmoothScrollProvider.client.tsx`.
- Lenis is intentionally a singleton exposed through `apps/web/lib/lenis-singleton.ts`; scene code should consume `useScrollProgress()` or Zustand snapshots instead of creating a second Lenis instance.
- GSAP ScrollTrigger is bridged through `apps/web/lib/lenis-scrolltrigger-bridge.ts`, driven by the GSAP ticker with lag smoothing disabled.
- Scene R3F content enters the persistent canvas through `apps/web/components/canvas/SceneTunnel.client.tsx`; do not add route-level or scene-level `<Canvas>` instances.
- `SceneTunnel` owns the canonical per-scene Suspense boundary per `docs/ADR-FR-WEB-003.md`; `GlobalCanvas` itself must never suspend.
- Heavy 3D/animation imports are centralized in `apps/web/lib/dynamic-three.ts` behind `next/dynamic({ ssr: false })`; SSR routes must not import Three/R3F directly.
- Three tree-shaking is guarded by `apps/web/next.config.ts`, `apps/web/.eslintrc.imports.js`, and `apps/web/tests/unit/no-namespace-three.test.ts`; use named `three` imports only.
- Scene preloading is owned by `apps/web/components/canvas/ScenePreloader.tsx` and `apps/web/lib/scene-preload-chain.ts`; `/lumi.glb` is currently a greybox mock copied from `assets-built/optimized/lumi-greybox.glb`.
- Runtime state flows through `apps/web/lib/stores/index.ts`; feature components should use typed selectors/actions from `@/lib/stores`, while raw store imports are reserved for store files, tests, and the dev-only StoreHydrator bridge.
- Routing uses App Router plus app-local locale middleware; `docs/ADR-FR-WEB-008.md` documents the expanded `/vi`, work, team, careers, capabilities, and API surface.
- Capability gating is split between the narrow pre-hydration no-WebGL/lite-preference script documented in `docs/ADR-FR-WEB-009.md` and `apps/web/components/system/CapabilityGate.tsx` for save-data, low-memory, analytics, and `?debug=capability`.
- Scene 0 is owned by `apps/web/components/scenes/scene-0-hero/`; it SSR-renders the LCP headline/caption and uses a mocked Lumi animation contract documented in `docs/contracts/FR-SCENE-009-lumi-animation-contract.md`.
- Lumi animation playback is owned by `apps/web/components/lumi/useLumiAnimations.ts`; scene code sets typed Zustand `currentAnim`, the picker maps it to Drei `useAnimations()` actions, uses a motion-token-derived 200ms crossfade, skips crossfades for reduced motion, and records `window.__lumiAnimationEvents`. The mocked GLB/action contract is documented in `docs/contracts/FR-SCENE-010-lumi-animation-picker-contract.md`.
- Scene 0's above-fold CTA lives in `apps/web/components/scenes/scene-0-hero/Scene0CTA.client.tsx`; it uses `apps/web/components/cta/cta-events.ts` to open the existing FR-CTA-001 Buy modal, exposes `window.__ctaOpenEvents`, and is documented in `docs/ADR-FR-SCENE-011.md`.
- `/lite` and `prefers-reduced-motion: reduce` bypass Lenis entirely and use native browser scroll.
- Use `/?debug=scroll`, `/?debug=tunnel`, and `/?debug=stores` in development to inspect scroll, tunnel, and store state.

## 6. FR Workflow

1. Pick the next FR from `docs/qa/FR-DELIVERABLE-AUDIT-2026-05-18.md`.
2. If it is blocked, record why and move to the next FR.
3. If it is implementable, read the FR markdown and its `.audit.md` companion.
4. Confirm dependencies in `depends_on` are genuinely shipped, not merely accepted.
5. Implement the concrete deliverables listed in `new_files` / `modified_files`.
6. Add or update unit tests and E2E tests for the exact acceptance criteria.
7. Live-test the user-facing behavior in Chromium/Chrome.
8. Run the verification bucket for that FR before starting the next FR.
9. Update FR status only after deliverables and verification pass.
10. Regenerate the backlog/audit artifacts.

Useful commands:

```bash
node tools/audit-fr-deliverables.mjs
python3 tools/fr-graph.py
python3 tools/regen-backlog.py
```

## 7. Audit Commands

Run these from the repository root unless a command says otherwise.

FR deliverable audit:

```bash
node tools/audit-fr-deliverables.mjs
sed -n '1,170p' docs/qa/FR-DELIVERABLE-AUDIT-2026-05-18.md
```

Interpretation:

- `shipped-verified`: frontmatter says shipped and declared concrete deliverables exist.
- `blocked`: do not implement unless the blocker has changed; document the blocker and move on.
- `missing-deliverables`: implement or create real deliverables before changing status.
- `ready-for-implementation`: dependencies are satisfied but status is not shipped.

Web typecheck:

```bash
apps/web/node_modules/.bin/tsc -p apps/web/tsconfig.json --noEmit
```

Web unit/source tests:

```bash
cd apps/web
node_modules/.bin/next build
node_modules/.bin/vitest run --config vitest.config.ts
```

Why: the bundle-budget unit test reads production `.next` artifacts. Run `next build` first whenever the full web Vitest suite includes bundle budgets.

Web E2E/a11y/SEO tests:

```bash
cd apps/web
node_modules/.bin/playwright test --project=chromium
```

High-signal targeted buckets:

```bash
cd apps/web
node_modules/.bin/playwright test tests/web/scroll.spec.ts --project=chromium
node_modules/.bin/playwright test tests/web/scene-tunnel.spec.ts tests/web/stores.spec.ts --project=chromium
node_modules/.bin/vitest run lib/stores/__tests__/stores.test.ts tests/stores-guardrails.test.ts --config vitest.config.ts
node_modules/.bin/playwright test tests/a11y/all-routes.spec.ts --project=chromium
node_modules/.bin/playwright test tests/cta/lead-api.e2e.spec.ts tests/cta/partner-form.spec.ts tests/cta/buy-form.spec.ts tests/cta/join-form.spec.ts --project=chromium
node_modules/.bin/vitest run lib/forms/__tests__/use-form-retry.unit.test.ts lib/server/__tests__/hubspot-stage-router.unit.test.ts --config vitest.config.ts
node_modules/.bin/vitest run lib/perf/__tests__/rum-dashboard-config.unit.test.ts lib/perf/__tests__/web-vitals.unit.test.ts lib/analytics/__tests__/proxy.unit.test.ts --config vitest.config.ts
node_modules/.bin/playwright test tests/web/routing.spec.ts tests/seo/hreflang.e2e.spec.ts --project=chromium
node --experimental-strip-types tools/route-audit.ts
node_modules/.bin/vitest run tests/unit/capability-detection.test.ts components/perf/__tests__/SaveDataBanner.unit.test.tsx --config vitest.config.ts
node_modules/.bin/playwright test tests/web/capability-gate.spec.ts --project=chromium
node_modules/.bin/vitest run components/scenes/scene-0-hero/__tests__/scene-0.unit.test.ts components/scenes/scene-0-hero/__tests__/scene-0.client.test.tsx components/scenes/scene-0-hero/__tests__/scene-0.canvas.test.tsx --config vitest.config.ts
node_modules/.bin/playwright test tests/web/scene-0-hero.spec.ts --project=chromium
node_modules/.bin/vitest run components/lumi/__tests__/lumi-animations.unit.test.ts --config vitest.config.ts
node_modules/.bin/vitest run components/lumi/__tests__/lumi-animations.unit.test.ts --coverage --coverage.provider=v8 --coverage.include=components/lumi/useLumiAnimations.ts --coverage.include=components/lumi/Lumi.tsx --coverage.reporter=text
node_modules/.bin/vitest run components/scenes/scene-0-hero/__tests__/scene-0-cta.unit.test.tsx components/cta/__tests__/cta-open-events.unit.test.tsx --config vitest.config.ts
node_modules/.bin/playwright test tests/web/scene-0-cta.spec.ts --project=chromium
```

Asset pipeline buckets:

```bash
./node_modules/.bin/vitest run scripts/__tests__/gltf-pipeline.test.mjs
./node_modules/.bin/vitest run scripts/__tests__/ktx2-encode.unit.test.mjs
./node_modules/.bin/vitest run scripts/__tests__/sync-decoders.unit.test.mjs
node scripts/ktx2-encode.mjs --input assets-built/raw/textures/lumi-BaseColor.png --output assets-built/optimized/textures/lumi-BaseColor.ktx2 --role baseColor --mock --force --report assets-built/optimized/textures/lumi-BaseColor.ktx2.report.json
node scripts/sync-decoders.mjs --mode mock
node scripts/sync-decoders.mjs --check
```

Decoder note: `node scripts/sync-decoders.mjs --mode installed` validates the real installed Three.js decoder payload. It currently exceeds the FR-OPS-005 240 KB raw-byte budget, so checked-in `/decoders/` files are deterministic mocked-dependency contracts until that budget is amended or upstream decoder bytes shrink.

Production build:

```bash
cd apps/web
node_modules/.bin/next build
```

Repo guardrails:

```bash
node_modules/.bin/vitest run \
  .github/workflows/__tests__/*.test.ts \
  tools/perf-budgets/__tests__/*.test.ts \
  tools/perf-budgets/__tests__/*.test.mjs \
  scripts/__tests__/*.test.mjs \
  tools/cowork/recipes/__tests__/*.test.mjs \
  packages/ds-cinematic/src/**/*.test.ts \
  packages/ds-cinematic/tests/*.test.ts \
  content/narrative/**/*.test.ts \
  design/tokens/__tests__/*.test.ts \
  eslint-rules/__tests__/*.test.ts \
  eslint-rules/__tests__/*.unit.test.ts
```

Design-system package:

```bash
node_modules/.bin/tsc -p packages/ds-cinematic/tsconfig.json --noEmit
node_modules/.bin/tsc -b packages/ds-cinematic
```

LFS checks:

```bash
bash tools/__tests__/lfs-patterns.test.sh
bash tools/__tests__/lfs-output-not-tracked.test.sh
```

Asset and FR checks:

```bash
python3 tools/check-p0-frs.py
python3 tools/check-p1-greybox-assets.py
node tools/audit-fr-deliverables.mjs
node tools/perf-budgets/check-asset-sizes.mjs --report=asset-summary.json
```

Note: plain root `vitest run` is not the intended entrypoint. It collects Playwright specs as Vitest tests and bypasses `apps/web/vitest.config.ts` aliases. Use the buckets above.

## 7. Live Browser Verification

For any user-facing FR:

1. Start the dev server.
2. Run the targeted Playwright spec first.
3. Open the route in Chrome/Chromium.
4. Check keyboard flow, visible layout, mobile viewport behavior, and reduced-motion behavior.
5. Then run the full Playwright Chromium suite.

Common target commands:

```bash
cd apps/web
node_modules/.bin/playwright test tests/e2e/product-critical-paths.spec.ts --project=chromium
node_modules/.bin/playwright test tests/a11y/all-routes.spec.ts --project=chromium
node_modules/.bin/playwright test tests/web/routing.spec.ts --project=chromium
```

Manual checks to run before shipping:

- Tab from the first focusable control through header, scene controls, CTA area, and footer.
- Toggle mute with mouse and keyboard.
- Use "Skip 3D entirely" and return to cinematic.
- Use `/lite` with JavaScript disabled.
- Switch EN → VI and verify `<html lang>`.
- Confirm no analytics provider script appears in SSR HTML.

## 8. Fine-Tuning The Site

Copy/content:

1. Update source content in `content/narrative/` or `apps/web/messages/`.
2. Keep Lumi lines short and calm; avoid exclamation marks and banned marketing phrases.
3. Run content tests:

```bash
node_modules/.bin/vitest run content/narrative/**/*.test.ts
cd apps/web && node_modules/.bin/vitest run lib/i18n/__tests__/messages-loader.test.ts --config vitest.config.ts
```

Design tokens:

1. Edit `packages/ds-cinematic/src/tokens/*`.
2. Regenerate token exports if needed.
3. Run package tests and typecheck:

```bash
node_modules/.bin/vitest run packages/ds-cinematic/src/**/*.test.ts packages/ds-cinematic/tests/*.test.ts
node_modules/.bin/tsc -p packages/ds-cinematic/tsconfig.json --noEmit
```

Performance:

1. Keep Three/R3F behind dynamic client boundaries.
2. Do not allocate new Three objects inside `useFrame`.
3. Keep GLB, decoder, JS, and page-weight budgets green.
4. Run:

```bash
node_modules/.bin/vitest run apps/web/tests/perf/useframe-allocations.test.ts tools/perf-budgets/__tests__/*.test.mjs
cd apps/web && node_modules/.bin/next build
```

Accessibility:

1. Preserve visible focus rings.
2. Keep controls at least 44px by 44px.
3. Keep `/lite` equivalent for motion-heavy content.
4. Run:

```bash
cd apps/web
node_modules/.bin/playwright test tests/a11y --project=chromium
```

Forms and funnels:

1. Keep Buy, Partner, and Join behavior consistent: validation, retry, draft persistence, prefill, focus return, and aria-live states.
2. Keep HubSpot stage names env-driven.
3. Do not hardcode pipeline stage names in client payloads.
4. Run:

```bash
cd apps/web
node_modules/.bin/vitest run components/cta/forms/__tests__ lib/forms/__tests__ lib/server/__tests__ --config vitest.config.ts
node_modules/.bin/playwright test tests/cta --project=chromium
```

Analytics and RUM:

1. Web-vitals events should flow as internal `web_vitals` events and Plausible custom events `web-vitals/{metric}`.
2. Keep route, breakpoint, connection, and locale segmentation.
3. Update `docs/launch/rum-dashboard-setup.md` after production dashboard changes.
4. Run:

```bash
cd apps/web
node_modules/.bin/vitest run lib/perf/__tests__ lib/analytics/__tests__/proxy.unit.test.ts --config vitest.config.ts
```

3D assets:

1. Use Blender 4.4 LTS for `.blend` sources.
2. Export raw GLBs to `assets-built/raw/`.
3. Run the glTF pipeline and budget check.
4. Do not call placeholder `.blend` JSON files production assets.

```bash
node scripts/gltf-pipeline.mjs
node tools/perf-budgets/check-asset-sizes.mjs --report=asset-summary.json
```

## 9. Deploy Strategy

Target platform: Vercel.

### 9.1 Pre-Deploy Gate

```bash
apps/web/node_modules/.bin/tsc -p apps/web/tsconfig.json --noEmit
cd apps/web && node_modules/.bin/next build
cd apps/web && node_modules/.bin/vitest run --config vitest.config.ts
cd apps/web && node_modules/.bin/playwright test --project=chromium
node tools/audit-fr-deliverables.mjs
```

Do not deploy if the audit shows `missing-deliverables` or `ready-for-implementation`. Blocked FRs may remain blocked if they require unavailable external evidence, such as Blender, production DNS, external accessibility consultant sign-off, HubSpot sandbox credentials, Plausible production access, or award-platform submission credentials.

### 9.2 Vercel Configuration

- Project root: `apps/web` unless deploying through the monorepo-aware project config.
- Build command: `node_modules/.bin/next build`.
- Output: `.next`.
- Required env vars: set in Vercel dashboard, not in git.
- Regions and headers: see `apps/web/vercel.json`.

Recommended Vercel env groups:

- Production: live Sanity, HubSpot, ATS, Slack, Plausible, GA4, and production domain.
- Preview: sandbox HubSpot/ATS when available; separate Plausible domain or disabled upstream forwarding.
- Development: local fallbacks.

### 9.3 Preview Verification

1. Deploy preview.
2. Verify `/`, `/vi`, `/lite`, `/work/sample`, `/accessibility`, and `/vi/accessibility`.
3. Submit Buy/Partner/Join with test data.
4. Confirm HubSpot Buy and Partner route to configured sandbox stages.
5. Confirm Join routes to ATS or documented fallback.
6. Confirm `/api/analytics` accepts a `web_vitals` event.
7. Run route axe and target-size checks against preview if the environment allows it.
8. Confirm no secrets appear in client chunks.

### 9.4 DNS/Cutover

1. Deploy preview.
2. Verify preview routes, analytics endpoint, sitemap, robots, and security headers.
3. Point DNS according to `docs/launch/dns-setup.md`.
4. Run `docs/launch/cutover-runbook.md`.
5. Verify apex and `www` redirects.
6. Submit sitemap after production is stable.

### 9.5 Post-Deploy

- Run Lighthouse against production.
- Run axe route scan.
- Confirm `/api/health`.
- Confirm no cookies are set by analytics endpoints.
- Confirm Plausible receives `web-vitals/LCP`, `web-vitals/INP`, and `web-vitals/CLS`.
- Confirm RUM dashboard share URL is stored outside git.
- Confirm Slack/email routing alerts with test-only payloads.
- Confirm HubSpot test pipeline is cleared before real launch traffic.
- Archive launch evidence under `docs/launch/`.

### 9.6 Rollback

1. Revert to the previous Vercel deployment.
2. Confirm DNS still points at Vercel.
3. Run `/api/health`.
4. Check `/`, `/lite`, `/accessibility`, and `/work/sample`.
5. Log the incident in `docs/launch/` with cause, rollback time, and follow-up owner.

## 10. Repository Layout

```text
landing-page/
├── apps/web/                    Next.js app
├── packages/ds-cinematic/       Cinematic design-system tokens
├── content/narrative/           Scene, narration, and localization source
├── design/                      Character, mood board, scene, token artifacts
├── assets-source/               Source 3D/design assets, LFS-tracked where needed
├── assets-built/                Derived GLBs and optimization reports
├── docs/feature-requests/       FR specs, audits, backlog, dependency graph
├── docs/product/                PRD and SRS
├── docs/qa/                     Test cases, coverage matrix, deliverable audit
├── docs/launch/                 DNS, cutover, awards, soft-launch evidence
├── scripts/                     Asset and PR automation
├── tools/                       FR, perf, LFS, and cowork tooling
└── .github/workflows/           CI, a11y, Lighthouse, asset gates
```

## 11. Current Known Blockers

- Blender-dependent FRs are blocked when Blender is not installed locally.
- Production Lumi mesh, UVs, Substance textures, rig, shape keys, animation library, and nón lá production mesh are not shipped unless their real asset files exist and validators pass.
- External operations FRs remain blocked until production DNS/deploy/submission evidence exists.
- FR-A11Y-012 remains blocked until an external consultant performs real VoiceOver, NVDA, JAWS, motor, cognitive, and color-blindness checks.
- FR-CMS-011 remains blocked until the quarterly recurring task is created in Linear or Asana.
- FR-CTA-009 remains blocked until HubSpot sandbox verification and test pipeline cleanup are done.
- FR-PERF-011 remains blocked until Plausible production dashboard and Slack alert verification are done.
- Social/awards platform tasks should prepare post content and schedules locally, but final posting/submission remains manual unless credentials and approval are provided.
