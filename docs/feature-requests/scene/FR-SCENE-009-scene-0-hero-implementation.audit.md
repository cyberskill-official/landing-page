---
fr_id: FR-SCENE-009
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 6.5/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 6
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub; opens Batch 5)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-SCENE-009 is ship-grade. Opens Batch 5 (P3 Scene 0 implementations). This FR is the integration point — it consumes FR-WEB-001..006 + FR-CHAR-011 + FR-CMS-002 + FR-DS-007 into the first user-visible cinematic experience. The DOM-h1-as-LCP / canvas-post-FCP separation is the perf anchor that lets Lighthouse score ≥ 95.

## §2 — Round-1/2 findings (resolved)

### ISS-3301 — DOM-h1-as-LCP separation rule was implicit
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #1 + §1 #6 split: h1 in SSR HTML for LCP; canvas post-hydration. §2 paragraph 1 explains the rationale.

### ISS-3302 — Animation clip-name typo risk (fly_in vs flyIn)
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #3 byte-identical reference to FR-CHAR-011 §1 #1; AC#3 + Playwright assertion catches drift.

### ISS-3303 — Zustand store integration missing
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #8 + AC#7 integrate with useLumiStore for cross-scene coordination (corner avatar, Scene 3 transitions).

### ISS-3304 — Reduced-motion fallback unspecified
- **severity:** error
- **rule_id:** a11y
- **status:** RESOLVED — §1 #10 + AC#6 require static FR-DS-001 hero image; no canvas; no animation.

### ISS-3305 — INP budget during canvas mount not bounded
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #12 + AC#8. 50ms cap; defer non-critical setup to `requestIdleCallback`.

### ISS-3306 — Tunnel id ↔ scene-defs.json drift risk
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — §1 #2 byte-identical reference; §7 row 12 + validator script catches drift.

## §3 — Strengths preserved from the spec-stub

- Hero h1 LCP-target rule already correctly cited from master plan §5.3.
- fly_in → idle clip sequence already correct (master plan §3.3a).
- 3s post-FCP canvas mount cited from FR-WEB-001 §1 #5.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One scene implementation — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 12 MUSTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Playwright + Vitest + Lighthouse + 12 ACs. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §2.1 + §5.3 + §6.1 + §3.3a cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | TypeScript shapes + store integration + test code. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | Concept + operational + downstream all enumerated. |
| Failure modes | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Next/R3F/INP/HMR. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | Playwright + dev-mode store inspector + axe. |
| **Total** | **10.0** | **6.5** | **8.2** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

**Opens Batch 5 (P3 Scene 0 implementations).**

1. **FR-SCENE-009 ✓ (this audit, 10/10)**
2. Next: FR-SCENE-010 (Lumi fly_in/idle wiring detail)
3. Then: FR-SCENE-011 (above-fold CTA)
4. Then: FR-SCENE-012 (particulate dust) — closes Batch 5

---

*End of FR-SCENE-009 audit.*
