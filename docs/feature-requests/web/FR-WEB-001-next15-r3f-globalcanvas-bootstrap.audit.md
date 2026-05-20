---
fr_id: FR-WEB-001
audited: 2026-05-16
auditor: manual (engineering-spec@1 + feature-request-audit skill §3.12 compliance pass round 3)
verdict: PASS
score_pre_revision: 8.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_resolved: 9
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; feature-request-audit skill compliance re-audit against expanded 457-line spec)
authoring_md_compliance: §3.12 #36 — 9 ISS findings (≥ 6 required) ✓
---

## §1 — Verdict summary

FR-WEB-001 is the foundational WEB FR — the spec that locks the Next 15 + React 19 + R3F 9 + Three.js r184 stack and codifies the GlobalCanvas-outside-router pattern. At 457 lines with 16 normative MUSTs, 14 acceptance criteria, 3 test blocks (Vitest + bundle-budget + Playwright), and 10-row failure-modes table, it is the most surface-area-dense FR in the project.

Round-3 re-audit (this pass) adds 3 NEW ISS findings against the expanded content that were not surfaced in R1/R2 (which audited a shorter earlier version). Total: 9 ISS findings — well above the feature-request-audit skill §3.12 #36 ≥ 6 threshold.

**Verdict:** ship-grade. Implementation can start Monday 2026-05-19 from this spec without further questions.

## §2 — Round-1 findings (resolved; preserved)

### ISS-301 — Bundle budget was prose
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §4 #6 + §5 `bundle-budget.spec.ts` with gzip-byte assertion against `.next/static/chunks/main-*.js`.

### ISS-302 — "GlobalCanvas outside router" was prose
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §4 #4 grep enforces it; §1 #3 is normative; §3.3 layout.tsx mock is the canonical placement.

### ISS-303 — prefers-reduced-motion path not tested
- **severity:** warning
- **rule_id:** a11y
- **status:** RESOLVED — §4 #12 + Playwright with `reducedMotion: 'reduce'` context option verifies canvas never mounts.

### ISS-304 — No assertion that SSR HTML omits three
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §4 #5 `curl + grep`. This is the single most important check for the LCP guarantee.

## §3 — Round-2 findings (resolved; preserved)

### ISS-305 — WebGL context-loss-on-nav not in failure modes
- **severity:** info
- **rule_id:** governance/observability
- **status:** RESOLVED — §7 row 2 added with detection (manual smoke + OBS) + recovery (verify layout placement).

### ISS-306 — `transpilePackages` Next-version drift
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — §7 row 10 flags the option moved out of `experimental` in Next 14; future minor bumps need verification.

## §4 — Round-3 findings (NEW — opened against current expanded content)

### ISS-307 — TypeScript strict mode not explicitly required
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #16a (new) mandates `"strict": true` in `tsconfig.json`. Without strict mode, type-safety gaps downstream (especially around `useRef<HTMLCanvasElement | null>(null)` discriminated unions for R3F refs).
- **resolution location:** §1 new clause #16a + §4 AC#15 grep check
- **why it matters:** Three.js + R3F ref types are heavy on optional / nullable values; strict mode catches `geometry.dispose()` on null refs at compile-time vs runtime.

### ISS-308 — HMR persistent-canvas behavior unspecified
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #16b (new) requires GlobalCanvasShell to survive React Fast Refresh / HMR without WebGL context-loss. Dev-mode failure mode added to §7. Pattern: wrap GlobalCanvasShell in `useState(() => createSingleton())` to prevent HMR-driven re-init.
- **resolution location:** §1 new clause #16b + §7 row 11 (new) + §8 Note 5 (new)
- **why it matters:** Without explicit handling, every hot-reload during dev = WebGL context destroyed + recreated → developer experience degradation + missed issues in dev.

### ISS-309 — Dynamic hero h1 (CMS-driven) tension with SSR-static-LCP guarantee
- **severity:** warning
- **rule_id:** API/contract precision + cross-FR consistency
- **status:** RESOLVED — §1 #5 (existing) tightened: hero `<h1>` SSR-rendered means **server-side rendered at build OR ISR-revalidate time** (FR-CMS-005). When FR-CMS-006 provides dynamic /work/[slug] hero, that hero is ALSO SSR-rendered (not client-fetched). The SSR-LCP guarantee is preserved across both static-home and dynamic-case-study paths.
- **resolution location:** §1 #5 clarified + §6 dependencies note (cross-ref FR-CMS-005/006) + new failure mode row 12
- **why it matters:** Without this clarification, an enthusiastic engineer might use `"use client"` + `useEffect(() => fetch(...))` for the hero h1, breaking the SSR-LCP contract silently.

## §5 — Strengths preserved across all rounds

- §2 rationale walks through each design choice with the specific master-plan section + the failure mode it prevents. Future Lead reading this in a year has no mystery.
- §3 contract carries real `package.json`, `next.config.ts`, `layout.tsx`, `CanvasMount.tsx`, `feature-detect.ts` excerpts — copy-pasteable.
- §5 verification block has three orthogonal proofs: Vitest (file-structure), bundle-byte assertion (bundle), Playwright (runtime e2e).
- §3.1 "pragmatic note" on dev vs runtime deps surfaces a community-debated nuance honestly rather than papering over it.
- 16 normative §1 clauses cover every architectural decision named.
- §7 failure modes inventory (10 rows; 12 after R3 additions) covers every architectural decision's failure path.

## §6 — Rubric scoring (per feature-request-audit skill §7)

| Dimension | Weight | Pre | Post-R1 | Post-R2 | **Post-R3** |
|---|---:|:-:|:-:|:-:|:-:|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | **1.0** |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 1.0 | **1.0** |
| Testability | 2.0 | 1.5 | 1.9 | 2.0 | **2.0** |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | 1.5 | **1.5** |
| API/contract precision | 1.5 | 1.4 | 1.5 | 1.5 | **1.5** (R3 ISS-307/309 tightened further) |
| Dependencies declared | 1.0 | 1.0 | 1.0 | 1.0 | **1.0** |
| Failure-modes inventory | 1.0 | 0.6 | 0.8 | 1.0 | **1.0** (R3 ISS-308/309 added 2 rows) |
| Observability hooks | 1.0 | 0.5 | 0.8 | 1.0 | **1.0** |
| **TOTAL** | **10.0** | **8.5** | **9.5** | **10.0** | **10/10** ✓ |

R3 maintained 10/10 while adding genuine new specificity. ISS-307 + ISS-308 + ISS-309 are all "tighten the contract" findings, not "score-changing" findings — the score is already at ceiling.

## §7 — Resolution

**Score = 10/10. Status: accepted.**

R3 re-audit unblocks confident implementation start. The 9 ISS findings demonstrate proper pressure-testing of every architectural surface:
- 4 R1 findings caught initial specification gaps.
- 2 R2 findings caught observability + version-drift gaps.
- 3 R3 findings caught dev-mode (HMR), strict-typing, and cross-FR SSR consistency gaps.

This is the feature-request-audit skill §0 master rule expressed correctly: loop audit rounds until perfect. The original audit (R2 final) was already at 10/10 against the content of its time. R3 re-audited against the expanded content and surfaced 3 more legitimate findings.

## §8 — Implementation-readiness signal

Engineers can scaffold `apps/web` Monday 2026-05-19 from this spec. The 9 audited findings ensure:
- Bundle budget machine-checkable (R1).
- GlobalCanvas placement machine-checkable (R1).
- Reduced-motion path tested (R1).
- SSR-LCP guarantee tested (R1).
- Context-loss-on-nav surfaced as failure mode (R2).
- TypeScript strict mode enforced (R3).
- HMR / Fast Refresh behavior defined (R3).
- Cross-FR SSR consistency clarified (R3).

## §9 — Cross-references

- **Canonical R3 pattern source:** `scene/FR-SCENE-017-implementation.audit.md` round 3.
- **Audit-debt report:** `_AUDIT_DEBT_REPORT_2026-05-16.md` — this is item 2 of 12 HIGH chokepoints.
- **Downstream FRs unblocked:** FR-WEB-002..009, FR-SCENE-009..024, FR-OPS-010, FR-PERF-001.

## §10 — Upgrade-queue note

Batch 2 anchor-grade upgrade — round 3 re-audit applied per feature-request-audit skill §3.12 compliance. Next chokepoint to re-audit: FR-WEB-004 (Zustand store pattern).

*End of FR-WEB-001 audit (round 3 final).*
