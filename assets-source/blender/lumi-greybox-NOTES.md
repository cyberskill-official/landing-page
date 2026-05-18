# Lumi Greybox — Build Notes (v01)

## Environment

Blender 4.4 is not installed in this workspace, so `lumi-greybox.v01.blend` is a handoff placeholder and `lumi-greybox.raw.glb` is a deterministic fallback proxy. Replace the placeholder with a real Blender file before final P1 art review.

## Tri budget vs actual

| Block | Target | Actual |
|---|---:|---:|
| lumi_hood | 2500 | 2348 |
| lumi_face | 1500 | 1386 |
| lumi_body | 1500 | 1452 |
| lumi_arms | 1500 | 1320 |
| lumi_wisp | 1000 | 880 |
| **Total** | **8000** | **7386** |

## Pose

- Front turnaround pose (FR-CHAR-001), idle stance, arms crossed.
- NO facial expression, NO wisp animation.
- NO rig, NO image textures, NO UV production work.

## Intended usage

- Phase P1: greybox for scene-framing reviews (FR-CHAR-005).
- Phase P3+: LOD-1 swap for low-memory devices (FR-PERF-002, FR-PERF-009).
- Phase P4+: distance LOD swap at > 12m camera distance (FR-SCENE-023 Scene 5 globe).

## Upgrade path

- FR-CHAR-006 production mesh inherits these proportions exactly.
- FR-CHAR-009 rig drops onto the production topology that mirrors this greybox edge flow.
- FR-CHAR-010 shape keys author against production geometry, not greybox.

## Known limitations

- The .blend file must be rebuilt in Blender 4.4.
- The GLB contains procedural proxy triangles with correct node names and counts, not final modeled topology.
- The hood C is documented as geometric embossing and shown in the comparison PNG; Blender topology review remains required.
