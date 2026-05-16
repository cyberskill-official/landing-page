---
fr_id: FR-DS-006
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

FR-DS-006 is ship-grade. The motion-token surface (duration scale + easing curves) is closed at exactly 7 tokens — drift is blocked by AC#8 grep count. Reduced-motion is wired at both the CSS layer (`@media (prefers-reduced-motion: reduce)`) and the TS layer (`prefersReducedMotion()` SSR-safe helper) — defence in depth.

## §2 — Round-1/2 findings (resolved)

### ISS-2201 — SSR helpers `matchMedia('...')` could throw on server
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #7 + AC#5 specify `typeof window !== 'undefined'` guard; `prefersReducedMotion()` returns `false` on server.

### ISS-2202 — Closed-set drift risk (developer adds 8th token)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — AC#8 grep count enforces exactly 7 tokens; amendment FR required to extend.

### ISS-2203 — Reduced-motion not wired to CSS layer (TS-only honour)
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — §3 `motion.css` includes `@media (prefers-reduced-motion: reduce)` block; AC#7 verifies block presence + duration overrides.

### ISS-2204 — Ease curves bound to GSAP-specific syntax
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — Tokens are pure `cubic-bezier(...)` values; consumable by CSS transition, GSAP, Framer Motion, R3F TSL.

### ISS-2205 — Duration scale numerical anchor missing
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 + §3 specify the scale: 80ms (instant) / 200ms (fast) / 400ms (default) / 800ms (slow) / 2000ms (cinematic). Master plan §3.2.

## §3 — Strengths preserved from the spec-stub

- 7-token closed set already correctly enumerated.
- Reduced-motion sensitivity correctly cited from master plan §7.3.
- TS const + CSS variable dual export already correct.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One motion token surface — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | Precise MUSTs. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Vitest + JSDOM @media + count grep. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §3.2 + §7.3 cited. |
| API/contract precision | 1.5 | 1.3 | 1.4 | 1.5 | 1.5 | TS + CSS + SSR-safe helper. |
| Dependencies declared | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | FR-DS-003 + downstream FR-A11Y-001. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | 5 rows; covers SSR + drift. |
| Observability | 1.0 | 0.4 | 0.6 | 0.9 | 1.0 | Grep + JSDOM + a11y test. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 3 item 3 of 6.

1. FR-DS-004 ✓
2. FR-DS-005 ✓
3. **FR-DS-006 ✓ (this audit, 10/10)**
4. Next: FR-DS-007 (cinematic typography)

---

*End of FR-DS-006 audit.*
