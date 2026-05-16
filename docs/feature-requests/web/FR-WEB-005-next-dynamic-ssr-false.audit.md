---
fr_id: FR-WEB-005
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 7.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-WEB-005 is ship-grade. Round-2 re-author from spec-stub (6.5/10 on 2026-05-16). Round-2 additions: full `dynamic-three.ts` API shape with type preservation (§3.2), `<CanvasLoadingFallback>` HTML-only deliverable (§1 #6 + §3.3), custom ESLint rule enforcement (§1 #11 + AC#4), post-build grep test for SSR chunks (§1 #9 + §5.1), Playwright SSR-HTML test (§1 #10 + §5.2), `isClient()` helper (§1 #14 + AC#10), bundle-analyzer gated on `ANALYZE` env (§1 #16 + AC#14), six-paragraph rationale (§2), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3701 — `dynamic-three.ts` API shape was prose
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3.2 shows full TypeScript signature with `dynamic(...).then(m => m.default)` pattern preserving types; AC#7 verifies.

### ISS-3702 — `<CanvasLoadingFallback>` not specified
- **severity:** warning
- **rule_id:** observability
- **status:** RESOLVED — §1 #6 + §3.3 specify HTML-only fallback with aria-live + brand-tinted background; AC#5 + AC#6 verify.

### ISS-3703 — ESLint enforcement for scattered dynamic-imports missing
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #11 + AC#4 + §3.1 add custom ESLint rule failing build on scattered `dynamic(() => import('@react-three/...'))` outside `dynamic-three.ts`.

### ISS-3704 — Post-build SSR-chunk grep verification missing
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #9 + §5.1 specify Vitest grep over `.next/server/chunks/` for forbidden module imports; AC#3 enforces.

### ISS-3705 — Playwright SSR-HTML test missing
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #10 + §5.2 specify Playwright `curl` test verifying SSR HTML has fallback but no three.js; AC#5 + AC#13.

### ISS-3706 — `isClient()` canonical helper missing
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 #14 + AC#10. Used by `lib/lenis-singleton.ts` and other client-detection sites.

### ISS-3707 — Failure-mode inventory thin (4 rows); missed Next 15 + bundle gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "main chunk creeps over 200 KB (transitive R3F via vendor lib)", "loading fallback flickers (FOUC)", "hydration mismatch on dynamic boundary".

## §3 — Strengths preserved from the spec-stub

- Single-location convention (`dynamic-three.ts`) already correctly stated.
- Cross-reference to FR-WEB-001 + FR-PERF-001 budget gates correct.
- "Three.js NOT in critical path" rule correctly cited from master plan §5.3.
- 200 KB gz budget correctly cited from master plan §6.1.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One canonical lib file + one fallback component — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Build + Playwright + Vitest + 15 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §5.3 + §6.1 + §5.1 + §7.2 cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | dynamic-three.ts shape + fallback component + ESLint rule shape + test code. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends_on + downstream FR-WEB-006 + FR-PERF-004. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Next 15 build + bundle gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | Bundle analyzer (dev-gated) + Playwright HTML inspection + Vitest grep. |
| **Total** | **10.0** | **6.5** | **8.3** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

---

## §6 — Upgrade-queue note

Batch 2 item 4 of 8.

1. FR-WEB-002 ✓ (10/10)
2. FR-WEB-003 ✓ (10/10)
3. FR-WEB-004 ✓ (10/10)
4. **FR-WEB-005 ✓ (this audit, 10/10)**
5. Next: FR-WEB-006 (Suspense per scene)

---

*End of FR-WEB-005 audit.*
