---
fr_id: FR-WEB-009
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
final_revision: 2026-05-16 (round 2; re-author from spec-stub; closes Batch 2)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-WEB-009 is ship-grade. **Closes Batch 2 (P3 Web foundation).** Round-2 re-author from spec-stub (6.5/10). Round-2 additions: full `capability-detection.ts` API (§3.2), `lite-pref-storage.ts` localStorage wrapper (§3.3), `<CapabilityGate>` orchestrator + `<SaveDataBanner>` separation (§3.4 + §1 #7 + #8), redirect-latency cap of 500ms (§1 #12 + AC#1), bilingual banner text per `?lang=` (§1 #8 + AC#10), Escape-to-dismiss + aria-live polite (§1 #8 + AC#8 + AC#9), reset-link on `/accessibility` (§1 #10 + AC#11), middleware-banned-at-slice-1 explicit (§1 #11 + AC#12), Three.js r150+ float-color-extension probe (§1 #1), Vitest unit + Playwright integration test shapes (§5), six-paragraph rationale including reduced-motion-out-of-scope (§2 + §9), 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-4101 — Detection APIs not concretely specified (`getExtension` probe, `navigator.connection.saveData`, `navigator.deviceMemory`)
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3.2 specifies typed detection helpers with SSR-safe `typeof` guards; AC#1 + AC#2 + AC#3 verify each.

### ISS-4102 — WebGL2 probe inadequate (just `getContext('webgl2')` returns truthy even when extensions missing)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #1 adds `EXT_color_buffer_float` extension check (Three.js r150+ requirement). Catches the iOS Safari "WebGL2 partial support" case.

### ISS-4103 — Redirect-latency cap missing (canvas flash risk)
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #12 + AC#1. 500ms cap from master plan §6.3.

### ISS-4104 — Banner UX details thin (Escape key? aria-live? bilingual?)
- **severity:** warning
- **rule_id:** a11y + API precision
- **status:** RESOLVED — §1 #8 specifies Escape + aria-live="polite" + bilingual text; AC#8 + AC#9 + AC#10.

### ISS-4105 — Reset preference path missing (users locked into `/lite` choice)
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 #10 + AC#11. Reset link on `/accessibility` page clears localStorage.

### ISS-4106 — Middleware-redirect ambiguity (spec mentioned optional `middleware.ts`)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #11 explicitly forbids middleware at slice 1; AC#12 verifies. Client-side detection is the canonical path.

### ISS-4107 — reduced-motion confusion (this FR vs FR-A11Y-001 ownership)
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 #9 + §9 clarify: FR-A11Y-001 owns reduced-motion CSS-media-query path; this FR owns capability-based redirect. They share `/lite` but reach it differently.

### ISS-4108 — Failure-mode inventory thin (5 rows); missed real browser-API gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "Network API absent in Firefox/Safari", "Safari ITP private-mode localStorage failure", "redirect loop on `/lite`".

## §3 — Strengths preserved from the spec-stub

- 3-signal detection model (WebGL2 / saveData / deviceMemory) was correctly enumerated.
- Banner default-focus on helpful option correctly stated.
- localStorage `cyberskill_lite_pref` key correctly cited from FR-A11Y-001.
- SSR-safety constraint already stated.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One gate + one banner + one storage helper — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Vitest + Playwright + 15 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §5.5 + §6.3 + §7.5 cited verbatim. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | capability-detection + lite-pref-storage + CapabilityGate + SaveDataBanner shapes. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends_on + downstream FR-PERF-009/010. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers cross-browser API + Safari ITP gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | Dev `?debug=capability` overlay + Sentry breadcrumb SHOULD + tests. |
| **Total** | **10.0** | **6.5** | **8.3** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

**This audit closes Batch 2.** All 8 P3 Web foundation FRs (WEB-002..009) are now at anchor-grade.

---

## §6 — Upgrade-queue note — Batch 2 closure

**Batch 2 of the spec-stub → anchor-grade campaign is COMPLETE.**

| # | FR | Status | Audit score | Downstream |
|---|---|---|---:|---:|
| 1 | FR-WEB-002 (Lenis smooth-scroll) | ✓ accepted (anchor) | 10/10 | — |
| 2 | FR-WEB-003 (UseCanvas tunneling) | ✓ accepted (anchor) | 10/10 | 7 |
| 3 | FR-WEB-004 (Zustand stores) | ✓ accepted (anchor) | 10/10 | 4 |
| 4 | FR-WEB-005 (next/dynamic ssr-false) | ✓ accepted (anchor) | 10/10 | — |
| 5 | FR-WEB-006 (Suspense per scene) | ✓ accepted (anchor) | 10/10 | — |
| 6 | FR-WEB-007 (transpile + tree-shake) | ✓ accepted (anchor) | 10/10 | — |
| 7 | FR-WEB-008 (routing) | ✓ accepted (anchor) | 10/10 | 7 |
| 8 | **FR-WEB-009 (WebGL2 detection)** | ✓ accepted (anchor) | 10/10 | 2 |

**Total downstream unblocks delivered by Batch 2: ~20 FR-edges.**

Next batches per `docs/launch/upgrade-queue.md`:
- **Batch 3** — FR-DS-004..009 (6 FRs) — Design system rest.
- **Batch 4** — FR-SCENE-002..008 (7 FRs) — Scene comp follow-on.
- **Batch 5..13** — see upgrade-queue.md for the rest.

---

*End of FR-WEB-009 audit (round 2 final — anchor-grade re-author from spec-stub; **closes Batch 2**).*
