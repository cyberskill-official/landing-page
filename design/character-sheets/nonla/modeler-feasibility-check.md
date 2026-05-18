# Modeler Feasibility Check — FR-CHAR-003

**Status:** PASS  
**Date:** 2026-05-16  
**Reviewer:** 3D modeler proxy review

## Verdict

The nón lá design is implementable within the FR-CHAR-012 production target of **≤ 600 triangles**.

## Mesh plan

| Part | Target tris | Notes |
|---|---:|---|
| Cone exterior | 192 | 64 radial segments × simple cone fan |
| Brim thickness / underside | 192 | Thin rim with interior-gold material assignment |
| Star decal geometry | 20 | Flat 5-point star, front-centre, slightly offset above surface |
| Attachment/socket helper | 24 | Parented to `hat_socket`; helper not exported if unnecessary |
| Reserve for cleanup | 172 | UV seams, bevel edge, export triangulation variance |

**Total planned budget:** 428 tris + 172 tris reserve = 600 tris hard cap.

## Implementation constraints

- Single 512×512 atlas: exterior red, interior gold, star yellow.
- No weave texture, painted pattern, calligraphy, dragon, phoenix, lotus, or ceremonial detail.
- The hat sits forward and slightly down on Lumi's hood; it does not attach to the hood leaf tip.
- `nonla_tip` can expose the interior lining without needing extra geometry beyond the brim/underside ring.

## Signoff

PASS. FR-CHAR-012 can proceed from this 2D accessory contract.
