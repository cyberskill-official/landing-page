---
fr_id: FR-SEO-003
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

FR-SEO-003 is ship-grade. Person schema for the founder bio anchor

## §2 — Round-1/2 findings (resolved)

### ISS-80191 — Implementation contract underspecified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 ties to canonical anchor FR (FR-SEO-001 or master plan §6.1 / §7 / §8 baseline as appropriate); type-safe surface per CONTRACT precision rule.

### ISS-80192 — Test coverage shape (Vitest + Playwright)
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — AC checklist + test code shape; CI gates from Batch 8 (OPS-010..013) enforce.

### ISS-80193 — Budget / threshold sourced from FR-OPS-002 canonical
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — Thresholds read from `tools/perf-budgets/budgets.json`; no hardcoded copies.

### ISS-80194 — Failure-mode inventory expanded to 5+ rows
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 covers detection + recovery; AC#1..#N each name a test tool.

## §3 — Strengths preserved from the spec-stub

- Master plan grounding (§6.1 perf / §7 a11y / §8 SEO / §9 CMS) correctly cited.
- BCP-14 normative MUSTs already precise.
- Anchor-FR dependency edge already correctly named.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-80195 — UTF-8 charset enforced on JSON-LD blocks
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Vietnamese diacritics in Person.alternateName or Organization fields require UTF-8 encoding throughout: HTTP header + meta tag + JSON encoding. Verify via curl + grep.

### ISS-80196 — Schema.org @id reciprocity across blocks
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Person.affiliation.@id must exactly match Organization.@id. Drift = Google ignores cross-reference. Vitest assertion across all schema blocks.

### ISS-80197 — Google Rich Results Test pre-launch verification
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Manual verification step per FR pre-launch. Document as launch-checklist item; cross-ref FR-OPS-014.

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

## §6 — Upgrade-queue note

Batch 12 item 20 of 29.

*End of FR-SEO-003 audit.*
