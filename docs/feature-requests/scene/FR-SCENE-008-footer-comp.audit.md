---
fr_id: FR-SCENE-008
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 4
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-grade from spec-stub; closes Batch 4)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-SCENE-008 is ship-grade. **Closes Batch 4 (SCENE comps 2..8).** The footer + persistent-Lumi-corner is the cinematic conceit's narrative bookend (Lumi was there at start, Lumi is there at end). The persistence rule (nón lá stays on through footer) + the wave_goodbye-on-scroll-back behaviour preserve the storytelling closure.

## §2 — Round-1/2 findings (resolved)

### ISS-3201 — Persistent corner avatar might lose nón lá (cultural-arc break)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #3 + AC#2 require nón lá ON in corner avatar; master plan §3.3b "Lumi has chosen its identity" explicit. Failure mode row 1 catches at visual review.

### ISS-3202 — Trust signals could include aspirational certifications (ISO/SOC 2)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — AC#11 cross-FR check against FR-SEO-001's Schema.org claims; §4 row 2 forbids aspirational text.

### ISS-3203 — Lumi corner state diagram missing (3 states: idle/hover/scroll-back-up)
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #9 + `lumi-corner-state-diagram.md` documents the 3 states with FR-CMS-002 `lumi-tagline-hover` integration.

### ISS-3204 — Vietnamese diacritics could corrupt founder name (Trịnh Thái Anh)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §4 failure-mode row 4 UTF-8 build pipeline check (cite FR-SEO-001 §7 row 4).

## §3 — Strengths preserved from the spec-stub

- `wave_goodbye` clip transition cited (master plan §3.3a).
- Persistent corner avatar 48×48 + top-right cited (master plan §2.1).
- Trust signals from master plan §9.2 enumerated.
- Language switcher (EN/VI) text-only (no flag icons) discipline correct.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One footer comp + corner-state diagram — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | 10 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Caption-verbatim + state-count + cross-FR ACs. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §2.1 + §3.4 + §3.3a + §3.3b + §9.2 cited. |
| API/contract precision | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | corner-state-diagram + trust-signals layout + bilingual tagline binding. |
| Dependencies declared | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | depends on SCENE-001 + CHAR-001 + CHAR-003 + CMS-002; blocks FR-SCENE-019 + FR-CHAR-005. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | covers nón lá drop + ISO leak + diacritic corruption + scroll-back jank. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | 3 breakpoints + state diagram + storyboard. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

**This audit closes Batch 4.** All 7 SCENE comps 2..8 are now at anchor-grade.

---

## §6 — Upgrade-queue note — Batch 4 closure

**Batch 4 of the spec-stub → anchor-grade campaign is COMPLETE.**

| # | FR | Status | Audit score |
|---|---|---|---:|
| 1 | FR-SCENE-002 (Scene 1 Origin comp) | ✓ accepted (anchor) | 10/10 |
| 2 | FR-SCENE-003 (Scene 2 Transformation) | ✓ accepted (anchor) | 10/10 |
| 3 | FR-SCENE-004 (Scene 3 Capabilities) | ✓ accepted (anchor) | 10/10 |
| 4 | FR-SCENE-005 (Scene 4 Team) | ✓ accepted (anchor) | 10/10 |
| 5 | FR-SCENE-006 (Scene 5 Vietnam→Global) | ✓ accepted (anchor) | 10/10 ← cultural anchor |
| 6 | FR-SCENE-007 (Scene 6 CTA Hub) | ✓ accepted (anchor) | 10/10 |
| 7 | **FR-SCENE-008 (Footer + Lumi corner)** | ✓ accepted (anchor) | 10/10 |

**Total downstream unblocks delivered by Batch 4: ~10 FR-edges** (each scene comp unblocks its FR-SCENE-NNN implementation FR in P4).

Next batches per `docs/launch/upgrade-queue.md`:
- **Batch 5** — FR-SCENE-009..012 (4 FRs) — P3 Scene 0 polished implementations.
- **Batch 6** — FR-CHAR-004, FR-CHAR-005 (2 FRs) — pose library + per-scene greybox.
- **Batch 7..13** — see upgrade-queue.md.

---

*End of FR-SCENE-008 audit (round 2 final — anchor-grade re-grade from spec-stub; **closes Batch 4**).*
