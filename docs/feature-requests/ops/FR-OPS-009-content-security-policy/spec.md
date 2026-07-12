---
id: FR-OPS-009
title: "Add a Content-Security-Policy, report-only first"
status: ready_to_implement
class: improvement
priority: SHOULD
owner: agent
depends_on: []
routed_back_count: 0
awh: N/A
traces_to: [audit-B/finding-9-medium, audit-A/phase-2-item-11, growth/PERF-05]
---

# FR-OPS-009: Add a Content-Security-Policy, report-only first

## 0. Why (evidence)

Audit B measured the header set: HSTS, X-Content-Type-Options, X-Frame-Options, Referrer-Policy and Permissions-Policy are
all set correctly; the one missing header is a Content-Security-Policy. Audit A lists header hardening as an enterprise
procurement checklist item. next.config.ts confirms CSP is absent.

## 1. Description (normative)

- 1.1 The site SHALL ship `Content-Security-Policy-Report-Only` covering script-src, style-src, img-src, font-src, connect-src, frame-ancestors and base-uri, with a nonce or hash for the two inline bootstrap scripts in app/layout.tsx.
- 1.2 Violations SHALL be reported to an endpoint and reviewed; once the report is clean for one release cycle, the header SHALL be switched to enforcing.
- 1.3 The policy SHALL permit exactly the origins the site actually uses (Vercel, the analytics endpoint, the Anthropic proxy is server-side only) and nothing else.
- 1.4 A CI check SHALL assert the header is present on every route.

## 2. Acceptance criteria

- [ ] AC for 1.1 - report-only header present with the named directives and a nonce - test: `headers/csp-present`
- [ ] AC for 1.2 - the reporting endpoint receives and stores a seeded violation - test: `headers/csp-report-endpoint`
- [ ] AC for 1.3 - no legitimate site function generates a violation in a full-route crawl - test: `headers/csp-clean-crawl`
- [ ] AC for 1.4 - the enforcing flip is a one-line change recorded in the FR audit - test: `headers/csp-present`

## 3. Edge cases

- The no-flash theme script and the intro-veil script are inline - they need a nonce, not `unsafe-inline`.
- next/font self-hosts, so font-src stays same-origin.
- GA4 (FR-PERF-009) needs an allowance only if consent lets it load.

## 4. Out of scope / non-goals

- Subresource integrity.

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.2: the Anthropic key lives only in server env; no NEXT_PUBLIC_ secret, ever.
- The keyless-secrets NFR (NFR-SEC-001) stays intact: no secret reaches the client.
