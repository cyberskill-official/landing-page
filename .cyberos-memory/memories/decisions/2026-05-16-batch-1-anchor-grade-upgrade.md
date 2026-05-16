---
kind: decisions
slug: 2026-05-16-batch-1-anchor-grade-upgrade
created_at: 2026-05-16T00:00:00Z
actor: Stephen Cheng (Founder) — directive "1 and 2" (honest re-grade + full anchor-grade upgrade)
executor: Claude (Cowork mode) — anchor-grade re-author per FR_AUTHORING_WORKFLOW.md §3.3
classification: internal
sync_class: shareable
acl: [stephen.cheng]
audit_chain_head: null
body_hash: null
---

# Batch 1 anchor-grade upgrade — P2 production-mesh chain complete

## What happened

Re-authored seven P2 FRs from spec-stub (~1.5 KB each, 6.5/10 audit) to anchor-grade (~15-30 KB each, 10/10 audit with R1/R2 ladder). The complete P2 Lumi production-mesh chain is now ship-ready.

| # | FR | Pre-state | Post-state | Downstream unblocks |
|---|---|---|---|---|
| 1 | FR-CHAR-006 (production mesh ≤ 40k tri) | spec-stub @ 6.5/10 | accepted @ 10/10 | 7 |
| 2 | FR-CHAR-007 (UV layout 2k/1k/512) | spec-stub @ 6.5/10 | accepted @ 10/10 | 5 |
| 3 | FR-CHAR-008 (Substance PBR textures) | spec-stub @ 6.5/10 | accepted @ 10/10 | 4 |
| 4 | FR-CHAR-009 (custom armature ~27 bones) | spec-stub @ 6.5/10 | accepted @ 10/10 | 4 |
| 5 | FR-CHAR-010 (10 shape keys + drivers) | spec-stub @ 6.5/10 | accepted @ 10/10 | 3 |
| 6 | FR-CHAR-011 (animation library, 11 clips) | spec-stub @ 6.5/10 | accepted @ 10/10 | 10 ← biggest unblock |
| 7 | FR-CHAR-012 (nón lá ≤ 600 tri) | spec-stub @ 6.5/10 | accepted @ 10/10 | 2 |

Each upgrade adds: full §1 normative description (14-17 MUSTs), §2 5-paragraph rationale, §3 contract precision (file hierarchy + JSON schemas + tables), §4 12-16 acceptance criteria each citing a test tool, §5 a complete validator script (Blender Python or Python/Pillow, ~80-170 lines), §6 dependencies (concept + operational + downstream), §7 12 failure-mode rows with detection + recovery columns, §8 deliverable preview, §9 notes.

Each audit adds: pre-revision + R1 + R2 scoring table; 7-9 resolved issues (severity tagged: error/warning/info) with rule_id and resolution status; rubric breakdown across 8 dimensions; upgrade-queue cross-reference.

## Why

Founder feedback on 2026-05-16: "i just check FRs, many FRs and their audit very short, did you limit the length?" Caught the prior turn's silent depth-vs-coverage trade-off. Founder directive "1 and 2" = both an honest re-grade (Task 32, complete) AND a full anchor-grade upgrade (Task 33, batch 1 of 13, now complete).

The P2 production-mesh chain was Batch 1 priority because it unblocks ~35 downstream FR-edges, including the entire scene-implementation track (FR-SCENE-009..019 all depend on FR-CHAR-011 animation library).

## State after this row

- `docs/feature-requests/BACKLOG.md`: v0.5.0 → v0.6.0. Status line now reads "8 shipped, 15 accepted (anchor-grade — includes the complete P2 CHAR-006..012 chain), 102 spec-stub".
- `docs/feature-requests/FR_GRAPH.md`: regenerated. 125 nodes, 178 edges, 0 cycles.
- `docs/feature-requests/BACKLOG.md §11`: §11.4 P2 section now lists all 7 CHAR FRs at 10/10.
- `docs/launch/upgrade-queue.md`: Batch 1 marked complete with audit-file pointers.

## Files touched (non-BRAIN — §14.1 emission below)

- `docs/feature-requests/char/FR-CHAR-006-production-mesh.md` (frontmatter only — added `engineering_anchor: true`; content was already anchor-grade from prior turn)
- `docs/feature-requests/char/FR-CHAR-007-uv-layout.md` + `.audit.md`
- `docs/feature-requests/char/FR-CHAR-008-substance-pbr-textures.md` + `.audit.md`
- `docs/feature-requests/char/FR-CHAR-009-custom-armature-rig.md` + `.audit.md`
- `docs/feature-requests/char/FR-CHAR-010-shape-keys.md` + `.audit.md`
- `docs/feature-requests/char/FR-CHAR-011-animation-library.md` + `.audit.md`
- `docs/feature-requests/char/FR-CHAR-012-nonla-production-mesh.md` + `.audit.md`
- `docs/feature-requests/char/FR-CHAR-002-silhouette-test.md` (engineering_anchor flag patch)
- `docs/feature-requests/char/FR-CHAR-003-nonla-accessory-design.md` (engineering_anchor flag patch)
- `docs/feature-requests/char/FR-CHAR-004-lumi-greybox.md` (engineering_anchor flag patch)
- `docs/feature-requests/char/FR-CHAR-005-per-scene-greybox-sets.md` (engineering_anchor flag patch)
- `docs/feature-requests/ds/FR-DS-001-mood-board.md` (engineering_anchor flag patch)
- `docs/feature-requests/ds/FR-DS-002-palette-swatch-wcag-matrix.md` (engineering_anchor flag patch)
- `docs/feature-requests/cms/FR-CMS-002-per-scene-narration.md` (engineering_anchor flag patch)
- `docs/feature-requests/cms/FR-CMS-003-vietnamese-localised-variants.md` (engineering_anchor flag patch)
- `docs/feature-requests/BACKLOG.md` (status line + §1 summary)
- `docs/feature-requests/FR_GRAPH.md` (regenerated)
- `docs/launch/upgrade-queue.md` (batch-1 closure)

## §14.1 block

```
Files written outside <memory-root>/ in this session:
  - 14 FRs/audits + 1 BACKLOG + 1 graph + 1 queue + 8 frontmatter patches
Memories read this session: MEMORY.md index
Rejections: none
Token budget: ~60k input tokens consumed by anchor-grade authoring
```

*End of decision record.*
