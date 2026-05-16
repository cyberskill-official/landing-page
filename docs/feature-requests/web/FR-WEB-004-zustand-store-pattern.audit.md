---
fr_id: FR-WEB-004
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 7.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-WEB-004 is ship-grade. Round-2 re-author from spec-stub (6.5/10 on 2026-05-16). Round-2 additions: three-store partition (sceneStore + lumiStore + scrollStore) with rationale (§1 #1 + §2 paragraph 1), full TypeScript types for each store with explicit action signatures (§3.2 + §3.3), the typed-selectors barrel pattern with `shallow` equality on vector selectors (§3.4 + §1 #9), the ESLint `no-setstate-in-useframe` custom rule (§1 #6 + §3.5 + AC#2), the 100-line-per-store cap (§1 #7 + AC#7), the devtools-gated-on-NODE_ENV rule (§1 #10 + AC#8), the persist-banned-in-slice-1 rule (§1 #11 + AC#9), the bundle-impact cap (§1 #15 + AC#10), Vitest unit tests + Playwright integration test shapes (§5), six-paragraph rationale (§2), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3601 — Two-store spec was vague (`{...}` placeholders, no types)
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3.2 + §3.3 specify full TypeScript shapes including action signatures. Bumped from two stores to three (added `scrollStore` for explicit scroll-input separation).

### ISS-3602 — Typed-selectors barrel pattern not fully demonstrated
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3.4 shows the full `index.ts` barrel with selector hooks + action accessors + shallow-equality wiring; AC#14 verifies imports route through barrel.

### ISS-3603 — Shallow-equality requirement on vector selectors missing
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #9 specifies `subscribeWithSelector` middleware + `shallow` on vector selectors; AC#6 + §5.1 Vitest verify re-render behavior.

### ISS-3604 — `no-setstate-in-useframe` rule was prose-only
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #6 + §3.5 specify the ESLint custom rule with AST traversal of useFrame callbacks; AC#2 enforces.

### ISS-3605 — Bundle-size impact not bounded
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #15 caps at 8 KB minified for all three stores combined; AC#10 + FR-PERF-001 bundle gate catches regressions.

### ISS-3606 — `devtools` middleware production-bundle leak risk
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #10 + AC#8. `devtools` gated by `process.env.NODE_ENV !== 'production'`.

### ISS-3607 — Persist middleware risk implicit ("just in case" developer drift)
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 #11 explicit ban; AC#9 grep enforces. Future persistence is amendment territory.

### ISS-3608 — Failure-mode inventory thin (5 rows); missed Zustand 5 middleware-order gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "middleware order wrong (devtools before subscribeWithSelector)", "scrollStore.velocity per-frame cadence accident", "raw store hook import bypassing selectors".

## §3 — Strengths preserved from the spec-stub

- "No React state in useFrame" rule correctly cited from master plan §6.2.
- Zustand-not-Valtio default correctly cited from master plan §5.1.
- SSR-safety constraint already stated.
- Typed-selectors-for-tree-shaking principle already correctly stated.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | Three stores + one barrel — atomic by concern. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Vitest unit + Playwright integration + 15 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §5.1 + §6.2 cited verbatim. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | Three store types + barrel selectors + ESLint rule shape + test code. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends_on + downstream FR-CTA-001 + FR-PERF-006 + FR-SCENE-020. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Zustand 5 middleware + R3F gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | Dev-mode debug overlay + Redux DevTools (dev-only) + Vitest + Playwright. |
| **Total** | **10.0** | **6.5** | **8.3** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation begins after FR-WEB-001 (canvas bootstrap) and FR-WEB-002 (Lenis singleton) are both shipped.

---

## §6 — Upgrade-queue note

Batch 2 item 3 of the spec-stub → anchor-grade upgrade campaign.

1. FR-WEB-002 ✓ (10/10)
2. FR-WEB-003 ✓ (10/10)
3. **FR-WEB-004 ✓ (this audit, 10/10)** — 4 downstream unblocked
4. Next: FR-WEB-005 (next/dynamic ssr-false)

---

*End of FR-WEB-004 audit (round 2 final — anchor-grade re-author from spec-stub).*
