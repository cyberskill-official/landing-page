---
fr_id: FR-CHAR-008
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
final_revision: 2026-05-16 (round 2; re-author from spec-stub)
prior_state: spec-stub @ 6.5/10
---

## §1 — Verdict summary

FR-CHAR-008 is ship-grade. Round-2 re-author from the original spec-stub (6.5/10 on 2026-05-16). Round-2 additions: explicit ORM channel-mapping rule (§1 #2), gradient anchor RGB values (§1 #3), KTX2 codec selection per map (§1 #7), the ΔE2000 ≤ 5 off-palette rule with 64×64 sampling grid (§1 #8 + §5), founder signoff requirement (§1 #13), UV-immutability guard (§1 #14), the texture-validator.py with palette ΔE2000 + normal-convention detection + emissive mask-area cap (§5), five-paragraph rationale (§2), and 12 failure-mode rows (§7).

## §2 — Round-1 findings (resolved during re-author)

### ISS-2901 — ORM channel-mapping vague ("OcclusionRoughnessMetallic packed")
- **severity:** error
- **rule_id:** normative-precision
- **status:** RESOLVED — §1 #2 specifies R=AO, G=Roughness, B=Metallic per glTF 2.0 KHR_materials_pbrMetallicRoughness; AC#10 detects channel swap via statistical correlation.

### ISS-2902 — Gradient anchor colours not quoted
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §1 #3 quotes exact RGB values for gold-200 / gold-400 / gold-500; AC#6 eyedroppers at known coords with ΔE2000 ≤ 3 against anchors.

### ISS-2903 — "No off-palette colours" rule unverifiable
- **severity:** warning
- **rule_id:** verification-shape
- **status:** RESOLVED — §1 #8 ΔE2000 ≤ 5 threshold with 64×64 sampling grid; §5 validator computes per-pixel nearest-palette distance.

### ISS-2904 — Founder signoff implicit
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — §1 #13 + AC#15. Textures define brand "look"; this is a brand decision not a technical one.

### ISS-2905 — UV drift during texture authoring not guarded
- **severity:** error
- **rule_id:** governance
- **status:** RESOLVED — §1 #14 forbids in-stage UV edits; AC#16 verifies UV-layer hash equality with the FR-CHAR-007 output.

### ISS-2906 — KTX2 codec selection by-map not specified
- **severity:** warning
- **rule_id:** normative-precision
- **status:** RESOLVED — §1 #7 specifies ETC1S for BaseColor/ORM/Emissive and UASTC for Normal with rationale (UASTC preserves direction).

### ISS-2907 — Validator script named but absent
- **severity:** error
- **rule_id:** testability
- **status:** RESOLVED — §5 provides full Pillow + colour-science Python validator with palette-distance, normal-convention, and emissive-mask-area checks.

### ISS-2908 — Failure-mode inventory was 6 rows; missed real-world Substance Painter gotchas
- **severity:** info
- **rule_id:** documentation-gap
- **status:** RESOLVED — §7 has 12 rows. Notable additions: "Substance .spp corrupted by concurrent save Lockfile", "ORM packed with HDR (>1.0) Roughness values causing shader divisions", "Emissive bleed past C edges after KTX2".

## §3 — Strengths preserved from the spec-stub

- `metallic 0.4` and `roughness 0.35` exact values were already correctly cited from master plan §3.3.
- Iridescence-as-runtime-shader rule (no-bake) was already correct.
- Substance Painter named as the authoring tool per master plan §4.3.

## §4 — Rubric scoring

| Dimension | Weight | Spec-stub | Pre-revision | Post-R1 | Post-R2 | Notes |
|---|---:|---:|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | 1.0 | 1.0 | Four maps from one source — atomic. |
| BCP-14 normativity | 1.0 | 0.8 | 0.9 | 1.0 | 1.0 | 15 MUSTs / MUST NOTs precise. |
| Testability | 2.0 | 1.0 | 1.4 | 1.9 | 2.0 | Python validator + 16 ACs each named tool. |
| Master-plan grounding | 1.5 | 1.2 | 1.4 | 1.5 | 1.5 | §3.3 character table + §4.3 + §4.4 cited. |
| API/contract precision | 1.5 | 0.8 | 1.2 | 1.4 | 1.5 | `lumi-texture-stats.json` + Substance export-preset table. |
| Dependencies declared | 1.0 | 0.7 | 0.9 | 1.0 | 1.0 | Concept + operational + downstream all enumerated. |
| Failure-modes inventory | 1.0 | 0.4 | 0.7 | 0.9 | 1.0 | 12 rows; covers Substance gotchas. |
| Observability hooks | 1.0 | 0.6 | 0.8 | 0.9 | 1.0 | Stats JSON + four maps + Substance source + founder-facing brief. |
| **Total** | **10.0** | **6.5** | **8.3** | **9.6 → 9.5** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted** (transitioned from `spec-stub` during this audit round).

Implementation begins after FR-CHAR-006 (production mesh) AND FR-CHAR-007 (UV layout) are shipped. Both are currently `accepted` at anchor-grade.

---

## §6 — Upgrade-queue note

Batch 1 item 3 of the spec-stub → anchor-grade upgrade campaign.

1. FR-CHAR-006 ✓ (10/10)
2. FR-CHAR-007 ✓ (10/10)
3. **FR-CHAR-008 ✓ (this audit, 10/10)**
4. Next: FR-CHAR-009 (custom armature rig) · 4 downstream

---

*End of FR-CHAR-008 audit (round 2 final — anchor-grade re-author from spec-stub).*
