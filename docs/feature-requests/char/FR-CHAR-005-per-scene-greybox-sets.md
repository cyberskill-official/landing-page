---
id: FR-CHAR-005
title: "Per-scene greybox sets — props, camera frusta, scene-scale checks"
module: CHAR
priority: MUST
status: shipped + mocked-dependency + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
engineering_anchor: true
verify: T
phase: P1
slice: 1
owner: 3D Modeler / Texture Artist + R3F Architect
created: 2026-05-16
shipped: 2026-05-18
related_frs: [FR-CHAR-004, FR-SCENE-001, FR-SCENE-002, FR-SCENE-003, FR-SCENE-004, FR-SCENE-005, FR-SCENE-006, FR-SCENE-007, FR-SCENE-008, FR-OPS-001]
depends_on: [FR-CHAR-004, FR-SCENE-008]
blocks: [FR-WEB-003, FR-PERF-008]

source_pages:
  - docs/01-master-plan-v2.md §10 Phase P1 deliverables (Blender greybox of every scene)
  - docs/01-master-plan-v2.md §6.1 (Draw calls < 100 per scene)
  - docs/01-master-plan-v2.md §4.4 (Per-scene asset budgets — 1.5 MB target)

language: blender 4.4 + glb
service: assets-source/blender/scenes/ + assets-built/raw/
new_files:
  - assets-source/blender/scenes/{scene-0,scene-1,scene-2,scene-3,scene-4,scene-5,scene-6,footer}-greybox.v01.blend
  - assets-built/raw/{scene-0,scene-1,scene-2,scene-3,scene-4,scene-5,scene-6,footer}-greybox.raw.glb
  - assets-source/blender/scenes/SCENE_GREYBOX_NOTES.md

effort_hours: 12
risk_if_skipped: "Without per-scene greybox, the R3F architect can't validate scene-camera framing, prop placement, or draw-call counts until P3/P4 — by which time wrong choices have cascaded into multiple scenes."
engineering_anchor: true
---

## §1 — Description (BCP-14 normative)

A greybox set for **each of the 8 scenes** (Scene 0-6 + Footer) **MUST** be authored in Blender 4.4, containing scene-camera, scene-specific props (untextured proxy geometry), and the Lumi greybox (linked, not duplicated) at scene scale.

1. **MUST** produce 8 .blend files at `assets-source/blender/scenes/scene-<id>-greybox.v01.blend`. Each MUST link the `lumi-greybox` collection from FR-CHAR-004 (not duplicate it).
2. **MUST** include a `scene_camera` per file matching the Figma comp's framing (FR-SCENE-001..008 are the visual source of truth for camera angle / focal length / position).
3. **MUST** include scene-specific proxy props as separate mesh collections:
   - Scene 0: ambient particulate dust (200 instanced points proxy)
   - Scene 1: floating idea-spark orb
   - Scene 2: wireframe sketchpad → app-shell morph target (proxy planes)
   - Scene 3: 4 capability satellite proxies (cyan/magenta/lime/gold spheres)
   - Scene 4: 10 team-avatar proxies (uniform spheres)
   - Scene 5: stylized globe (~ 6k tri sphere) + Vietnam pin + NA/EU pins
   - Scene 6: 3 CTA portal proxies (Buy/Partner/Join as 3 floor-anchored cards)
   - Footer: corner Lumi avatar (re-linked at small scale)
4. **MUST** keep each scene's prop tri count ≤ **6000** (proxies are coarse; production geometry lands in P4 scene FRs).
5. **MUST** export each scene as `assets-built/raw/scene-<id>-greybox.raw.glb` per FR-OPS-001 stage-1 contract (compression OFF, sparse-accessor OFF, no textures).
6. **MUST** pass FR-OPS-001 pipeline at stage 2: each optimized `.glb` ≤ **1.5 MB** (per-scene budget per master plan §4.4).
7. **MUST** include draw-call estimate per scene in `SCENE_GREYBOX_NOTES.md`. Target ≤ 100 draw calls per scene at any moment (master plan §6.1 + FR-PERF-008).
8. **MUST** verify scene-camera frustum encloses all visible props at the canonical scroll-progress = 0.5 (mid-scene). Frustum overflow flagged in NOTES.md.
9. **MUST NOT** include rigged or animated content — props are static proxies. Animation lands in P4 scene FRs.
10. **MUST** maintain Blender baseline conventions per master plan §4.1.
11. **MUST** be reviewed by the R3F architect for camera-framing feasibility (~ 30 min per scene).

---

## §2 — Why this design

**Why per-scene greybox?** The persistent `<GlobalCanvas>` pattern (FR-WEB-001) requires that scenes use `<UseCanvas>` to tunnel meshes in / out. Without greybox geometry, the architect can't measure how many meshes are in the canvas at any given scroll position — which directly determines draw-call counts (master plan §6.1: < 100 per scene).

**Why link Lumi, not duplicate?** Blender's `Link → Collection` keeps the greybox single-source. Updating FR-CHAR-004 propagates to all 8 scenes automatically. Duplication would fork the silhouette into 8 versions that drift.

**Why ≤ 6000 tri / scene?** Production scene props in P4 are budgeted ~ 1.5 MB per scene (master plan §4.4) — that's roughly 15-25k tri after Draco compression. Greybox at 1/3 of that gives the architect a realistic upper bound for layout decisions.

---

## §3 — Per-scene contract

### Scene 0
- Camera: position (0, 0, 5), fov 50, looking at origin.
- Props: 200 instanced 4-tri particle quads (~ 800 tri).
- Notes: ambient dust; rest is Lumi.

### Scene 1
- Camera: position (1.8, 0.2, 4.5), looking at (0.4, 0, 0).
- Props: idea-spark sphere (50 tri) + floating script-line proxy planes (~ 200 tri).

### Scene 2
- Camera: position (0, 0.5, 4), looking at origin.
- Props: sketchpad plane (4 tri) + wireframe app-shell morph target (~ 2k tri proxy).

### Scene 3
- Camera: position (0, 0, 6), looking at origin, fov 60 (wider for quadrant view).
- Props: 4 satellite spheres @ ~ 500 tri each (= 2000 tri), each tagged with capability name.

### Scene 4
- Camera: position (0, 0.5, 5), looking at (0, -0.2, 0).
- Props: 10 avatar spheres @ ~ 100 tri each (= 1000 tri), parented to a placeholder armature for parallax depth.

### Scene 5
- Camera: position (0, 1, 4), looking at origin (globe at origin).
- Props: stylized globe ~ 4000 tri (icosahedral subdivision); 3 pins @ ~ 50 tri each; arc curve as a separate spline.

### Scene 6
- Camera: position (0, 0, 5), looking at origin.
- Props: 3 portal cards as plane proxies (4 tri each) at (-2, 0, 0), (0, 0, 0), (2, 0, 0).

### Footer
- Camera: corner-pinned (positioned via DOM-attached camera, not in the .blend).
- Props: minimal — just the small Lumi corner avatar.

### `SCENE_GREYBOX_NOTES.md` shape

```markdown
# Per-Scene Greybox Notes

| Scene | Tri (props) | Estimated draw calls | Frustum-overflow at progress=0.5? |
|---|---:|---:|:-:|
| 0 | 800 | 3 | ✓ no |
| 1 | 250 | 4 | ✓ no |
| 2 | 2004 | 6 | ✓ no |
| 3 | 2000 | 8 | ✓ no |
| 4 | 1000 | 12 | ⚠ overflow at extreme parallax |
| 5 | 4150 | 9 | ✓ no |
| 6 | 12 | 5 | ✓ no |
| Footer | (Lumi only) | 2 | ✓ no |
```

---

## §4 — Acceptance criteria

1. **8 .blend files present** — one per scene + footer.
2. **8 .raw.glb exports present** — at `assets-built/raw/scene-<id>-greybox.raw.glb`.
3. **8 optimized .glb files ≤ 1.5 MB each** — after FR-OPS-001 stage 2.
4. **Per-scene tri count ≤ 6000** — Python script reads each .blend, sums polygon counts across all collections except `lumi_*` (linked), asserts ≤ 6000.
5. **No rig / no textures** — `bpy.data.armatures` empty (greyboxes themselves) + `bpy.data.images` empty per .blend.
6. **Lumi linked, not duplicated** — Python check: `lumi_main` collection exists in each .blend as a linked library reference (`bpy.data.libraries` contains the parent .blend path).
7. **scene_camera matches Figma comp framing** — R3F architect sign-off per scene. Camera position + lookAt + fov logged in NOTES.md.
8. **Draw-call estimate ≤ 100 per scene** — manual estimate via `gltf-transform inspect`'s draw-call count column.
9. **Frustum check** — render preview at scroll-progress = 0.5; verify all props visible OR explicitly note overflow in §3 table.
10. **NOTES.md present + tri/draw-call table populated**.

## §5 — Verification

Blender Python script `scripts/__tests__/scene-greybox-stats.py` iterates over the 8 .blend files, sums tri counts, asserts limits + lumi-linkage. Plus shell assertion on optimized GLB sizes.

## §6 — Dependencies

FR-CHAR-004 (Lumi greybox to link), FR-SCENE-008 (all scene comps land first so camera framing is final).

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Scene exceeds 6000 tri | AC#4 fail | Decimate the worst-offender prop; props are coarse proxies |
| Lumi duplicated instead of linked | AC#6 fail | Use `Link → Collection` in Blender, not Append |
| Camera framing diverges from Figma | R3F architect review | Re-shoot the .blend camera to match Figma's documented position/lookAt |
| Frustum overflow at parallax extremes | AC#9 visual check | Tighten prop placement OR widen fov OR move camera back |
| GLB pipeline fails on greybox (untextured mesh oddity) | AC#3 stat | Verify FR-OPS-001 handles empty texture collections; add fixture if needed |
| Footer .blend has redundant Lumi (already DOM-rendered) | Visual review | Footer greybox can be empty; the corner avatar uses the same Lumi LOD-1 via R3F instancing, not a separate mesh |

## §8 — Mocked-dependency shipment

Blender 4.4 is not installed in the execution environment, so physical viewport/frustum validation remains unavailable. Per the zero-touch blocker rule, this FR ships as `shipped + mocked-dependency` using deterministic scene GLB proxies, placeholder `.blend` manifests, and the R3F handoff notes verified by `python3 tools/check-p1-greybox-assets.py`.

*End of FR-CHAR-005.*
