# Test Coverage Matrix

Version: 1.0
Status: baseline traceability
Last updated: 2026-05-17

| Requirement | Test Cases | Automated Files |
|---|---|---|
| PRD-001 / FR-002 Home SSR value proposition | TC-FUNC-001, TC-FUNC-002 | `apps/web/tests/e2e.spec.ts`, `apps/web/tests/e2e/product-critical-paths.spec.ts` |
| PRD-002 / FR-007 Localization and hreflang | TC-FUNC-010, TC-SEO-004, TC-SEO-005, TC-L10N-001 | `apps/web/tests/seo/hreflang.e2e.spec.ts`, `apps/web/lib/seo/__tests__/hreflang.unit.test.ts`, `apps/web/tests/unit/routing-guardrails.test.ts` |
| PRD-003 / FR-003 Lite route | TC-FUNC-004, TC-FUNC-005, TC-FUNC-013 | `apps/web/tests/e2e.spec.ts`, `apps/web/tests/a11y/lite.spec.ts`, `apps/web/tests/unit/lite-storyboard.test.ts` |
| PRD-004 / FR-005 Skip story | TC-FUNC-011, TC-A11Y-004 | `apps/web/tests/a11y/skip-story.spec.ts`, `apps/web/tests/unit/skip-story-pill.test.ts`, `apps/web/tests/a11y/keyboard-nav.e2e.spec.ts` |
| PRD-005 / FR-004 Skip 3D and capability fallbacks | TC-FUNC-012, TC-A11Y-005 | `apps/web/tests/a11y/skip-3d.spec.ts`, `apps/web/tests/unit/skip-3d-toggle.test.ts`, `apps/web/tests/unit/capability-detection.test.ts` |
| PRD-006 / FR-005 Mute toggle | TC-FUNC-014, TC-A11Y-006 | `apps/web/tests/a11y/mute-toggle.spec.ts`, `apps/web/tests/unit/mute-toggle.test.ts` |
| PRD-007 / FR-007 Lumi tagline reveal | TC-FUNC-015, TC-FUNC-016, TC-L10N-005 | `apps/web/components/lumi/__tests__/LumiTaglineReveal.unit.test.tsx`, external FR-CMS-009 gate |
| PRD-008 / FR-008 Work routes | TC-FUNC-007, TC-FUNC-008 | `apps/web/app/work/[slug]/__tests__/page.unit.test.tsx`, `apps/web/tests/e2e/product-critical-paths.spec.ts` |
| PRD-009 / FR-009 SEO structured data | TC-SEO-001, TC-SEO-002, TC-SEO-003, TC-SEO-007, TC-SEO-008, TC-SEO-009 | `apps/web/components/seo/__tests__/*`, `apps/web/lib/seo/__tests__/*` |
| PRD-010 / FR-010 Analytics proxy | TC-AN-001 through TC-AN-008, TC-AN-010 | `apps/web/lib/analytics/__tests__/*`, `apps/web/app/api/analytics/__tests__/route.unit.test.ts`, `apps/web/tests/e2e/product-critical-paths.spec.ts` |
| PRD-011 / FR-012 Web vitals | TC-AN-009 | `apps/web/lib/perf/__tests__/web-vitals.unit.test.ts`, `apps/web/components/perf/__tests__/WebVitalsReporter.unit.test.tsx` |
| PRD-012 / FR-015 Launch operations | TC-OPS-001 through TC-OPS-010 | `apps/web/tests/ops/vercel-config.test.ts`, manual production gates |
| PRD-013 / NFR-007 Requirements traceability | TC-DOC-001 through TC-DOC-006 | `apps/web/tests/qa/requirements-docs.test.ts` |
| NFR-001 Accessibility | TC-A11Y-001 through TC-A11Y-010 | `apps/web/tests/a11y/*`, manual VO/NVDA gate |
| NFR-002 Performance and 3D guardrails | TC-PERF-001 through TC-PERF-010 | `apps/web/tests/perf/*`, `apps/web/tests/unit/no-*`, `apps/web/lib/perf/__tests__/*`, eslint-rule tests |
| NFR-004 Privacy | TC-AN-003, TC-AN-004, TC-AN-010 | `apps/web/lib/analytics/__tests__/proxy.unit.test.ts`, `apps/web/app/api/analytics/__tests__/route.unit.test.ts` |
| NFR-005 Reliability | TC-FUNC-019, TC-FUNC-020 | `apps/web/app/api/revalidate/__tests__/route.unit.test.ts`, `apps/web/tests/e2e/product-critical-paths.spec.ts` |

## Documentation Test Cases

| ID | Artifact | Expected Result |
|---|---|---|
| TC-DOC-001 | PRD | Contains purpose, goals, audiences, scope, requirements, journeys, risks, gates. |
| TC-DOC-002 | SRS | Contains functional, non-functional, external interface, data, security, acceptance criteria. |
| TC-DOC-003 | Test cases | Contains functional, a11y, SEO, analytics, performance, ops, localization, manual sections. |
| TC-DOC-004 | Coverage matrix | Maps PRD/SRS requirements to test case IDs and automated files. |
| TC-DOC-005 | Test inventory | References Vitest, Playwright, typecheck, build commands. |
| TC-DOC-006 | External gates | Native review, production DNS, awards, Lighthouse, axe, screen-reader gates are explicit. |
