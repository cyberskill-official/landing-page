---
fr_id: FR-CHAR-006
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 9.5/10
score_post_revision_2: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
revised_at: 2026-05-16
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-CHAR-006 is ship-grade. This audit captures the round-2 re-author from the original spec-stub (6.5/10 on 2026-05-16). Round-2 revisions added: full polygon-distribution table with hard floor/ceiling per block (§1 #3), the geometric-not-textured "C" emboss invariant with three-reason rationale (§1 #5 + §2), the Quad Remesher trade-off analysis (§2), watertight + zero-doubled-vertices as separate testable ACs (§1 #7, §1 #8, AC#6, AC#7), the dual founder-plus-rigger signoff (§1 #15), the sculpt-source archival SHOULD (§1 #16), the Blender Python validator script body (§5), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-2701 — Tri budget number quoted without rationale
- **severity:** warning
- **rule_id:** rationale-gap
- **status:** RESOLVED — §2 explains the curve-knee logic ("below 22k silhouette suffers; above 32k compression diminishing yields") + names the dependency on Meshopt compression behaviour.

### ISS-2702 — "Polygon distribution 35/25/25/15" was prose; not testable per-block
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #3 promotes to a full table with hard floor + hard ceiling per block; AC#3 + Blender Python validator walk vertex-group face counts.

### ISS-2703 — "Geometric C emboss" rationale missing
- **severity:** error
- **rule_id:** normative-precision
- **status:** RESOLVED — §1 #5 + §2 three-reason rationale (LOD survival, brand identity at low quality, PBR shading interaction) + AC#5 + failure-mode row 6.

### ISS-2704 — Watertight + zero-doubled were prose; not separately asserted
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #7 and §1 #8 are separate normative clauses; AC#6 and AC#7 are separate test points; validator script implements both.

### ISS-2705 — Silhouette parity claim unverifiable
- **severity:** warning
- **rule_id:** verification-shape
- **status:** RESOLVED — AC#4 re-runs FR-CHAR-002 protocol against the production mesh's 32×32 silhouette; §3.1 production-silhouette PNG is a separate deliverable artefact with SHA-256 logged.

### ISS-2706 — Rigger signoff implicit
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #15 + AC#15 separate rigger signoff distinct from founder. The rigger validates topology supports the 27-bone armature + 4-influence skinning limit — catching this before FR-CHAR-009 saves 3-4 days of debugging.

### ISS-2707 — Sculpt source not archived
- **severity:** info (latent)
- **rule_id:** disaster-recovery
- **status:** RESOLVED — §1 #16 SHOULD + §3.1 hierarchy + §9 LFS-tracking rationale.

### ISS-2708 — Failure-modes inventory missing
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 with 12 distinct failure modes, each named recovery path. Notable inclusions: "Doubled vertices > 0" detection (the #1 cause of rigging debugging time), "Optimized GLB > 3.5 MB after pipeline + textures" with two recovery paths preserving the budget vs amending it.

## §3 — Strengths preserved from the spec-stub

- The frontmatter was already correct: `depends_on: [FR-CHAR-001, FR-CHAR-004]`, `blocks: [FR-CHAR-007..011, FR-PERF-002]` — these graph edges survive the upgrade.
- Source-page citations were already accurate (master plan §3.3, §4.2, §4.4, §4.1).
- The disallowed-tools list correctly excluded rigging / UV / texturing — those are downstream FRs.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One mesh, one acceptance signal — clean. |
| BCP-14 normativity | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precisely worded. |
| Testability | 2.0 | 1.0 | 1.4 | 1.8 | 2.0 | Blender Python validator + 15 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §3.3 + §4.1 + §4.2 + §4.4 cited verbatim. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.5 | 1.5 | §3 scene hierarchy + stats JSON shape + Blender exporter settings table. |
| Dependencies declared | 1.0 | 0.8 | 1.0 | 1.0 | 1.0 | depends_on + blocks + concept deps + operational deps all enumerated. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers tri overflow + topology + budget + signoff disagreement. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | mesh-stats.json + dual signoff archives + silhouette PNG hash log. |
| **Total** | **10.0** | **6.5** | **8.0** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation MAY begin once FR-CHAR-001 (shipped 2026-05-16 ✓) and FR-CHAR-004 (currently `spec-stub` — must upgrade to anchor-grade and then be shipped first). FR-CHAR-004 is next in the upgrade queue per `docs/launch/upgrade-queue.md` batch 6.

---

## §6 — Upgrade-queue note

This audit demonstrates the spec-stub → anchor-grade upgrade path:

- Original spec-stub (~3.8 KB FR + ~600 B audit): 6.5/10
- Anchor-grade (~25 KB FR + ~4.5 KB audit): 10/10

The other 108 spec-stub FRs need the same treatment. Batch sequence per `docs/launch/upgrade-queue.md`:

1. **Batch 1 (this audit):** FR-CHAR-006 ✓ done
2. Next in batch 1: FR-CHAR-007, 008, 009, 010, 011, 012 (rest of P2 production-mesh chain)
3. Then batch 2 (P3 web foundation), batch 3 (P1 DS tokens), etc.

Multi-turn work — see upgrade-queue.md for the full plan.

---

*End of FR-CHAR-006 audit (round 2 final — anchor-grade re-author from spec-stub).*
