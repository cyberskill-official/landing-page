# CyberSkill Test Cases

Version: 1.0
Status: comprehensive baseline
Last updated: 2026-05-17

## 1. Test Strategy

The test strategy combines:

- Unit and source-contract tests for helpers, API logic, SEO schema, stores, route contracts, launch config, and guardrails.
- Playwright E2E tests for public user journeys, accessibility flows, route rendering, and SEO alternates.
- Manual/external gates for production DNS, awards submissions, native Vietnamese review, screen-reader review, and final production Lighthouse.

## 2. Test Commands

Run from the repository root unless noted.

```bash
apps/web/node_modules/.bin/tsc -p apps/web/tsconfig.json --noEmit
cd apps/web && node_modules/.bin/vitest run --config vitest.config.ts
cd apps/web && node_modules/.bin/playwright test
cd apps/web && node_modules/.bin/next build
node_modules/.bin/vitest run .github/workflows/__tests__/*.test.ts tools/perf-budgets/__tests__/*.test.ts tools/perf-budgets/__tests__/*.test.mjs scripts/__tests__/*.test.mjs tools/cowork/recipes/__tests__/*.test.mjs packages/ds-cinematic/src/**/*.test.ts packages/ds-cinematic/tests/*.test.ts content/narrative/**/*.test.ts design/tokens/__tests__/*.test.ts eslint-rules/__tests__/*.test.ts eslint-rules/__tests__/*.unit.test.ts
node_modules/.bin/tsc -p packages/ds-cinematic/tsconfig.json --noEmit
node_modules/.bin/tsc -b packages/ds-cinematic
bash tools/__tests__/lfs-patterns.test.sh
bash tools/__tests__/lfs-output-not-tracked.test.sh
```

## 3. Functional Test Cases

| ID | Requirement | Type | Automated Coverage | Expected Result |
|---|---|---|---|---|
| TC-FUNC-001 | Home route SSR value proposition | E2E | `apps/web/tests/e2e.spec.ts`, `apps/web/tests/e2e/product-critical-paths.spec.ts` | Initial HTML contains H1; page renders H1. |
| TC-FUNC-002 | Canvas does not appear in SSR HTML | E2E | `apps/web/tests/e2e.spec.ts` | SSR HTML excludes canvas/Three bundle markers. |
| TC-FUNC-003 | Canvas mounts only for capable cinematic route | E2E | `apps/web/tests/e2e.spec.ts` | Canvas appears on `/` for capable browser. |
| TC-FUNC-004 | Reduced-motion avoids canvas | E2E | `apps/web/tests/e2e.spec.ts`, `apps/web/tests/a11y/lite.spec.ts` | Reduced-motion context sees no canvas. |
| TC-FUNC-005 | `/lite` is pure DOM | E2E | `apps/web/tests/e2e.spec.ts` | `/lite` loads with no canvas. |
| TC-FUNC-006 | Public route set renders | E2E | `apps/web/tests/e2e/product-critical-paths.spec.ts` | Public EN/VI routes return < 400 and visible main content. |
| TC-FUNC-007 | Work index lists published studies | Unit/E2E | `apps/web/app/work/[slug]/__tests__/page.unit.test.tsx`, `product-critical-paths.spec.ts` | Work links and detail pages render. |
| TC-FUNC-008 | Case-study unknown slug returns not found | Unit | `apps/web/app/work/[slug]/__tests__/page.unit.test.tsx` | Unknown slug resolves to not-found behavior. |
| TC-FUNC-009 | Capability anchors exist | Unit/E2E | `ServiceJsonLd.unit.test.ts`, `product-critical-paths.spec.ts` | Capability route renders capability sections. |
| TC-FUNC-010 | Language switcher changes locale route | Unit/E2E | `LanguageSwitcher.unit.test.tsx`, `product-critical-paths.spec.ts` | Switching from EN to VI lands on `/vi`. |
| TC-FUNC-011 | Skip story focuses CTA hub | Unit/E2E | `skip-story-pill.test.ts`, `skip-story.spec.ts`, `keyboard-nav.e2e.spec.ts` | URL hash and focus move to CTA hub. |
| TC-FUNC-012 | Skip 3D routes to `/lite` | Unit/E2E | `skip-3d-toggle.test.ts`, `skip-3d.spec.ts` | Lite preference is set and `/lite` loads. |
| TC-FUNC-013 | Back to cinematic clears lite preference | E2E | `a11y/lite.spec.ts`, `product-critical-paths.spec.ts` | User can return to `/`. |
| TC-FUNC-014 | Mute toggle changes state and announces | Unit/E2E | `mute-toggle.test.ts`, `mute-toggle.spec.ts` | Toggle state changes with click/keyboard. |
| TC-FUNC-015 | Lumi tagline reveal is keyboard/touch/mouse reachable | Unit | `LumiTaglineReveal.unit.test.tsx` | Component has live region and analytics event. |
| TC-FUNC-016 | Lumi tagline EN reveal is session-scoped | Unit | `LumiTaglineReveal.unit.test.tsx` | Hook uses sessionStorage, not localStorage. |
| TC-FUNC-017 | A/B assignment persists by cookie | Unit | `variant-assignment.unit.test.ts` | Existing cookie returns same variant. |
| TC-FUNC-018 | A/B force variant supports QA | Unit | `variant-assignment.unit.test.ts` | Valid force variant overrides assignment. |
| TC-FUNC-019 | Revalidation maps content to paths | Unit | `app/api/revalidate/__tests__/route.unit.test.ts` | Payload revalidates expected paths/tags. |
| TC-FUNC-020 | Health endpoint returns ok | E2E | `product-critical-paths.spec.ts` | `/api/health` returns `status: ok`. |

## 4. Accessibility Test Cases

| ID | Requirement | Type | Automated Coverage | Expected Result |
|---|---|---|---|---|
| TC-A11Y-001 | Axe WCAG serious/critical violations absent on covered routes | E2E | `apps/web/tests/a11y/all-routes.spec.ts` | Blocking violations array is empty. |
| TC-A11Y-002 | Keyboard nav reaches main controls | E2E | `keyboard-nav.e2e.spec.ts` | Tab order reaches controls and scene anchors. |
| TC-A11Y-003 | Focus ring exists globally | Unit/E2E | `focus-ring.unit.test.ts`, `focus-ring.e2e.spec.ts` | Focus ring has 2px gold outline and offset. |
| TC-A11Y-004 | Skip story accessible name and focus behavior | Unit/E2E | `skip-story-pill.test.ts`, `skip-story.spec.ts` | Control is named and focus reaches CTA. |
| TC-A11Y-005 | Skip 3D control has 44px target | Unit/E2E | `skip-3d-toggle.test.ts`, `skip-3d.spec.ts` | CSS target size and route behavior pass. |
| TC-A11Y-006 | Mute control exposes pressed state | Unit/E2E | `mute-toggle.test.ts`, `mute-toggle.spec.ts` | ARIA state matches toggled state. |
| TC-A11Y-007 | Captions use polite live region | Unit | `SceneCaption.unit.test.tsx` | `role=status`, `aria-live=polite`. |
| TC-A11Y-008 | Focus trap helper supports Tab/Escape | Unit | `use-focus-trap.test.ts` | Source contract includes Tab, Shift+Tab, Escape. |
| TC-A11Y-009 | Public controls have accessible names | E2E | `a11y/all-routes.spec.ts` | Controls are discoverable by role/name. |
| TC-A11Y-010 | Manual VO/NVDA review | Manual | External gate | Screen reader review complete before production launch. |

## 5. SEO Test Cases

| ID | Requirement | Type | Automated Coverage | Expected Result |
|---|---|---|---|---|
| TC-SEO-001 | ProfessionalService JSON-LD validates | Unit | `professional-service.test.ts`, `schema-validator.test.ts` | Required schema properties exist. |
| TC-SEO-002 | Service JSON-LD renders individual/list modes | Unit | `ServiceJsonLd.unit.test.ts` | Service data maps correctly. |
| TC-SEO-003 | Founder Person JSON-LD renders | Unit | `PersonJsonLd.unit.test.ts` | Founder schema references organization. |
| TC-SEO-004 | Hreflang utilities produce standard alternates | Unit | `hreflang.unit.test.ts` | EN/VI/x-default alternates are absolute. |
| TC-SEO-005 | Hreflang exists on public routes | E2E | `seo/hreflang.e2e.spec.ts` | Public routes contain EN/VI/x-default. |
| TC-SEO-006 | API routes omit hreflang | E2E | `seo/hreflang.e2e.spec.ts` | API body does not contain hreflang. |
| TC-SEO-007 | Sitemap includes public routes and work slugs | Unit | `sitemap.unit.test.ts` | Static and case-study URLs exist. |
| TC-SEO-008 | Robots disallows private/API paths | Unit | `sitemap.unit.test.ts` | Robots rules include disallowed API/draft paths. |
| TC-SEO-009 | Metadata title/description budgets pass | Unit | `meta-budgets.unit.test.ts`, eslint rule tests | Title/description lengths stay within budget. |
| TC-SEO-010 | Production sitemap submitted | Manual | Launch gate | GSC/Bing submission complete after DNS cutover. |

## 6. Analytics and Privacy Test Cases

| ID | Requirement | Type | Automated Coverage | Expected Result |
|---|---|---|---|---|
| TC-AN-001 | Analytics taxonomy contains 10 core events | Unit | `lib/analytics/__tests__/events.unit.test.ts` | Core event list length is 10. |
| TC-AN-002 | Unknown analytics event rejected | Unit/API | `proxy.unit.test.ts`, `route.unit.test.ts` | Invalid event returns 400. |
| TC-AN-003 | Referrer query stripped | Unit/API | `proxy.unit.test.ts`, `route.unit.test.ts` | Query/secret strings absent from forwarded body. |
| TC-AN-004 | PII-like properties dropped | Unit/API | `proxy.unit.test.ts`, `route.unit.test.ts` | Email/phone/name keys are omitted. |
| TC-AN-005 | Analytics is rate-limited | Unit/API | `route.unit.test.ts` | 101st request in window returns 429. |
| TC-AN-006 | Duplicate beacons dedupe | Unit/API | `route.unit.test.ts` | Duplicate dedupe id returns `{ deduped: true }`. |
| TC-AN-007 | 5xx upstream response queues retry | Unit/API | `proxy.unit.test.ts`, `route.unit.test.ts` | Retry queue receives failed upstream event. |
| TC-AN-008 | Client events route through `/api/analytics` | Unit | `analytics.ts` covered by event producer tests | Event body uses analytics proxy endpoint. |
| TC-AN-009 | Web vitals payload includes route/breakpoint/connection | Unit | `web-vitals.unit.test.ts` | `web_vitals` payload has required props. |
| TC-AN-010 | Analytics endpoint does not set cookies | E2E/API | `product-critical-paths.spec.ts` | Response lacks `set-cookie`. |

## 7. Performance and 3D Guardrail Test Cases

| ID | Requirement | Type | Automated Coverage | Expected Result |
|---|---|---|---|---|
| TC-PERF-001 | JS bundle budget enforced | Unit | `bundle-budget.test.ts` | Budget config is respected. |
| TC-PERF-002 | No namespace Three imports in app code | Unit | `no-namespace-three.test.ts` | Named imports only. |
| TC-PERF-003 | No Three in SSR route surface | Unit | `no-three-in-ssr.test.ts` | Server components avoid Three import. |
| TC-PERF-004 | No second canvas shell | Unit | `no-second-canvas.test.ts` | Single GlobalCanvas pattern. |
| TC-PERF-005 | Scene preloading respects save-data/2G/low-memory | Unit | `use-preload-next.unit.test.ts` | Preload skips constrained contexts. |
| TC-PERF-006 | Scene preloading instrumentation fires | Unit | `use-preload-next.unit.test.ts` | `preload_started/completed` fire. |
| TC-PERF-007 | Scheduler helpers yield/defer correctly | Unit | `scheduler.unit.test.ts` | yield/postTask/onIdle fallback behavior passes. |
| TC-PERF-008 | No allocations in `useFrame` | Unit | `useframe-allocations.test.ts`, eslint rule tests | Guardrail rejects hot-loop allocations. |
| TC-PERF-009 | Dispose all Three resources | Unit | `dispose-on-unmount.unit.test.ts`, `scene-disposal.test.ts` | Geometries/materials/textures disposed. |
| TC-PERF-010 | Production Lighthouse | Manual/CI | Launch gate | Lighthouse meets release thresholds. |

## 8. Launch and Operations Test Cases

| ID | Requirement | Type | Automated Coverage | Expected Result |
|---|---|---|---|---|
| TC-OPS-001 | Vercel regions include Asia and fallback | Unit | `tests/ops/vercel-config.test.ts` | Regions are `sin1`, `hnd1`, `iad1`. |
| TC-OPS-002 | Security headers configured | Unit | `tests/ops/vercel-config.test.ts` | HSTS, XFO, XCTO, Referrer, Permissions headers exist. |
| TC-OPS-003 | WWW redirects to apex | Unit | `tests/ops/vercel-config.test.ts` | Redirect destination is apex. |
| TC-OPS-004 | DNS runbook exists | Unit | `tests/ops/vercel-config.test.ts` | Doc states live DNS pending. |
| TC-OPS-005 | Cutover runbook exists | Unit | `tests/ops/vercel-config.test.ts` | Doc states live cutover pending. |
| TC-OPS-006 | Awards packet avoids false claims | Unit | `tests/ops/vercel-config.test.ts` | Packet says final submission is blocked until launch. |
| TC-OPS-007 | Soft-launch templates identify Scene 0 gate | Unit | `tests/ops/vercel-config.test.ts` | Feedback template states blocked until staging URL exists. |
| TC-OPS-008 | Production DNS resolves | Manual | Launch gate | `dig`/`curl` checks pass after cutover. |
| TC-OPS-009 | HSTS preload submitted after stability window | Manual | Launch gate | Submission completed after stable HTTPS. |
| TC-OPS-010 | Award submissions receive IDs | Manual | Launch gate | Awwwards/FWA/CSSDA IDs archived. |

## 9. Localization Test Cases

| ID | Requirement | Type | Automated Coverage | Expected Result |
|---|---|---|---|---|
| TC-L10N-001 | Locale path utilities normalize prefixes | Unit | `routing-guardrails.test.ts`, `hreflang.unit.test.ts` | `/vi` maps to VI route context. |
| TC-L10N-002 | UI messages load expected keys | Unit | `messages-loader.test.ts` | Narrative/message lookup passes. |
| TC-L10N-003 | Vietnamese sources avoid banned phrases | Unit | `content/narrative/lines/__tests__/native-review.test.ts` | Banned phrases absent. |
| TC-L10N-004 | Native review packet has required sections | Unit | `native-review.test.ts` | Rubric, cultural review, signoff sections exist. |
| TC-L10N-005 | Paid native review complete | Manual/external | FR-CMS-009 gate | Reviewer receipt and founder signoff archived. |

## 10. Manual Regression Checklist

- Review `/`, `/vi`, `/lite`, `/work/sample`, `/accessibility` on mobile and desktop.
- Keyboard through header controls, main links, footer links, and lite route.
- Run screen-reader smoke with VoiceOver and NVDA before production.
- Verify production security headers with `curl -I`.
- Verify Plausible/GA4 event delivery in production dashboards.
- Verify GSC/Bing sitemap submission.
- Verify no award packet claim is unsubstantiated.
