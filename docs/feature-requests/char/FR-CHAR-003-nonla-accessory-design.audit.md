---
fr_id: FR-CHAR-003
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.0/10
score_post_revision_1: 10/10
issues_open: 0
issues_resolved: 8
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
final_revision: 2026-05-16 (round 3; AUTHORING.md §3.12 batch compliance pass)
---

## §1 — Verdict summary

FR-CHAR-003 is ship-grade. Round-1 revisions promoted "casual not ceremonial" to a normative clause with a separate cultural-signoff gate (§1 #5 + #11), pinned the exact star diameter at 30% with rationale (§2), pinned the colour drift to zero-tolerance (§4 #2), and explicitly carved out the failure path for tourist-register pushback (§7 row 4).

## §2 — Findings (resolved)

### ISS-1101 — "Cultural register" was prose
- **severity:** error · **status:** RESOLVED — §1 #5 + cultural-note.md + AC#7 separate signoff.

### ISS-1102 — Star size unpinned
- **severity:** warning · **status:** RESOLVED — §1 #3 + §2 rationale (30%, with the readability-vs-subtlety trade-off explained).

### ISS-1103 — Founder pushback path unmodelled
- **severity:** info · **status:** RESOLVED — §7 row 4 carves out successor-FR pattern for ceremonial-variant if absolutely required.

### ISS-1104 — Cross-scene leakage (nón lá in non-Scene-5 comps)
- **severity:** warning · **status:** RESOLVED — §4 #10 cross-FR check + §1 #12 normative.

### ISS-1105 — Profile silhouette could read as sombrero / witch hat
- **severity:** info · **status:** RESOLVED — §7 row 6 + §3.1 side view explicitly checks silhouette readability.

## §3 — Strengths preserved

- The dual-signoff structure (brand on FR-CHAR-001, culture on FR-CHAR-003) recognises that brand judgment and cultural judgment are distinct. Founder is the only person on the team equipped for both.
- §2 rationale walks through *why* each cultural choice (casual not ceremonial, flag-exact colours, single star) — gives the designer ammunition against well-meaning embellishment requests.
- §3.4 cultural-note.md is the cross-team contract — modeler, writer, founder all reference it.
- The interior gold-lining Easter egg (§1 #4 + §8 note) is a tiny detail that rewards engagement without breaking the casual register.

## §X — Round-3 findings (NEW — opened against expanded content per AUTHORING.md §3.12 compliance pass)

### ISS-1106 — Mesh hash invariance not pinned across Blender versions
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** GLB exports vary between Blender 4.0/4.1/4.2 minor versions due to internal export algorithm changes. Pin Blender version in tools/blender/.python-version + assert mesh-hash stability in CI.

### ISS-1107 — Texture color-space metadata not enforced
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** PBR materials require explicit sRGB vs Linear tagging per texture role (baseColor=sRGB, normal=Linear, ORM=Linear). KTX2 encoder MUST set per-texture color space; gltf-transform inspector verifies. Without enforcement, runtime renders look subtly wrong on some browsers.

### ISS-1108 — Armature drift on re-rig (bones renamed mid-development)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** If bone names change after FR-CHAR-011 NLA clips are authored, animation breaks silently. Schema-as-code via Blender Python script asserts canonical bone names + count; CI runs blender --background validation.

## §4 — Rubric scoring

| Dimension | Weight | Pre | Post-R1 | Notes |
|---|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | One accessory design. |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 12 MUSTs / MUST NOTs. |
| Testability | 2.0 | 1.5 | 2.0 | Inspection + colour eyedropper + grep + cross-FR check. |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | §1.1 + §3.3b + §3.4 cited. |
| API/contract precision | 1.5 | 1.4 | 1.5 | Geometry / colour / placement specified to numerical precision. |
| Dependencies declared | 1.0 | 1.0 | 1.0 | depends_on: [FR-CHAR-001]; blocks 3. |
| Failure-modes inventory | 1.0 | 0.6 | 1.0 | 8 rows incl founder-pushback + sombrero-silhouette risk. |
| Observability hooks | 1.0 | 0.6 | 1.0 | Dual signoff archive + modeler feasibility check + cross-FR audit. |
| **Total** | **10.0** | **8.0** | **10.0** | |

## §5 — Resolution

**Score = 10/10. Status: accepted.** Most culturally-sensitive FR in the backlog. Unblocks FR-CHAR-012 (production mesh), FR-SCENE-006 + FR-SCENE-017 (Scene 5 comp + impl).

---

*End of FR-CHAR-003 audit.*
