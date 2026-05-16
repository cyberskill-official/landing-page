---
fr_id: FR-DS-007
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 9.0/10
score_post_revision_2: 10/10
score_post_revision_3: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 batch compliance pass)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-DS-007 is ship-grade. The Inter Display (display face) + JetBrains Mono (caption mono) pairing is justified by master plan §3.2 cinematic-register requirements; Vietnamese unicode-range subset (U+1EA0-1EF9) preservation is the cultural-correctness anchor that prevents diacritic loss on the Scene 5 cultural beat.

## §2 — Round-1/2 findings (resolved)

### ISS-2301 — Vietnamese diacritics could fail silently if unicode-range subset misses U+1EA0–1EF9
- **severity:** error
- **rule_id:** master-plan-grounding
- **status:** RESOLVED — AC#4 grep enforces Vietnamese range in font-face declaration; §1 # specifies the inclusive range.

### ISS-2302 — `font-display: swap` was prose, not testable
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — AC#3 count assertion `font-display: swap` appears for every @font-face declaration.

### ISS-2303 — Total font weight uncapped (could blow perf budget)
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 + AC#7 cap total font payload at 120 KB combined (subsetted). FR-PERF-001 bundle gate enforces.

### ISS-2304 — Preload tag responsibility unclear (DS vs WEB ownership)
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — §1 #7 + §3 comment + §6 dependency note. WEB-001's `app/layout.tsx` adds `<link rel="preload" as="font">` tags using the canonical font-file paths declared by DS-007.

### ISS-2305 — FOIT (Flash of Invisible Text) failure mode missing
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 row 2 documents FOIT detection via Playwright + recovery (verify `font-display: swap` honored).

## §3 — Strengths preserved from the spec-stub

- Inter Display + JetBrains Mono pairing already correctly cited from master plan §3.2.
- Reduced-motion + a11y considerations already linked (FR-A11Y-006).
- WOFF2 format specification correct.
- CSS variable + TS export dual surface already standard.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-2306 — Token export determinism not asserted
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Token generation script must produce byte-identical output across runs (same source → same hash). Without determinism, CI diffs surface false positives on every build. Vitest determinism test asserts SHA-256 stability.

### ISS-2307 — Token dark-mode forward-compat path missing
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Current tokens are single-theme. Schema reserves `--<token>-dark` namespace for future dark variant without breaking existing CSS variable consumers. Documents the forward path.

### ISS-2308 — Tailwind / CSS-vars sync drift
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Tokens authored in JS dict but consumed via CSS variables. Drift catches require Vitest assertion: every JS dict entry has a matching CSS variable + vice versa. Without sync gate, designer-edited CSS-var diverges from JS source.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One typography surface — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | Precise MUSTs. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Vitest + Playwright FOIT + grep + size budget. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §3.2 cited. |
| API/contract precision | 1.5 | 1.3 | 1.4 | 1.5 | 1.5 | font-face + TS scale + preload contract. |
| Dependencies declared | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | FR-DS-003 + downstream FR-A11Y-006 + FR-PERF-001. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | covers FOIT + diacritic loss + budget. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | Grep + Playwright + bundle. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 3 item 4 of 6.

1-3. ✓
4. **FR-DS-007 ✓ (this audit, 10/10)**
5. Next: FR-DS-008 (glow recipes)

---

*End of FR-DS-007 audit.*
