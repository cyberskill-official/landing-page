# CyberSkill Landing Page PRD

Version: 1.0
Status: implementation and QA baseline
Owner: CyberSkill
Last updated: 2026-05-17

## 1. Purpose

CyberSkill needs a public marketing experience that turns the company story into a credible, accessible, measurable conversion path. The site must communicate a Vietnamese senior software studio with cinematic craft, while remaining usable for visitors who cannot or do not want a 3D experience.

## 2. Product Goals

- Establish CyberSkill as a senior-only Vietnamese software solutions consultancy.
- Convert qualified visitors into one of three tracks: buy, partner, or join.
- Preserve Vietnamese cultural identity without tourist clichés or over-formal language.
- Ship a cinematic 3D-first route and a motion-free `/lite` route with equivalent core information.
- Meet high accessibility, SEO, performance, analytics, and launch-readiness standards.

## 3. Audiences

### A1. Buyer

Technology, product, or founder audience evaluating CyberSkill for senior software delivery.

Primary needs:

- Fast understanding of what CyberSkill does.
- Trust signals, work examples, founder/company legitimacy.
- Clear discovery-call path.

### A2. Partner

Agency, studio, or technical partner looking for delivery capacity or collaboration.

Primary needs:

- Proof of craft and reliability.
- Understanding of collaboration model.
- Partner-specific lead path.

### A3. Candidate

Senior engineer/designer/3D specialist assessing whether CyberSkill is credible and worth joining.

Primary needs:

- Team principles and hiring signal.
- Role path when jobs are available.
- Respectful, privacy-conscious team presentation.

### A4. Accessibility / Low-Capability Visitor

Visitor using reduced motion, save-data, older hardware, keyboard navigation, screen reader, or no WebGL.

Primary needs:

- Same story without canvas dependency.
- Keyboard-operable controls.
- Stable focus, captions, and readable content.

## 4. Product Scope

### In Scope

- Public Next.js web application.
- Home route with cinematic story shell.
- `/lite` route for motion-free and low-capability access.
- Public routes: `/work`, `/work/[slug]`, `/capabilities`, `/team`, `/careers`, `/accessibility`.
- English and Vietnamese route support.
- SEO metadata, sitemap, robots, canonical and hreflang alternates.
- JSON-LD structured data for organization, services, founder, and case studies.
- Analytics proxy and typed analytics taxonomy.
- Web vitals reporting.
- Vercel launch configuration and launch runbooks.
- Automated unit, integration, and end-to-end test coverage.

### Out of Scope Until Upstream FRs Ship

- Production Lumi model, rig, and animation library.
- Full scene 1-6 cinematic implementation.
- HubSpot/Calendly/ATS form completion.
- Public production DNS cutover and awards submission.
- Paid external Vietnamese native-speaker signoff.

## 5. Product Requirements

| ID | Requirement | Priority | Success Signal |
|---|---|---:|---|
| PRD-001 | Home route presents a clear CyberSkill value proposition above the fold. | MUST | H1 and supporting deck are SSR-visible. |
| PRD-002 | Site supports English and Vietnamese route variants. | MUST | `/` and `/vi` render localized copy and hreflang. |
| PRD-003 | Motion-free `/lite` route carries the same core story without canvas. | MUST | Reduced-motion users and `/lite` see no canvas. |
| PRD-004 | Visitors can skip directly to the CTA area by keyboard. | MUST | Skip story control moves focus to CTA hub. |
| PRD-005 | Visitors can opt out of 3D and return to cinematic mode. | MUST | Lite preference controls work and announce status. |
| PRD-006 | Audio starts muted and can be toggled accessibly. | MUST | Toggle is keyboard-operable and persisted. |
| PRD-007 | Vietnamese tagline reveal is available but gated by native-review signoff. | SHOULD | Implementation ready; FR-CMS-009 remains blocking. |
| PRD-008 | Public case-study routes exist for published work slugs. | MUST | `/work/sample` and listed slugs render. |
| PRD-009 | SEO metadata and structured data describe organization, services, founder, and work. | MUST | JSON-LD schema tests pass. |
| PRD-010 | Analytics is server-proxied, typed, cookieless, and PII-stripped. | MUST | `/api/analytics` accepts valid events and strips PII. |
| PRD-011 | Web vitals are reported through the analytics event layer. | SHOULD | `web_vitals` event payload test passes. |
| PRD-012 | Launch operations are documented and ready for operator execution. | MUST | Vercel config, DNS setup, and cutover runbook exist. |
| PRD-013 | Test artifacts provide traceability from requirement to automated coverage. | MUST | Requirements docs and test matrix are verified by unit tests. |

## 6. Key User Journeys

### J1. Buyer Discovery

1. Visitor lands on `/`.
2. Visitor reads the value proposition.
3. Visitor explores capabilities or work.
4. Visitor jumps to CTA hub.
5. Visitor selects the buy/discovery path when CTA forms ship.

### J2. Vietnamese Visitor

1. Visitor opens `/vi`.
2. Site renders Vietnamese route context.
3. Visitor can discover the Lumi Vietnamese tagline.
4. Visitor can read work/capability routes in Vietnamese route variants.

### J3. Reduced-Motion Visitor

1. Browser reports reduced motion or visitor opens `/lite`.
2. Canvas/3D is not required.
3. Storyboard panels convey the core story.
4. Visitor can return to full experience.

### J4. Keyboard User

1. Visitor tabs into header controls.
2. Skip story reaches CTA hub.
3. Mute, skip 3D, language controls expose names and visible focus.
4. Footer and route links remain reachable.

### J5. Operator Launch

1. Operator builds and verifies the app.
2. Operator applies Vercel and DNS configuration.
3. Operator runs cutover smoke checks.
4. Operator monitors analytics, web vitals, Lighthouse, and axe results.

## 7. Success Metrics

- Lighthouse production targets: high 90s for SEO/accessibility/best-practices, performance within budget.
- Core Web Vitals target: LCP <= 2.5s, INP <= 200ms, CLS <= 0.1.
- Accessibility target: WCAG 2.2 AA serious/critical axe violations = 0 on public routes.
- Analytics target: 10 core events typed and routed through `/api/analytics`.
- SEO target: sitemap includes public EN/VI routes and work slugs; hreflang present on public routes.
- QA target: unit, route, API, a11y, SEO, performance guardrail, and E2E suites pass before launch.

## 8. Risks

| Risk | Impact | Mitigation |
|---|---|---|
| 3D dependencies block launch polish. | Cinematic scope slips. | `/lite`, DOM-first routes, blocked backlog statuses. |
| Vietnamese copy lacks independent signoff. | Cultural trust damage. | FR-CMS-009 remains blocked until paid reviewer signs. |
| Analytics sends PII. | Privacy and compliance risk. | Proxy strips referrer query and PII-like keys. |
| E2E tests become brittle around canvas timing. | False failures. | Test SSR/DOM contracts and critical controls, not animation internals. |
| Launch claims overstate reality. | Reputation risk. | Awards/ops docs explicitly mark pending external/live gates. |

## 9. Release Gates

- TypeScript compile passes.
- Vitest app suite passes.
- Root contract tests pass.
- Playwright critical paths pass.
- Next production build passes.
- Backlog statuses accurately separate shipped, blocked, and ready-pending-external-gate.
- Production operator completes DNS, headers, smoke, Lighthouse, axe, analytics, and sitemap verification.
