---
fr_id: FR-SCENE-010
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
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-SCENE-010 is ship-grade. The driver-pattern anim picker is the discipline anchor — scenes set `currentAnim` in Zustand, picker observes and crossfades. This decouples scene components from imperative Lumi refs and ensures the 200ms ease-genie crossfade is uniform across all 6 scene-implementation FRs that consume it.

## §2 — Round-1/2 findings (resolved)

### ISS-3401 — Driver-pattern vs imperative API ambiguity
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #1 + §2 paragraph 1 specify store-driven picker with useEffect reaction; banned imperative ref-based API.

### ISS-3402 — Crossfade duration hardcoded risk (drift from FR-DS-006)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #3 + AC#9 require CROSSFADE_DURATION imported from motion-tokens; not literal 0.2.

### ISS-3403 — Default-to-idle behavior implicit
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #4 + §3 NON_LOOP_CLIPS set + mixer.finished listener; AC#4 verifies.

### ISS-3404 — Reduced-motion crossfade-skip missing
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — §1 #5 + AC#5. Instant clip switch (no crossFade) under reduced-motion.

### ISS-3405 — Scope creep risk (scene-specific logic in this FR)
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — §1 #10 + §7 row 12 explicit: picker is generic; scene-specific WHEN logic stays in FR-SCENE-NNN.

### ISS-3406 — Mixer lifecycle on unmount unspecified
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #6 + AC#6. stopAllAction + uncacheRoot per FR-WEB-003 disposal contract.

## §3 — Strengths preserved from the spec-stub

- No-setState-in-useFrame rule already correctly cited from FR-WEB-004.
- 200ms crossfade duration already correctly cited from FR-DS-006.
- useAnimations from @react-three/drei correctly named.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One picker hook — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 11 MUSTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Vitest spies + ESLint + 9 ACs. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §3.3a + §5.1 + §6.2 + §3.2 cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | useLumiAnimations hook + NON_LOOP_CLIPS set + Vitest shapes. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends on SCENE-009 + WEB-004 + CHAR-011; blocks 6 scene impls. |
| Failure modes | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Drei + Mixer + HMR + a11y. |
| Observability | 1.0 | 0.4 | 0.6 | 0.9 | 1.0 | Dev warn on unknown clip + Vitest + grep. |
| **Total** | **10.0** | **6.5** | **8.1** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 5 item 2 of 4.

1. FR-SCENE-009 ✓
2. **FR-SCENE-010 ✓ (this audit, 10/10)** — unblocks all 6 scene-impl FRs
3. Next: FR-SCENE-011 (above-fold CTA)
4. Then: FR-SCENE-012 (particulate dust) — closes Batch 5

---

*End of FR-SCENE-010 audit.*
