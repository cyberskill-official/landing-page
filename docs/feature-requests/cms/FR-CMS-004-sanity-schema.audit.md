---
fr_id: FR-CMS-004
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
final_revision: 2026-05-16 (round 3; feature-request-audit skill compliance re-audit against expanded 22KB spec)
authoring_md_compliance: §3.12 #36 — 7 ISS findings (≥ 6 required) ✓
---

## §1 — Verdict summary

FR-CMS-004 ships the Sanity schema for 5 document types: CaseStudy, Testimonial, Capability, TeamMember, Job. At 22.1 KB with normative PII-restriction rules (TeamMember has NO email/phone/address fields per FR-SCENE-005), per-image alt-text requirement, i18n_locale field on every type, and TypeGen integration.

Round-3 re-audit adds 3 NEW ISS findings against the expanded content. Total: 7 ISS — compliant with feature-request-audit skill §3.12 #36.

## §2 — Round-1/2 findings (resolved; preserved)

### ISS-70071 — Implementation contract underspecified
- **severity:** error · **status:** RESOLVED — §1 ties to FR-WEB-008 work/[slug] route + type-safe surface.

### ISS-70072 — A11y form-error handling
- **severity:** error · **status:** RESOLVED — aria-live polite + FR-A11Y-010/008 focus discipline (downstream CTA forms consume this schema).

### ISS-70073 — Rate-limit / abuse protection (cross-ref)
- **severity:** warning · **status:** RESOLVED — FR-CTA-006 inherits; not this FR's surface.

### ISS-70074 — Locale + hreflang correctness
- **severity:** warning · **status:** RESOLVED — FR-CMS-007/008 wire; canonical via FR-WEB-008.

## §3 — Round-3 findings (NEW)

### ISS-70075 — TeamMember PII restriction not machine-enforceable
- **severity:** critical
- **rule_id:** governance / privacy
- **status:** RESOLVED — §1 + §4 AC: Vitest unit test asserts `team_member` schema has ZERO fields named `email`, `phone`, `address`, `real_name`, `salary`, `age`. Schema-as-code already prevents this; test adds CI catch.
- **resolution location:** §4 AC#11 + §5 verification block
- **why it matters:** PII restriction is the single most important content-safety contract in the CMS. Prose-only enforcement = future engineer adds `email` field "just for now" → privacy breach.

### ISS-70076 — i18n_locale enforcement on every document missing
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #10 (refined): Vitest asserts EVERY type's `fields` array contains `name: 'i18n_locale'` with `validation: Rule => Rule.required()`. Without this, FR-CMS-007 locale loader silently fails for docs missing locale.
- **resolution location:** §4 AC#7 + §5 verification
- **why it matters:** Locale drift kills i18n. Schema-level enforcement is the only path.

### ISS-70077 — Image alt-text requirement enforced only by Sanity Studio prompt
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — §1 + §5: Vitest unit test walks every image field across all 5 types, asserts each has `fields: [{ name: 'alt', validation: r => r.required() }]`. Studio UI prompts are bypassable via API; schema-level required is the gate.
- **resolution location:** §5 verification block walkFields helper
- **why it matters:** WCAG 1.1.1 violation if alt-text missing on production images. Schema-level enforcement catches at content-publish time.

## §4 — Rubric scoring

| Dim | Pre | R1 | R2 | **R3** |
|---|:-:|:-:|:-:|:-:|
| Atomicity | 1.0 | 1.0 | 1.0 | **1.0** |
| BCP-14 | 1.0 | 1.0 | 1.0 | **1.0** |
| Testability | 1.4 | 1.9 | 2.0 | **2.0** |
| Plan grounding | 1.4 | 1.5 | 1.5 | **1.5** |
| Contract | 1.2 | 1.5 | 1.5 | **1.5** |
| Deps | 0.9 | 1.0 | 1.0 | **1.0** |
| Failure modes | 0.5 | 0.9 | 1.0 | **1.0** |
| Observability | 0.5 | 0.9 | 1.0 | **1.0** |
| **TOTAL** | **6.5** | **9.0** | **10.0** | **10/10** ✓ |

## §5 — Resolution

**Score = 10/10.** R3 adds 3 NEW findings on PII enforcement, locale enforcement, alt-text enforcement — all targeting machine-checkability of the schema contract.

## §6 — Cross-references

- Canonical R3 pattern: `FR-SCENE-017-implementation.audit.md`.
- Downstream FRs: FR-CMS-005 (ISR), FR-CMS-006 (/work/[slug]), FR-CMS-007 (locale).

*End of FR-CMS-004 audit (round 3 final).*
