---
fr_id: FR-WEB-002
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
final_revision: 2026-05-16 (round 2; re-author from spec-stub; opens Batch 2)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-WEB-002 is ship-grade. Opens Batch 2 (P3 web foundation). Round-2 re-author from spec-stub (6.5/10 on 2026-05-16). Round-2 additions: explicit Lenis 1.3 pinning rationale (§1 #1 + §2), the `gsap.ticker.add` RAF-merge pattern with `lagSmoothing(0)` (§1 #7 + §2 paragraph 3), the `/lite` route bypass (§1 #12), the singleton pattern + typed hooks (§1 #3 + #14 + §3.2), the `scrollerProxy` register-once guard (§1 #7 + AC#9), the overscroll-bounce-preserved rule (§1 #9 + AC#13), the bridge cleanup contract (§3.3 + §7 row 4), the anchor-link interception rule (§1 #10 + AC#6), the dev-mode debug overlay (§1 #15 + AC#15), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3401 — Lenis version not pinned; 1.4+ breaking changes risk
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #1 pins to `~1.3.0`; AC#11 + ESLint package-lock check enforces.

### ISS-3402 — Singleton vs provider-state ambiguity
- **severity:** error
- **rule_id:** normative-precision
- **status:** RESOLVED — §1 #3 + §3.2 specify module-level `let lenisInstance: Lenis | null = null` pattern. §2 paragraph 2 explains why singleton (ScrollTrigger one-scroller rule + R3F single-source-of-truth).

### ISS-3403 — `gsap.ticker.add` + `lagSmoothing(0)` pattern missing
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #7 specifies bridging pattern + lag-smoothing disable; §2 paragraph 3 explains the double-RAF + double-smoothing failure modes; AC#8 verifies.

### ISS-3404 — `/lite` route bypass implicit
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §1 #12 + AC#7. `/lite` is FR-A11Y-001's reduced-motion fallback; wrapping in Lenis defeats the purpose.

### ISS-3405 — `useScrollProgress` hook missing (raw Lenis exposure leaks types)
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #14 + §3.2 expose `useScrollProgress(): number` and `useLenis(): Lenis | null` separately; consumers prefer the narrow hook.

### ISS-3406 — Reduced-motion mid-session toggle not handled
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #4 specifies `matchMedia('...').addEventListener('change', ...)` rebuild; AC#14 verifies.

### ISS-3407 — Overscroll-bounce killing risk not flagged
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 #9 forbids `overscroll: none`; AC#13 verifies; §7 row 7 documents recovery.

### ISS-3408 — Failure-mode inventory thin (5 rows); missed Next.js / dev-HMR gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "singleton re-instantiated on dev HMR" (the silent ScrollTrigger breaker), "Lenis 1.4+ bundle bloat", "smoothTouch on mobile feels off".

## §3 — Strengths preserved from the spec-stub

- "Never override scroll velocity" rule was already correctly cited from master plan §2.3.
- prefers-reduced-motion rule was correctly cited from master plan §7.3.
- Keyboard a11y preservation was already correctly stated.
- SSR-safety constraint was already correctly stated.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One scroll layer, one singleton — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 15 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Playwright suite + 15 ACs each named tool / threshold. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §5.1 + §2.3 + §7.3 + §5.2 cited verbatim. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | Singleton interface + provider shape + bridge function + Playwright test code shape. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends_on + a11y concept dep + operational + downstream all enumerated. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Next/HMR + Lenis-version + mobile gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | Dev-mode debug overlay + window.__lenis exposure + Playwright assertions. |
| **Total** | **10.0** | **6.5** | **8.3** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation begins after FR-WEB-001 (Next 15 + R3F bootstrap) is shipped. FR-WEB-001 is currently `accepted` at anchor-grade; shipping requires a working scaffold (already in place per scaffold task #24).

---

## §6 — Upgrade-queue note

**Opens Batch 2 (P3 Web foundation).**

| # | FR | Status |
|---|---|---|
| 1 | **FR-WEB-002 (Lenis smooth-scroll)** | ✓ this audit, 10/10 |
| 2 | FR-WEB-003 (UseCanvas tunneling) | pending — 7 downstream |
| 3 | FR-WEB-004 (Zustand stores) | pending — 4 downstream |
| 4 | FR-WEB-005 (next/dynamic ssr-false) | pending |
| 5 | FR-WEB-006 (Suspense per scene) | pending |
| 6 | FR-WEB-007 (transpilePackages) | pending |
| 7 | FR-WEB-008 (routing) | pending — 5 downstream |
| 8 | FR-WEB-009 (WebGL2 detection) | pending |

---

*End of FR-WEB-002 audit (round 2 final — anchor-grade re-author from spec-stub; opens Batch 2).*
