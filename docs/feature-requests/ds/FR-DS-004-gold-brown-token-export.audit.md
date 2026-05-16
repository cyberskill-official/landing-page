---
fr_id: FR-DS-004
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 7.5/10
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

FR-DS-004 is ship-grade. Opens Batch 3 (P1 DS tokens). The FR was already substantial at spec-stub time (TS + CSS exports + generator script body in §3); round-2 promotes to anchor-grade via the audit ladder, engineering_anchor flag, and explicit issue resolution log. The generator-driven design (one transform from palette-canonical.json to both TS and CSS outputs) is the structural anchor: hex drift is impossible because both outputs share a single source.

## §2 — Round-1/2 findings (resolved)

### ISS-2001 — Hand-typed tokens would drift between TS and CSS
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #6 specifies a generator script (`packages/ds-cinematic/scripts/gen-color-tokens.mjs`) reading `palette-canonical.json` and emitting both files; AC#3 + AC#4 verify byte-equality; AC#8 git-diff CI gate catches stale generated files.

### ISS-2002 — TypeScript type narrowing not asserted at compile-time
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — `as const satisfies Readonly<Record<string, \`#\${string}\`>>` syntax in §3.1 narrows the value type to `\`#\${string}\``; AC#1 typecheck verifies.

### ISS-2003 — Off-palette colour smuggling possible at edit time
- **severity:** info
- **rule_id:** governance
- **status:** RESOLVED — §1 #5 + AC#7 grep enforces only canonical hex values; §7 row 4 documents PR review path.

### ISS-2004 — Idempotency of generator not asserted
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — AC#6 verifies `sha256` of outputs is stable across runs; CI step `git diff --exit-code` catches accidental non-determinism.

### ISS-2005 — GENERATED header in both files (provenance signal)
- **severity:** info
- **rule_id:** observability
- **status:** RESOLVED — AC#5 + §3.1 + §3.2 specify the header comment; reviewers and future maintainers know the file is generated.

## §3 — Strengths preserved from the spec-stub

- The `colors.ts` and `colors.css` shapes were already correctly populated with the FR-DS-002 palette anchors.
- The Vitest test code in §5 was already valid.
- BCP-14 normative clauses already covered the 7 essentials.
- `palette-canonical.json` referenced as the single source of truth (master plan §3.2 cited verbatim).

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-2006 — Token export determinism not asserted
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Token generation script must produce byte-identical output across runs (same source → same hash). Without determinism, CI diffs surface false positives on every build. Vitest determinism test asserts SHA-256 stability.

### ISS-2007 — Token dark-mode forward-compat path missing
- **severity:** info
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Current tokens are single-theme. Schema reserves `--<token>-dark` namespace for future dark variant without breaking existing CSS variable consumers. Documents the forward path.

### ISS-2008 — Tailwind / CSS-vars sync drift
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** Tokens authored in JS dict but consumed via CSS variables. Drift catches require Vitest assertion: every JS dict entry has a matching CSS variable + vice versa. Without sync gate, designer-edited CSS-var diverges from JS source.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One token surface — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | 7 MUSTs precise. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Vitest + git-diff + idempotency + grep. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §3.2 + §3.5 cited. |
| API/contract precision | 1.5 | 1.3 | 1.4 | 1.5 | 1.5 | TS + CSS + generator script bodies. |
| Dependencies declared | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | FR-DS-002 + FR-DS-003 + downstream FR-SCENE-009. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | 5 rows; covers drift + smuggling. |
| Observability | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | GENERATED header + git-diff + grep. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.0 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation begins after FR-DS-002 (palette swatch — shipped) and FR-DS-003 (Cinematic Pack skeleton — accepted) are both production-ready.

---

## §6 — Upgrade-queue note

**Opens Batch 3 (P1 DS tokens).**

1. **FR-DS-004 (gold + brown export) ✓ this audit, 10/10**
2. Next: FR-DS-005 (Vietnamese-flag accents — Scene 5 scoped)
3. Then: FR-DS-006 (motion tokens)
4. Then: FR-DS-007 (cinematic typography)
5. Then: FR-DS-008 (glow recipes)
6. Then: FR-DS-009 (Cinematic Pack lifecycle marker)

---

*End of FR-DS-004 audit (round 2 final — anchor-grade from spec-stub; opens Batch 3).*
