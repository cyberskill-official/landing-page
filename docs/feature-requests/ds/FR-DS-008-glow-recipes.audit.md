---
fr_id: FR-DS-008
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

FR-DS-008 is ship-grade. Three glow recipes (`--glow-genie-rim`, `--glow-genie-soft`, `--glow-scene-edge`) are the closed set defining all motion-of-light usage across the cinematic. The R3F-color adapter bridges DOM-side CSS variables to GPU-side `THREE.Color` instances, so glow tokens work uniformly in CSS shadows, R3F materials, and post-processing passes.

## §2 — Round-1/2 findings (resolved)

### ISS-2401 — No conversion path for R3F consumers (CSS rgba unusable in shaders)
- **severity:** error
- **rule_id:** API/contract precision
- **status:** RESOLVED — §3 + AC#3 specify `glowAsThreeColor(name)` adapter returning `{ color: THREE.Color, intensity: number }` for material `emissiveColor` + `emissiveIntensity` binding.

### ISS-2402 — Recipe count not enforced (drift to 4+ glows possible)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — AC#4 `Object.keys(glow).length === 3` assertion; amendments required.

### ISS-2403 — SSR-safety for the `glowAsThreeColor` adapter
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — AC#6 + `typeof window !== 'undefined'` guard; returns sentinel value on server.

### ISS-2404 — Suspense fallback consumer (FR-WEB-006) dependency not declared
- **severity:** info
- **rule_id:** dependencies
- **status:** RESOLVED — Frontmatter `blocks: [FR-WEB-006]` added; SceneSuspenseFallback uses `--glow-genie-soft`.

## §3 — Strengths preserved from the spec-stub

- 3-recipe closed set already correctly named.
- CSS rgba values byte-stable from master plan §3.2.
- TS const + CSS variable dual surface already standard.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One glow token surface — atomic. |
| BCP-14 normativity | 1.0 | 0.9 | 1.0 | 1.0 | 1.0 | Precise MUSTs. |
| Testability | 2.0 | 1.4 | 1.6 | 1.8 | 2.0 | Vitest + R3F adapter + count assert. |
| Master-plan grounding | 1.5 | 1.4 | 1.5 | 1.5 | 1.5 | §3.2 cited. |
| API/contract precision | 1.5 | 1.3 | 1.4 | 1.5 | 1.5 | TS + CSS + R3F adapter. |
| Dependencies declared | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | FR-DS-003 + downstream FR-WEB-006 added. |
| Failure modes | 1.0 | 0.5 | 0.7 | 0.9 | 1.0 | covers drift + SSR + R3F. |
| Observability | 1.0 | 0.4 | 0.6 | 0.9 | 1.0 | Grep + JSDOM + R3F test. |
| **Total** | **10.0** | **6.5** | **7.5** | **9.1 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.**

---

## §6 — Upgrade-queue note

Batch 3 item 5 of 6.

1-4. ✓
5. **FR-DS-008 ✓ (this audit, 10/10)**
6. Next: FR-DS-009 (Cinematic Pack lifecycle marker) — closes Batch 3

---

*End of FR-DS-008 audit.*
