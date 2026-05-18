# CyberSkill Landing Page SRS

Version: 1.0
Status: implementation and QA baseline
Last updated: 2026-05-17

## 1. Introduction

This Software Requirements Specification defines the functional, non-functional, external-interface, and testability requirements for the CyberSkill landing page application.

## 2. System Overview

The system is a Next.js 15 application under `apps/web`. It serves public marketing routes, localized route variants, a motion-free route, API endpoints for health, analytics, draft, lead, and revalidation, plus SEO artifacts such as sitemap and robots.

The current system includes strong scaffolding for a future full cinematic scene implementation. Several full 3D and CTA form requirements remain dependency-blocked and are tracked in `docs/feature-requests/BACKLOG.md`.

## 3. Operating Environment

- Runtime: Node.js / Next.js 15.
- UI: React 19.
- Canvas stack: Three.js / React Three Fiber / Drei where available.
- Testing: Vitest and Playwright.
- Deployment target: Vercel or equivalent edge-capable Next.js host.
- Browser support: modern evergreen browsers, graceful `/lite` fallback for reduced-motion, no-WebGL, save-data, or low-capability paths.

## 4. Functional Requirements

### FR-001 Public Routing

The system shall render these public routes:

- `/`
- `/vi`
- `/lite`
- `/vi/lite`
- `/work`
- `/vi/work`
- `/work/[slug]`
- `/vi/work/[slug]`
- `/capabilities`
- `/vi/capabilities`
- `/team`
- `/vi/team`
- `/careers`
- `/vi/careers`
- `/accessibility`
- `/vi/accessibility`

### FR-002 Home Experience

The home route shall render a DOM H1 and supporting deck in the initial HTML. It shall not require canvas for the primary value proposition.

### FR-003 Lite Experience

The lite route shall render a motion-free storyboard and shall not mount or depend on canvas.

### FR-004 Capability Detection

The client shall detect no-WebGL, reduced-motion, save-data, and low-memory paths and offer or route to lower-cost experiences as appropriate.

### FR-005 Accessibility Controls

The header shall provide skip-story, mute, skip-3D, and language controls. Controls shall be keyboard reachable, expose accessible names, and use visible focus rings.

### FR-006 Narrative Captions

The system shall expose current scene narration through a polite live region when cinematic scene narration is active.

### FR-007 Localization

The system shall support English and Vietnamese route context. Hreflang alternates shall identify EN, VI, and x-default variants.

### FR-008 Work Content

The system shall render a work index and published case-study detail routes from the case-study content source.

### FR-009 SEO and Structured Data

The system shall render metadata, canonical/hreflang alternates, sitemap, robots, and JSON-LD for applicable public routes.

### FR-010 Analytics Proxy

The system shall accept typed analytics events at `/api/analytics`, strip PII-like fields, remove referrer query strings, dedupe duplicate client beacons, rate limit per IP hash, and forward to configured upstream analytics providers.

### FR-011 Analytics Taxonomy

The system shall define the 10 core analytics events:

- `scene_enter`
- `lumi_interact`
- `cta_view`
- `cta_click`
- `skip_story_used`
- `lite_mode_toggled`
- `mute_toggled`
- `form_submit`
- `form_error`
- `nonla_easter_egg`

### FR-012 Web Vitals

The system shall report CLS, FCP, INP, LCP, and TTFB as analytics events with route, breakpoint, connection, locale, and value.

### FR-013 A/B Assignment

The system shall provide cookie-based server-safe A/B assignment with force-variant QA support and exposure events.

### FR-014 CMS Revalidation

The system shall accept signed Sanity revalidation webhooks and map content changes to affected public routes and cache tags.

### FR-015 Launch Operations

The system shall provide Vercel configuration, DNS guidance, cutover runbook, and award/soft-launch packets that identify pending live gates honestly.

## 5. Non-Functional Requirements

### NFR-001 Accessibility

The public experience shall target WCAG 2.2 AA. Automated axe serious/critical violations shall be zero for covered routes.

### NFR-002 Performance

The public experience shall protect Core Web Vitals through JS budget tests, scene preload guardrails, scheduler helpers, web-vitals reporting, and no-canvas fallback paths.

### NFR-003 SEO

Public routes shall include appropriate metadata, hreflang, sitemap coverage, robots directives, and JSON-LD.

### NFR-004 Privacy

Analytics shall avoid client tracking SDKs and shall not forward email, phone, full-name fields, or referrer query strings.

### NFR-005 Reliability

API endpoints shall validate inputs, rate-limit high-risk operations, and avoid exposing secrets in logs.

### NFR-006 Maintainability

Tests shall cover public contracts and guard against brittle changes to route structure, Three.js usage, store usage, metadata, and launch config.

### NFR-007 Testability

Every product requirement shall have at least one documented test case and at least one automated test or a documented external/manual gate.

## 6. External Interfaces

### Web Routes

Public routes return HTML and static/dynamic metadata through Next.js app routes.

### API Routes

| Route | Method | Purpose | Current Status |
|---|---|---|---|
| `/api/health` | GET | Health probe | Implemented |
| `/api/analytics` | POST | Analytics proxy | Implemented |
| `/api/revalidate` | POST | Sanity webhook/manual revalidate | Implemented |
| `/api/draft` | GET | Draft preview enable | Implemented |
| `/api/lead` | POST | HubSpot/lead endpoint | Stubbed, blocked by FR-CTA-006 |

### Content Sources

- Case-study seed content in `apps/web/lib/case-studies.ts`.
- Narrative lines in `content/narrative/lines`.
- UI messages in `apps/web/messages`.
- Future Sanity CMS schemas and webhook integration.

### Analytics Providers

- Plausible events API.
- GA4 Measurement Protocol when env vars are configured.

## 7. Data Requirements

- Analytics properties shall be primitive values only.
- PII-like analytics keys shall be dropped.
- Case studies shall have slug, client, year, localized title, summary, and outcome.
- Vietnamese review artifacts shall retain rubric, pending/accepted changes, and signoff state.

## 8. Security Requirements

- Revalidation webhook requests shall require valid signature or admin token.
- Analytics shall hash IP for rate-limit use and avoid storing raw IP in application state.
- Deployment shall send HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy, and Permissions-Policy headers.
- Draft preview shall require a configured preview secret.

## 9. Acceptance Criteria

- Requirements docs exist and are traceable to test cases.
- Unit tests pass.
- E2E critical path tests pass.
- TypeScript compile passes.
- Next production build passes.
- Backlog status accurately distinguishes shipped from blocked/external-gated requirements.

## 10. Traceability

Traceability is maintained in `docs/qa/TEST-CASES.md` and checked by `apps/web/tests/qa/requirements-docs.test.ts`.
