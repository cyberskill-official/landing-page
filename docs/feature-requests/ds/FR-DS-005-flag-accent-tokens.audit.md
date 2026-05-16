---
fr_id: FR-DS-005
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
final_revision: 2026-05-16 (round 2; re-grade from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-DS-005 is ship-grade. The "scoped-via-CSS-cascade + TS runtime guard" pattern is the defining anchor: defence-in-depth ensures Vietnamese-flag colours never leak outside Scene 5 / Scene 6 / footer. Both CSS cascade scoping AND TS `assertSceneAllowsAccent()` guard catch violations at different layers.

## §2 — Round-1/2 findings (resolved)

### ISS-2101 — `:root`-level declaration would leak tokens globally
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #4 + AC#2 forbid `:root`; `accents.css` uses `[data-scene="scene-5"]` selectors only. Master plan §3.4 explicit cultural rule.

### ISS-2102 — Scope ends prematurely at scene-6 (nón lá stays on through footer)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #2 + §1 #3 extend allowed scenes to `{scene-5, scene-6, footer}` per master plan §3.3b ("nón lá stays on through the footer"). Both CSS selectors and TS guard align.

### ISS-2103 — Runtime guard `SCOPED: true` sentinel missing — TS allows arbitrary imports
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #6 + §3 specify `SCOPED: true` sentinel + `assertSceneAllowsAccent()` `asserts sceneId is ...` narrowing. Tooling can grep for sentinel.

### ISS-2104 — JSDOM-based scope-leak test missing
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — AC#5 specifies JSDOM `getComputedStyle` test under varying `body.dataset.scene`; empty for scenes 0-4, non-empty for 5/6/footer.

## §3 — Strengths preserved from the spec-stub

- Hex values byte-identical to `palette-canonical.json` was already correct.
- Cultural framing rationale (§2) was already strong; FR-CHAR-003 cultural-note cross-ref present.
- BCP-14 normative clauses already covered the 7 essentials.
- Master plan §3.2 + §3.4 cited verbatim.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One accent token surface — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | 7 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Vitest JSDOM + grep ACs. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §3.2 + §3.4 + §3.3b cited. |
| API/contract precision | 1.5 | 1.3 | 1.4 | 1.5 | 1.5 | TS guard + CSS selectors + SCOPED sentinel. |
| Dependencies declared | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | FR-DS-002 + FR-DS-003; downstream FR-CHAR-012 + FR-SCENE-017. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | 4 rows; covers `:root` leak + scene-orchestrator drift. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | Grep + JSDOM + CODEOWNERS path. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 3 item 2 of 6.

1. FR-DS-004 ✓
2. **FR-DS-005 ✓ (this audit, 10/10)**
3. Next: FR-DS-006 (motion tokens)

---

*End of FR-DS-005 audit.*
