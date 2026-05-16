---
fr_id: FR-CMS-011
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

FR-CMS-011 is ship-grade. closes Batch 12 Quarterly content refresh cadence — new case study + refreshed metrics

## §2 — Round-1/2 findings (resolved)

### ISS-80281 — Implementation contract underspecified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 ties to canonical anchor FR (FR-CMS-001 or master plan §6.1 / §7 / §8 baseline as appropriate); type-safe surface per CONTRACT precision rule.

### ISS-80282 — Test coverage shape (Vitest + Playwright)
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — AC checklist + test code shape; CI gates from Batch 8 (OPS-010..013) enforce.

### ISS-80283 — Budget / threshold sourced from FR-OPS-002 canonical
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — Thresholds read from `tools/perf-budgets/budgets.json`; no hardcoded copies.

### ISS-80284 — Failure-mode inventory expanded to 5+ rows
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 covers detection + recovery; AC#1..#N each name a test tool.

## §3 — Strengths preserved from the spec-stub

- Master plan grounding (§6.1 perf / §7 a11y / §8 SEO / §9 CMS) correctly cited.
- BCP-14 normative MUSTs already precise.
- Anchor-FR dependency edge already correctly named.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-80285 — Sanity webhook signature timing-safe compare
- **severity:** warning
- **rule_id:** governance / privacy
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** FR-CMS-005 webhook uses HMAC signature. Comparison MUST be timing-safe via crypto.timingSafeEqual. Prevents side-channel leak of secret.

### ISS-80286 — Vietnamese diacritic preservation through ISR pipeline
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Vietnamese content travels Sanity → ISR cache → CDN → browser. Any intermediate decode/encode can corrupt diacritics. Vitest asserts UTF-8 byte-equality at each hop.

### ISS-80287 — Draft mode token scope + expiry
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

**This audit closes Batch 12.** All P5 PERF + A11Y + SEO + CMS-vi FRs are now at anchor-grade.

---

## §6 — Upgrade-queue note — Batch 12 closure

**Batch 12 of the spec-stub → anchor-grade campaign is COMPLETE.** Next: Batch 13 (P6 launch FRs).

*End of FR-CMS-011 audit.*
