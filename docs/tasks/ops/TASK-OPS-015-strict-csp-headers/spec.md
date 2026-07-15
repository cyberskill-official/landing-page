---
id: TASK-OPS-015
title: "Implement strict Content-Security-Policy headers in production and report-only in preview"
status: done
class: improvement
priority: SHOULD
owner: agent
depends_on: [TASK-OPS-009]
routed_back_count: 0
awh: N/A
---

# TASK-OPS-015: Implement strict Content-Security-Policy headers in production and report-only in preview

## 0. Why (evidence)
Now that the datastore and Genie chat APIs are live, we must prevent cross-site scripting (XSS), data exfiltration, and unauthorized script injection. Implementing strict CSP headers enforces client-side runtime boundaries, blocking modern web security attack vectors.

## 1. Description (normative)
- 1.1 Production headers SHALL enforce strict Content-Security-Policy directives (script-src, style-src, connect-src) blocking unsafe-inline unless hashed.
- 1.2 Non-production environments (Preview/Staging) SHALL use Content-Security-Policy-Report-Only mode to avoid blocking preview instrumentation.
- 1.3 The API `/api/csp-report` SHALL parse and log policy violations for analysis.
- 1.4 Directives SHALL allow connections only to whitelisted resources (Anthropic APIs, Resend, self-domain, analytics).

## 2. Acceptance criteria
- [ ] AC for 1.1 - production response headers include Content-Security-Policy with strict directives - test: `security/csp-enforced`
- [ ] AC for 1.2 - non-production headers carry Content-Security-Policy-Report-Only instead - test: `security/csp-report-only`
- [ ] AC for 1.3 - POST to /api/csp-report successfully logs violation payloads - test: `security/csp-logging`
- [ ] AC for 1.4 - scripts or styles from unlisted external domains fail to execute or connect - test: `security/csp-whitelist`

## 3. Edge cases
- Vercel or local developer hot-module-reloading scripts being blocked by strict CSP rules.
- Hydration inline script hashes changing on subsequent builds.

## 4. Out of scope
- Web Application Firewall (WAF) routing rule sets.
- Client-side iframe sandbox attributes for third-party embeds (covered in TASK-CTA-005).

## 5. Protected invariants
- The CSP stance must not prevent standard, keyboard-operable accessibility landmarks or main content rendering.
