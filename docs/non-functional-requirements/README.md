# CyberSkill Landing Page - Non-Functional Requirements

Owner: Stephen Cheng. Source spec: `../Research Foundations for the CyberSkill
Interactive Storytelling Landing Page (PRD + SRS Basis).md`. These NFRs set the
quality floors the feature requests are built against; each is enforced rather
than aspirational.

| ID | Category | Summary |
|---|---|---|
| [NFR-PERF-001](NFR-PERF-001-core-web-vitals.md) | Performance | LCP under 2.5s on p75 mobile, healthy INP and CLS, with a CI-enforced budget and the 3D payload off the critical path. |
| [NFR-A11Y-001](NFR-A11Y-001-wcag-aa.md) | Accessibility | WCAG 2.2 AA floor: reduced-motion and manual toggle, keyboard operability, visible focus, and a DOM-text mirror of the canvas. |
| [NFR-SEC-001](NFR-SEC-001-keyless-secrets.md) | Security | No secret in the browser: keys are server-side env only, the proxy validates and rate-limits, and baseline security headers are set. |
| [NFR-I18N-001](NFR-I18N-001-vietnamese-first.md) | Internationalization | Vietnamese-first bilingual: every string has EN + VN, each locale is a crawlable URL with hreflang, and `<html lang>` matches content. |
