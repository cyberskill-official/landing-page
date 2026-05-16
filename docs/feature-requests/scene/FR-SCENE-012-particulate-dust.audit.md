---
fr_id: FR-SCENE-012
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
final_revision: 2026-05-16 (round 2; re-author from spec-stub; closes Batch 5)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-SCENE-012 is ship-grade. **Closes Batch 5 (P3 Scene 0 implementations).** The instanced + shader-driven dust pattern delivers cinematic atmosphere at single-draw-call cost. Responsive count + low-memory drop + reduced-motion disable ensures perf budget compliance across device tiers.

## §2 — Round-1/2 findings (resolved)

### ISS-3601 — Per-frame JS position updates would blow CPU budget
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #9 + §2 paragraph 3. Shader-side `uTime` uniform drives motion; useFrame mutates uniform ref only.

### ISS-3602 — Low-memory device handling missing
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #2 lowMemoryMode drops count to 50 regardless of viewport; AC#4 verifies.

### ISS-3603 — Color hardcoded vs token-driven
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — §1 #8 + AC#9 require `--glow-genie-soft` imported from FR-DS-008 module.

### ISS-3604 — Lifetime/respawn pattern undefined (particles could "drain")
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #10 + §7 row 9. `fract(time / lifetime)` shader pattern.

### ISS-3605 — Alpha-fade radius unspecified
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #4 specifies center alpha 1.0, 50% radius 0.3, 70% culled. AC#10 + visual smoke.

### ISS-3606 — Single-draw-call invariant not asserted
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #1 + AC#7 use R3F dev panel + Playwright eval to verify gl.info.render.calls increments by exactly 1.

## §3 — Strengths preserved from the spec-stub

- 200 / 100 / 50 instance counts per breakpoint already correct.
- Additive blending mode named correctly.
- Reduced-motion disable cited from FR-A11Y-001.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One particle system — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 12 MUSTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Vitest + R3F dev panel + 12 ACs. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §3.4 + §6.3 + §7.3 cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | Component shape + shader pattern + color token. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | SCENE-009 + A11Y-001 + WEB-009 + DS-008 + SCENE-022. |
| Failure modes | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers GPU + HMR + depth + post-pass. |
| Observability | 1.0 | 0.4 | 0.6 | 0.9 | 1.0 | Dev `?debug=dust` overlay + R3F panel + Vitest. |
| **Total** | **10.0** | **6.5** | **8.1** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

**This audit closes Batch 5.** All 4 P3 Scene 0 implementation FRs (SCENE-009..012) are now at anchor-grade.

---

## §6 — Upgrade-queue note — Batch 5 closure

**Batch 5 of the spec-stub → anchor-grade campaign is COMPLETE.**

| # | FR | Status | Audit score |
|---|---|---|---:|
| 1 | FR-SCENE-009 (Scene 0 hero implementation) | ✓ accepted (anchor) | 10/10 |
| 2 | FR-SCENE-010 (Lumi anim picker wiring) | ✓ accepted (anchor) | 10/10 |
| 3 | FR-SCENE-011 (above-fold CTA) | ✓ accepted (anchor) | 10/10 |
| 4 | **FR-SCENE-012 (particulate dust)** | ✓ accepted (anchor) | 10/10 |

**Total downstream unblocks delivered by Batch 5: ~8 FR-edges** (Scene 0 unblocks the P4 scene-implementation chain).

Next batches per `docs/launch/upgrade-queue.md`:
- **Batch 6** — FR-CHAR-004, FR-CHAR-005 (2 FRs) — pose library + per-scene greybox.
- **Batch 7..13** — see upgrade-queue.md.

---

*End of FR-SCENE-012 audit (round 2 final — anchor-grade re-author from spec-stub; **closes Batch 5**).*
