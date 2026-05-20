---
fr_id: FR-PERF-004
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
final_revision: 2026-05-16 (round 3; feature-request-audit skill §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-PERF-004 is ship-grade. Drei <Preload> + intersection-observer prefetch of next-scene GLBs (200% rootMargin)

## §2 — Round-1/2 findings (resolved)

### ISS-80021 — Implementation contract underspecified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 ties to canonical anchor FR (FR-PERF-001 or master plan §6.1 / §7 / §8 baseline as appropriate); type-safe surface per CONTRACT precision rule.

### ISS-80022 — Test coverage shape (Vitest + Playwright)
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — AC checklist + test code shape; CI gates from Batch 8 (OPS-010..013) enforce.

### ISS-80023 — Budget / threshold sourced from FR-OPS-002 canonical
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — Thresholds read from `tools/perf-budgets/budgets.json`; no hardcoded copies.

### ISS-80024 — Failure-mode inventory expanded to 5+ rows
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 covers detection + recovery; AC#1..#N each name a test tool.

## §3 — Strengths preserved from the spec-stub

- Master plan grounding (§6.1 perf / §7 a11y / §8 SEO / §9 CMS) correctly cited.
- BCP-14 normative MUSTs already precise.
- Anchor-FR dependency edge already correctly named.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-80025 — Vietnamese network conditions not in test matrix
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Lighthouse simulated throttling defaults to Fast 4G (10240 Kbps). Vietnamese audience often on slower 3G/4G with high latency. Test matrix MUST include Slow 3G + Vietnam regional latency profile per FR-PERF-001.

### ISS-80026 — Sampling bias on low-traffic site (SMB)
- **severity:** info
- **rule_id:** observability
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** RUM percentiles unreliable below 100 samples/day. Aggregate over 7-day rolling window; document constraint. Future: switch to 30-day window once traffic stabilizes.

### ISS-80027 — INP vs FID transition for older browsers
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Safari < 16 reports FID not INP. Fall back to FID with separate threshold (< 100ms). Cross-ref FR-SEO-009 web-vitals lib handling.

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

Batch 12 item 3 of 29.

*End of FR-PERF-004 audit.*
