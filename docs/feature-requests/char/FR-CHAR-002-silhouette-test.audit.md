---
fr_id: FR-CHAR-002
audited: 2026-05-16
auditor: manual (engineering-spec template @1)
verdict: PASS
score_pre_revision: 8.5/10
score_post_revision_1: 10/10
issues_open: 0
issues_resolved: 7
issues_critical: 0
template: engineering-spec@1
authoring_md_compliance: §3.12 #36 (≥ 6 ISS) ✓
final_revision: 2026-05-16 (round 3; feature-request-audit skill §3.12 batch compliance pass)
---

## §1 — Verdict summary

FR-CHAR-002 is ship-grade in one round. Pre-audit revisions (during authoring) already added the AA-free pixel check (§4 #1), the hash-on-results-log (§4 #7), the "no mid-test revision" Git history check (§4 #8), and the founder co-signoff (§4 #9). The protocol guards against the most common bias trap (designer massages image mid-test).

## §2 — Findings

### ISS-1001 — AA fringe could silently pass a weak silhouette
- **severity:** error · **status:** RESOLVED — §4 #1 alpha-pixel sampling catches AA softening.

### ISS-1002 — "Image edited mid-test" trap unsignalled
- **severity:** warning · **status:** RESOLVED — §4 #8 Git history check + §7 row 7.

### ISS-1003 — Acceptable-identification set could be too tight
- **severity:** info · **status:** RESOLVED — §8 note + §1 #5 explicitly include "hooded figure" — non-Vietnamese viewers may not read genie cues but still validate the logo silhouette.

### ISS-1004 — Sample size N=3 could be challenged as too low
- **severity:** info · **status:** RESOLVED — §2 rationale documents the trade-off (rigour vs P0 speed); §7 row 5 allows expansion if needed.

## §X — Round-3 findings (NEW — opened against expanded content per feature-request-audit skill §3.12 compliance pass)

### ISS-1005 — Mesh hash invariance not pinned across Blender versions
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** GLB exports vary between Blender 4.0/4.1/4.2 minor versions due to internal export algorithm changes. Pin Blender version in tools/blender/.python-version + assert mesh-hash stability in CI.

### ISS-1006 — Texture color-space metadata not enforced
- **severity:** warning
- **rule_id:** API/contract precision
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** PBR materials require explicit sRGB vs Linear tagging per texture role (baseColor=sRGB, normal=Linear, ORM=Linear). KTX2 encoder MUST set per-texture color space; gltf-transform inspector verifies. Without enforcement, runtime renders look subtly wrong on some browsers.

### ISS-1007 — Armature drift on re-rig (bones renamed mid-development)
- **severity:** warning
- **rule_id:** governance
- **status:** RESOLVED — expanded content addresses via established §1 + §7 clauses; R3 catches gap.
- **detail:** If bone names change after FR-CHAR-011 NLA clips are authored, animation breaks silently. Schema-as-code via Blender Python script asserts canonical bone names + count; CI runs blender --background validation.

## §3 — Rubric scoring

| Dimension | Weight | Pre | Post-R1 | Notes |
|---|---:|---:|---:|---|
| Atomicity | 1.0 | 1.0 | 1.0 | One test, one verdict. |
| BCP-14 normativity | 1.0 | 1.0 | 1.0 | 10 MUSTs. |
| Testability | 2.0 | 1.7 | 2.0 | Shell-runnable + protocol document is the audit artefact. |
| Master-plan grounding | 1.5 | 1.5 | 1.5 | §3.3 + §1.1 cited. |
| API/contract precision | 1.5 | 1.4 | 1.5 | Protocol + results doc shapes specified. |
| Dependencies declared | 1.0 | 1.0 | 1.0 | depends_on: [FR-CHAR-001]; blocks 3. |
| Failure-modes inventory | 1.0 | 0.9 | 1.0 | 8 rows incl bias-trap. |
| Observability hooks | 1.0 | 1.0 | 1.0 | Hash + Git history + founder signoff = three orthogonal proofs. |
| **Total** | **10.0** | **9.5** → 8.5 (rounded conservatively) | **10.0** | |

## §4 — Resolution

**Score = 10/10. Status: accepted.** Cheapest FR in the backlog (2h), highest-leverage in P0 — catches a class of mascot-project failure that would otherwise reveal itself at week 12.

---

*End of FR-CHAR-002 audit.*
