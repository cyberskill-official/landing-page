---
fr_id: FR-CHAR-007
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 7.5/10
score_post_revision_1: 9.4/10
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

FR-CHAR-007 is ship-grade. This audit captures the round-2 re-author from the original spec-stub (6.5/10 on 2026-05-16). Round-2 revisions added: per-atlas island-count cap (§1 #9), the face-island texel-density-exception (§1 #10), the UV bounds rule (§1 #8), the dual signoff (§1 #15) distinguishing UV mechanics from paint workflow, the validator script body (§5 ~120 lines including overlap detection, texel-density per island, padding measurement, bounds check), the five-paragraph rationale (§2), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-2801 — Texel-density floor lacked face-exception rule
- **severity:** warning
- **rule_id:** rationale-gap
- **status:** RESOLVED — §1 #10 sets the face floor at 384 px/m (1.5× the body floor); §2 paragraph 4 explains why the face block needs higher density (shape-key feature-line readability).

### ISS-2802 — "Padding ≥ 4 px" wasn't tied to the downstream compression target
- **severity:** error
- **rule_id:** rationale-gap
- **status:** RESOLVED — §1 #5 names KTX2 Basis quality 128 (FR-OPS-002 target) as the calibration point; AC#6 verifies padding via validator.

### ISS-2803 — No island-count caps; "select overlapping" was the only check
- **severity:** warning
- **rule_id:** testability
- **status:** RESOLVED — §1 #9 caps at 24 / 6 / 4 with Meshopt vertex-deduplication rationale in §2; AC#10 measures via validator.

### ISS-2804 — UV bounds rule (no UVs outside 0..1) missing
- **severity:** error
- **rule_id:** normative-precision
- **status:** RESOLVED — §1 #8 forbids negative or > 1 UVs; AC#9 + validator `check_uv_bounds()` enforce it. The motivation is that KTX2 + Meshopt downstream will silently mis-handle wrapped UVs and surface artefacts only at render time.

### ISS-2805 — Dual signoff (UV mechanic ≠ paint workflow) implicit
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #15 + AC#14 separate the 3D Modeler's signoff (UV mechanics: overlap, padding, bounds) from the Texture Artist's signoff (paint workflow: seam visibility under brush strokes, texel density adequate for hand-painted detail).

### ISS-2806 — Validator script was named but not provided
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §5 provides the full ~120-line Blender Python validator with overlap detection (`select_overlap`), island counting (UF-traversal on face-loops), padding measurement (nearest-pair bounding-box distance), texel-density computation per atlas with visible/face tagging, and bounds check. Exit code is gated on `verdict == "PASS"`.

### ISS-2807 — Failure-mode inventory thin (only 4 rows)
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 with 12 rows now. Notable additions: "wisp and lumi_main accidentally share one atlas" (texture-paint mode collapse — common in Blender), "validator script fails to find the atlas image" (material-graph drift after material edits), "padding measured at 3 px due to Margin Fraction rounding" (real Blender 4.4 behavior).

## §3 — Strengths preserved from the spec-stub

- The frontmatter `depends_on: [FR-CHAR-006]` and `blocks: [FR-CHAR-008, FR-CHAR-012]` were already correct — these survive the upgrade. Added `FR-OPS-002` to `blocks` since the KTX2 pipeline depends on the locked padding.
- Source-page citations (master plan §3.3 + §4.1) were accurate.
- The "no UDIM" hard rule was already correct.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | One UV layer commit, three atlas outputs — atomic. |
| BCP-14 normativity | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | 16 MUSTs / MUST NOTs precisely worded. |
| Testability | 2.0 | 1.0 | 1.4 | 1.8 | 2.0 | Blender Python validator + 15 ACs each named tool / threshold. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §3.3 character table + §4.1 production-mesh + §4.4 perf table cited verbatim. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | `lumi-uv-stats.json` schema + Blender unwrap-settings table + validator interface. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | depends_on + blocks + concept-deps + operational-deps + downstream-unblocks all enumerated. |
| Failure-modes inventory | 1.0 | 0.3 | 0.7 | 0.9 | 1.0 | 12 rows; covers Blender-specific gotchas (Margin Fraction rounding, texture-paint mode collapse). |
| Observability hooks | 1.0 | 0.6 | 0.7 | 0.9 | 1.0 | `lumi-uv-stats.json` machine-readable verdict + three UV overlay PNGs + seam-map deliverable + dual signoff Markdown. |
| **Total** | **10.0** | **6.5** | **8.2** | **9.4 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation MAY begin once FR-CHAR-006 is shipped (currently `accepted` at anchor-grade; pending production mesh delivery against the spec).

---

## §6 — Upgrade-queue note

This is batch 1 item 2 of the spec-stub → anchor-grade upgrade campaign. Per `docs/launch/upgrade-queue.md`:

1. FR-CHAR-006 ✓ (anchor-grade, 10/10)
2. **FR-CHAR-007 ✓ (this audit, 10/10)**
3. Next: FR-CHAR-008 (Substance textures) · 4 downstream blocks
4. Then: FR-CHAR-009 (custom armature) · 4 downstream
5. Then: FR-CHAR-010 (shape keys) · 3 downstream
6. Then: FR-CHAR-011 (animation library, 11 clips) · 10 downstream — the biggest unblock in batch 1
7. Then: FR-CHAR-012 (nón lá production mesh) · 2 downstream

---

*End of FR-CHAR-007 audit (round 2 final — anchor-grade re-author from spec-stub).*
