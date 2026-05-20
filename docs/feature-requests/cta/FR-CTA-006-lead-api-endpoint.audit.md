---
fr_id: FR-CTA-006
audited: 2026-05-16
auditor: manual (engineering-spec@1 + feature-request-audit skill §3.12 compliance pass round 3)
verdict: PASS
score_pre_revision: 6.5/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; feature-request-audit skill §3.12 compliance re-audit against expanded 20KB spec)
authoring_md_compliance: §3.12 #36 — 7 ISS findings (≥ 6 required) ✓
---

## §1 — Verdict summary

FR-CTA-006 ships `/api/lead/route.ts` — the server endpoint that receives Buy / Partner / Join form submissions, validates via shared zod schema (discriminated union), rate-limits 5 req/min/IP, honeypot bot defense with silent 200, HubSpot CRM forwarding via FR-CTA-009 stage routing, ATS forwarding for join, retry queue on upstream 5xx, anonymized logging with redacted PII. 20.3 KB spec.

Round-3 re-audit adds 3 NEW ISS findings. Total: 7 ISS.

## §2 — Round-1/2 findings (resolved; preserved)

### ISS-70041 — Implementation contract underspecified
- **severity:** error · **status:** RESOLVED — §1 ties to FR-CTA-002..004 + FR-CTA-005 schema.

### ISS-70042 — A11y form-error handling
- **severity:** error · **status:** RESOLVED — Server returns structured errors compatible with FR-CTA-005 aria-live announcer.

### ISS-70043 — Rate-limit + abuse protection
- **severity:** warning · **status:** RESOLVED — 5 req/min/IP + honeypot silent 200 + 429 with Retry-After header.

### ISS-70044 — Locale + hreflang correctness (cross-ref)
- **severity:** warning · **status:** RESOLVED — Schema includes `locale` field; downstream HubSpot deal carries locale for founder follow-up routing.

## §3 — Round-3 findings (NEW)

### ISS-70045 — Idempotency key for double-submit prevention missing
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 + §7 failure modes: client-generated UUID in submit payload; server dedupes via in-memory map (or Upstash Redis in prod) within 60s window. Without idempotency, network-flake retries create duplicate leads.
- **resolution location:** §7 failure mode "user submits 5× rapidly creating duplicate HubSpot deals" + §9 future enhancement
- **why it matters:** Founder sees 5 HubSpot deals from one user → confused; sales workflow polluted.

### ISS-70046 — CORS preflight cache duration unspecified
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 + §7: CORS preflight `OPTIONS /api/lead` MUST return `Access-Control-Max-Age: 86400` (24h cache). Without explicit max-age, every form submit prefaced by preflight = doubled latency.
- **resolution location:** §1 CORS section + §7 failure mode
- **why it matters:** Mobile form-submit latency reduction (~ 200ms saved per submit on subsequent forms).

### ISS-70047 — Honeypot field rendering accessibility (must not announce to AT)
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — §1 + §7: client-side honeypot field MUST be `aria-hidden="true"` + `tabIndex={-1}` + CSS `position: absolute; left: -9999px` (offscreen, not display:none which AT may still announce). Without these, screen-reader users hear "Enter your real email" twice or get caught in honeypot.
- **resolution location:** §7 failure mode "honeypot field accessible to AT" + cross-ref FR-CTA-005
- **why it matters:** A11y regression catches users who use voice control or screen readers.

## §4 — Rubric scoring

| Dim | Pre | R1 | R2 | **R3** |
|---|:-:|:-:|:-:|:-:|
| Atomicity | 1.0 | 1.0 | 1.0 | **1.0** |
| BCP-14 | 1.0 | 1.0 | 1.0 | **1.0** |
| Testability | 1.4 | 1.9 | 2.0 | **2.0** |
| Plan grounding | 1.4 | 1.5 | 1.5 | **1.5** |
| Contract | 1.2 | 1.5 | 1.5 | **1.5** (R3: idempotency + CORS) |
| Deps | 0.9 | 1.0 | 1.0 | **1.0** |
| Failure modes | 0.5 | 0.9 | 1.0 | **1.0** (R3: 3 new rows) |
| Observability | 0.5 | 0.9 | 1.0 | **1.0** |
| **TOTAL** | **6.5** | **9.0** | **10.0** | **10/10** ✓ |

## §5 — Resolution

**Score = 10/10.** R3 surfaces idempotency, CORS cache, and honeypot a11y — all critical-path API hardening that pre-R3 audit missed.

## §6 — Cross-references

- Canonical R3 pattern: `FR-SCENE-017-implementation.audit.md`.
- Upstream: FR-CTA-002..004 forms.
- Downstream: FR-CTA-009 stage routing, FR-SEO-008 analytics.

*End of FR-CTA-006 audit (round 3 final).*
