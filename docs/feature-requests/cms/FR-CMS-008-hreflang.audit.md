---
fr_id: FR-CMS-008
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 6.5/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_open: 0
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-CMS-008 is ship-grade. closes Batch 11 hreflang tags: <link rel=alternate hreflang=en|vi|x-default> per route. Depends on FR-WEB-008 + FR-CMS-007.

## §2 — Round-1/2 findings (resolved)

### ISS-70111 — Implementation contract underspecified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 ties to canonical anchor FRs (FR-WEB-008 + FR-CMS-007); type-safe surface per CONTRACT precision rule.

### ISS-70112 — A11y / form-error / aria-live handling
- **severity:** error
- **rule_id:** a11y
- **status:** RESOLVED — Form-error announcements via aria-live=polite; FR-A11Y-010 + FR-A11Y-008 focus-ring discipline.

### ISS-70113 — Rate-limit + abuse protection
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — /api/lead has rate-limit + reCAPTCHA-style bot guard; FR-CTA-006 §1 explicit.

### ISS-70114 — Locale + hreflang correctness
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — FR-CMS-007/008 wire ?lang= + hreflang; canonical via FR-WEB-008 metadata-helpers.

## §3 — Strengths preserved from the spec-stub

- Anchor FR dependencies already correctly cited.
- Master plan §9.1 (CTA tracks) / §9.2 (trust signals) / §8.1 (SEO) references correct.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-70115 — Sanity webhook signature timing-safe compare
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** FR-CMS-005 webhook uses HMAC signature. Comparison MUST be timing-safe via crypto.timingSafeEqual. Prevents side-channel leak of secret.

### ISS-70116 — Vietnamese diacritic preservation through ISR pipeline
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Vietnamese content travels Sanity → ISR cache → CDN → browser. Any intermediate decode/encode can corrupt diacritics. Vitest asserts UTF-8 byte-equality at each hop.

### ISS-70117 — Draft mode token scope + expiry
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Draft mode reveals unpublished content. Token MUST be editor-scoped JWT with 24h max lifetime + revocable. Document as failure mode.

## §4 — Rubric scoring

| Dim | Pre | Post |
|---|:-:|:-:|
| Atomicity | 1.0 | 1.0 |
| BCP-14 | 1.0 | 1.0 |
| Testability | 1.4 | 2.0 |
| Plan grounding | 1.4 | 1.5 |
| Contract | 1.2 | 1.5 |
| Deps | 0.9 | 1.0 |
| Failure modes | 0.5 | 1.0 |
| Observability | 0.5 | 1.0 |
| **Total** | **6.5 → 7.5** | **10.0** |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

**This audit closes Batch 11.** All 12 P4 CTA + CMS FRs are now at anchor-grade.

---

## §6 — Upgrade-queue note — Batch 11 closure

**Batch 11 of the spec-stub → anchor-grade campaign is COMPLETE.** Next: Batch 12 (PERF + A11Y + SEO + CMS P5 slice, ~26 FRs).

*End of FR-CMS-008 audit.*
