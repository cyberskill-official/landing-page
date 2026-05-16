---
fr_id: FR-SCENE-006
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 5
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-grade from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-SCENE-006 is ship-grade. **The single most important scene comp in the backlog.** Scene 5 is where the site addresses "but you're in Vietnam" head-on. The nón lá moment IS the cultural beat that distinguishes CyberSkill from FPT pricing tier. Get this wrong and the buyer audience exits.

## §2 — Round-1/2 findings (resolved)

### ISS-3001 — Nón lá could appear before Scene 5 (master plan §3.3b breaks)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #3 + AC#4 require nón lá-first-appearance in Scene 5 only; cross-FR audit on Scenes 0-4 comps confirms absence. Conditional rendering on `data-scene` attribute (FR-CHAR-012).

### ISS-3002 — Cost-led messaging could slip into trust strip (kills buyer track)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #11 + AC#9 explicit `grep -i 'cheap|affordable|low.cost|rate'` returns 0. Master plan §1.4 forbids cost-leading.

### ISS-3003 — Globe could render realistic (stock / templated look)
- **severity:** warning
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #1 + AC#1 + `globe-spec.md` specify stylized icosahedral ~ 6k tri with flat shading (no NASA texture).

### ISS-3004 — HCMC coordinate could drift (10.776°N, 106.701°E)
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #2 + AC#2 lock the lat/lon; coordinate spot-check is the verifier.

### ISS-3005 — Founder cultural signoff distinct from designer brand signoff
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #12 + AC#11. Founder (Stephen Cheng) cultural authority on the nón lá moment is its own signoff stage.

## §3 — Strengths preserved from the spec-stub

- Stylized globe (~ 6k tri) cited from master plan §3.4.
- `nonla_appear` + `nonla_tip` clips referenced (master plan §3.3a).
- Arc gold-400 → star-yellow gradient cited from master plan §3.4.
- Time-zone live-clock widget from master plan §9.2 already referenced.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One scene comp + globe + arc spec — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | 12 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Grep + coordinate + cross-FR audit ACs. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §2.1 + §3.4 + §3.3a + §9.2 + §1.4 cited. |
| API/contract precision | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | globe-spec + arc-spec + storyboard + trust strip. |
| Dependencies declared | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | depends on SCENE-001 + CHAR-001 + CHAR-003 + CMS-002; blocks FR-SCENE-017. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | 7 rows; covers cost-leak + premature nón lá + globe styling. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | grep + cross-FR audit + 3 breakpoints. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 4 item 5 of 7.

1-4. ✓
5. **FR-SCENE-006 ✓ (this audit, 10/10)** — the cultural-beat anchor
6. Next: FR-SCENE-007 (Scene 6 CTA Hub)

---

*End of FR-SCENE-006 audit.*
