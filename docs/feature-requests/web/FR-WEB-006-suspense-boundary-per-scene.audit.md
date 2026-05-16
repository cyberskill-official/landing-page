---
fr_id: FR-WEB-006
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

FR-WEB-006 is ship-grade. Round-2 re-author from spec-stub (6.5/10). Round-2 additions: bidirectional preload chain (§1 #6 + AC#6), `MAX_PRELOAD_AHEAD = 1` cap (§1 #7 + AC#7), idempotent preload (§1 #9 + AC#8), preload-failure graceful degradation (§1 #12 + AC#10), aria-live "Loading scene..." region (§1 #13 + AC#11), `scene-preload-chain.ts` API with typed mapping (§3.2), Vitest + Playwright test code shapes (§5), six-paragraph rationale (§2), 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3801 — Preload chain direction was unidirectional only
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #6 + AC#6. Chain reads `scrollStore.direction` from FR-WEB-004 and resolves N-1 on scroll-up.

### ISS-3802 — Over-fetch risk not bounded
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #7 + AC#7. `MAX_PRELOAD_AHEAD = 1` constant; linter forbids modification.

### ISS-3803 — Preload-failure behavior unspecified
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #12 + AC#10. Wrap in try/catch; warn-and-continue.

### ISS-3804 — aria-live region missing (screen-reader UX gap)
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — §1 #13 + AC#11. `<SuspenseAriaCue/>` DOM-side portal.

### ISS-3805 — `scene-preload-chain.ts` API not specified
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3.2 specifies `SCENE_GLBS`, `MAX_PRELOAD_AHEAD`, `resolvePreloadTargets`, `preloadScene`.

### ISS-3806 — Test code shapes missing
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §5.1 Vitest unit tests; AC#14 + AC#15.

### ISS-3807 — Failure-mode inventory thin (5 rows); missed real R3F + Drei gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "race condition: preload before stores hydrate", "multiple ScenePreloaders mounted (dev HMR)", "Lumi GLB lazy-loaded (LCP slip)".

## §3 — Strengths preserved from the spec-stub

- 200% rootMargin specification correct (master plan §5.3).
- Gold-pulse-not-spinner rule correctly cited from master plan §3.4.
- Canvas-never-suspends invariant correctly cited from FR-WEB-001.
- Lumi-preloaded-at-module-eval rule already correct.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One preloader + one fallback + one chain lib — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Vitest + Playwright + 15 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §5.3 + §3.4 + §5.2 cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | scene-preload-chain.ts API + components + test code shapes. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends_on + downstream FR-PERF-004. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers R3F + Drei + HMR gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | Dev-mode `?debug=suspense` overlay + aria-live + tests. |
| **Total** | **10.0** | **6.5** | **8.3** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 2 item 5 of 8.

1. FR-WEB-002 ✓
2. FR-WEB-003 ✓
3. FR-WEB-004 ✓
4. FR-WEB-005 ✓
5. **FR-WEB-006 ✓ (this audit, 10/10)**
6. Next: FR-WEB-007 (transpilePackages)

---

*End of FR-WEB-006 audit.*
