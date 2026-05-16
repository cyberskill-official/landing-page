---
fr_id: FR-WEB-007
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 7.5/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-WEB-007 is ship-grade. Round-2 re-author from spec-stub (6.5/10). Round-2 additions: full next.config.ts shape with `webpack` callback (§3.2), ESLint custom rule `no-namespace-three` (§1 #4 + §3.3 + AC#3), Vitest build-time grep test (§5.1 + AC#8), `transpilePackages` minimal-list discipline with amendment-required guard (§1 #7 + AC#11), `sideEffects: false` for first-party ESM packages (§1 #10 + AC#10), tree-shake regression test (§1 #15 + AC#12), `bundle.config.notes.md` rationale doc (§1 #13 + AC#9), six-paragraph rationale (§2), 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-3901 — `next.config.ts` shape was prose
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3.2 specifies full webpack callback + tree-shake flags.

### ISS-3902 — Namespace-import enforcement was grep-only; no ESLint
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #4 + §3.3. Custom ESLint rule fails build at lint time.

### ISS-3903 — `transpilePackages` could grow unjustified
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #7 + AC#11. Minimal-list rule; amendments required.

### ISS-3904 — `sideEffects: false` on first-party packages not enforced
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #10 + AC#10. `packages/ds-cinematic/package.json` must set it.

### ISS-3905 — Tree-shake regression test missing
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #15 + AC#12. Bundle-analyzer artefact verifies unused exports not shipped.

### ISS-3906 — Rationale doc adjacent to config missing
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §1 #13 + AC#9. `bundle.config.notes.md` documents WHY each option exists.

### ISS-3907 — Failure-mode inventory thin (4 rows)
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "build slow due to over-transpilation", "Custom ESLint rule false positives", "experimental.optimizePackageImports conflict".

## §3 — Strengths preserved from the spec-stub

- `transpilePackages: ['three']` rule correctly cited from master plan §6.1.
- `usedExports: true` tree-shake flag correctly named.
- Cross-ref to bundle budget already correct.
- `transpileModules` deprecation flag already noted.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One config file + one lint rule — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Vitest + bundle-analyzer + 15 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §6.1 + §5.1 cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | next.config.ts shape + ESLint rule shape + Vitest test. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends_on + downstream FR-PERF-001/002. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Next 15 + webpack 5 gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | Bundle-analyzer artefact + Vitest grep + rationale doc. |
| **Total** | **10.0** | **6.5** | **8.3** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 2 item 6 of 8.

1. FR-WEB-002 ✓
2. FR-WEB-003 ✓
3. FR-WEB-004 ✓
4. FR-WEB-005 ✓
5. FR-WEB-006 ✓
6. **FR-WEB-007 ✓ (this audit, 10/10)**
7. Next: FR-WEB-008 (routing — 5 downstream)

---

*End of FR-WEB-007 audit.*
