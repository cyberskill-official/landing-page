---
id: FR-SCENE-002
title: "Scene 1 Origin — Figma comp at 3 breakpoints + camera-path notes + storyboard"
module: SCENE
priority: MUST
status: shipped + strict-audited
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: I
phase: P1
slice: 1
owner: Designer (Art Director)
created: 2026-05-16
shipped: 2026-05-17
related_frs: [FR-SCENE-001, FR-CHAR-001, FR-CMS-002, FR-DS-001, FR-SCENE-013, FR-CHAR-011]
depends_on: [FR-SCENE-001, FR-CHAR-001, FR-CMS-002]
blocks: [FR-SCENE-013]
engineering_anchor: true

source_pages:
  - docs/01-master-plan-v2.md §2.1 Scene 1 row ("Saigon, 2020." · Empathy beat)
  - docs/01-master-plan-v2.md §3.4 Scene 1 art direction (sepia-warm interior · brown-400 backdrop · idea-spark)
  - docs/01-master-plan-v2.md §3.3a coil_idle animation (5.0s wisp wraps around idea-spark)

language: figma + storyboard
service: design/scenes/scene-1-origin/
new_files:
  - design/scenes/scene-1-origin/scene-1-origin-v1.fig
  - design/scenes/scene-1-origin/scene-1-origin-{desktop-1920,tablet-1024,mobile-390}.png
  - design/scenes/scene-1-origin/camera-path.md
  - design/scenes/scene-1-origin/idea-spark-frames.png
  - design/scenes/scene-1-origin/storyboard.md
modified_files: []
allowed_tools:
  - figma: design/scenes/scene-1-origin/**
  - file_read: design/scenes/scene-0-hero/**            # pattern reference
  - file_read: design/character-sheets/**
  - file_read: content/narrative/lines/en.json          # narration verbatim
disallowed_tools:
  - introduce a 4th breakpoint (mirror FR-SCENE-001's 3-breakpoint contract)
  - place narration captions inside the R3F canvas region
  - use cool-tone background colours (Scene 1 is sepia-warm only)
  - re-pose Lumi away from the FR-CHAR-001 turnaround set

effort_hours: 6
risk_if_skipped: "Without a Scene 1 comp, FR-SCENE-013 (Scene 1 implementation in P4) improvises camera path + idea-spark behaviour + caption placement; founder feedback mid-build cascades into the next 5 scene comps."
---

## §1 — Description (BCP-14 normative)

A Figma composition for **Scene 1 Origin** ("Saigon, 2020.") **MUST** be authored at three breakpoints + a documented camera path + idea-spark animation frames + accompanying storyboard.md.

1. **MUST** include three breakpoint comps: desktop 1920×1080, tablet 1024×1366, mobile 390×844. Same proportions and layout grid as FR-SCENE-001 — narrative consistency.
2. **MUST** set the scene background to a **sepia-warm interior** feel per master plan §3.4: backdrop `--brand-brown-400` (#6E3A18), warmer than Scene 0's deeper brown-700. Single warm spotlight at ~ 45° from upper-right.
3. **MUST** include the **floating idea-spark** — a small luminous orb in `--brand-gold-200` with `--glow-genie-soft` rim, placed at the rule-of-thirds intersection where Lumi's wisp tail coils around it.
4. **MUST** depict Lumi in idle pose from FR-CHAR-001 with the `coil_idle` animation cue — wisp tail wrapping around the idea-spark via constraint (master plan §3.3a). The comp MUST annotate the wisp's curl path and indicate "constraint-driven" in the spec callout.
5. **MUST** include the Scene 1 caption from FR-CMS-002 (`scene-1-origin-primary`) verbatim: *"Stephen had one rule: build what you'd be proud to sign."* — typed line-by-line. The typing-on animation MUST be documented in storyboard.md.
6. **MUST** mark the same canvas/DOM boundary as FR-SCENE-001 — explicit dashed line on every breakpoint demonstrating that the typed caption is DOM-overlay, not canvas-rendered.
7. **MUST** ship `camera-path.md` documenting the R3F `<PerspectiveCamera>` movement: hero-pose → 0.5 unit zoom toward Lumi → 2.0 unit pan-right reveal of the idea-spark. Curve: `ease-genie` (FR-DS-006). Total duration: 5.0s synced to `coil_idle` length.
8. **MUST** ship `idea-spark-frames.png` — 6 keyframes of the idea-spark orb's pulse cycle (radius + emissive intensity), to feed FR-SCENE-013's shader implementation.
9. **MUST** ship `storyboard.md` ≤ 250 words capturing the 4-second user-perceived narrative (FR-SCENE-001 §3.5 template format).
10. **MUST NOT** introduce cool-tone backgrounds, capability satellites (those are Scene 3), or the nón lá (master plan §3.4 carves it out to Scene 5).
11. **MUST** be reviewed by Stephen Cheng. Founder signoff archived to `signoff-FR-SCENE-002.eml`.

---

## §2 — Why this design (rationale for humans)

**Why warmer brown-400 backdrop?** Master plan §3.4 — Scene 1 is the "Saigon café at 2 AM" feel; warmer than Scene 0's cinematic void. The shift in surface tone (700 → 400) signals "we've moved from intro to story" without changing palette.

**Why constraint-driven wisp coil?** Animating the wisp tail to follow a moving target (the idea-spark, which itself idles + pulses) via skeletal constraint produces natural-looking trail behaviour without keyframe authoring. Master plan §3.3a names this as the `coil_idle` clip pattern.

**Why pin the camera path in markdown, not Figma?** Figma can show end-poses but can't naturally show camera curves. The markdown describes the R3F `<PerspectiveCamera>` lerp + the easing curve — implementable directly by the R3F Developer (FR-SCENE-013) without ambiguity.

**Why the idea-spark frames as a separate PNG?** It's a shader/material parameter brief — the modeller bakes it into a noise-driven emissive cycle. Detached from the Figma comp because Figma can't express animation curves; six keyframes is the cheapest unambiguous handoff.

---

## §3 — Concrete content contract

### §3.1 Layout grid (desktop)

```
┌──────────────────────────────────────────────────────────────────────┐
│  [Skip 3D] [Mute] [Skip story]                                       │
│                                                                       │
│     ┌── canvas/DOM boundary ─────────────────────┐                    │
│     │                                              │                  │
│     │             ┌─────┐                          │                  │
│     │             │ LUMI│  ·                       │                  │
│     │             │     │  ◯ ← idea-spark          │                  │
│     │             │  └─~~╮  (--brand-gold-200      │                  │
│     │             └─────┘   + glow-genie-soft)     │                  │
│     │                                              │                  │
│     │ wisp curl                                    │                  │
│     │ constraint-driven                            │                  │
│     └────────────────────────────────────────────┬┘                   │
│                                                                       │
│   ▽ (typed caption, DOM, mono "JetBrains Mono"):                      │
│   "Stephen had one rule: build what                                   │
│    you'd be proud to sign."                                           │
└──────────────────────────────────────────────────────────────────────┘
```

### §3.2 camera-path.md (canonical shape)

```markdown
# Scene 1 Camera Path

## Start
- Position: (0, 0, 5) — same as Scene 0 settle pose.

## End (after coil_idle completes, t=5.0s)
- Position: (1.8, 0.2, 4.5) — slight pan-right + tilt-up.
- LookAt: (0.4, 0, 0) — eye anchored on the idea-spark.

## Curve
- Easing: ease-genie (FR-DS-006)
- Duration: 5.0s
- Drives: useFrame mutation on cameraRef.current.position

## Notes
- The pan reveals the idea-spark from off-frame at t=1.5s; the wisp begins
  the coil at t=2.0s (master plan §3.3a coil_idle clip).
- Scene transition out: at t=5.5s the camera begins lerp to Scene 2's start
  position, governed by FR-SCENE-020's scroll-orchestrator timeline.
```

### §3.3 idea-spark-frames.png — keyframe spec

| Frame | t (s) in 2.0s loop | Radius | Emissive intensity |
|---|---:|---:|---:|
| 1 | 0.0 | 0.06 | 0.4 |
| 2 | 0.4 | 0.08 | 0.7 |
| 3 | 0.8 | 0.10 | 1.0 |
| 4 | 1.2 | 0.08 | 0.7 |
| 5 | 1.6 | 0.07 | 0.5 |
| 6 | 2.0 | 0.06 | 0.4 |

Loops cleanly; modeller bakes via shader uniform.

### §3.4 storyboard.md (target shape, ≤ 250 words)

```markdown
# Scene 1 Origin — Storyboard (5-second arc)

t=0   Scroll progresses; Scene 0 fades out. Lumi remains in idle pose,
      slightly off-centre-left. Background warms from brown-700 to
      brown-400 over 0.5s.

t=0.5 Camera begins gentle pan-right + slight zoom toward Lumi.

t=1.5 A tiny golden orb (idea-spark) fades in to Lumi's right, just within
      his sphere of influence. Subtle pulse begins.

t=2.0 Lumi's wisp tail uncoils slightly, then begins wrapping around the
      idea-spark — a constraint-driven curl, not a scripted keyframe.

t=2.5 Below the canvas, the caption begins typing in mono:
      "Stephen had one rule: build what you'd be proud to sign."
      Two beats; ~ 3s to complete typing.

t=5.0 Caption settled. Wisp continues its idle coil. Camera at end pose.
      Scene holds for ~ 1s before the scroll-orchestrator advances to
      Scene 2.

Mute on: ambient pad continues from Scene 0. No new chime.
Mute off (rare): a soft single-key tick when caption begins.
```

---

## §4 — Acceptance criteria

1. **3 breakpoint comps + auxiliary files** — All files under `new_files:` present.
2. **Background = brown-400** — Eyedropper on background region MUST return `#6E3A18`.
3. **Idea-spark colour + glow** — Eyedropper on idea-spark MUST return `#F9D966` (gold-200); a glow halo region MUST sample within ±5% of `rgba(232, 181, 35, 0.45)`.
4. **Lumi pose from FR-CHAR-001** — Visual review confirms idle pose; wisp tail curls toward the idea-spark.
5. **Caption verbatim from FR-CMS-002** — `grep "Stephen had one rule" design/scenes/scene-1-origin/storyboard.md` MUST match; cross-ref to `content/narrative/lines/en.json` line id `scene-1-origin-primary`.
6. **Canvas/DOM boundary visible** — Every breakpoint comp has the dashed boundary line; caption sits OUTSIDE the canvas region.
7. **camera-path.md present + has Start/End/Curve sections** — `grep -c "^## Start\|^## End\|^## Curve" camera-path.md` MUST be 3.
8. **idea-spark-frames.png present + 6 keyframes documented** — table in §3.3 transcribed into the design file or comp annotation.
9. **storyboard.md ≤ 250 words** — `wc -w storyboard.md` ≤ 250.
10. **No forbidden iconography** — no nón lá, no capability satellites, no cool-tone primaries.
11. **Founder signoff** — Email archived.

---

## §5 — Verification method

Inspection (`verify: I`):
- Designer: files-exist + palette + layout + boundary + caption match (~30 min).
- R3F Developer: camera path implementability + idea-spark shader feasibility (~15 min).
- Founder: tone + emotional beat (Empathy per master plan §2.1) signoff (~30 min).

---

## §6 — Dependencies

- FR-SCENE-001 — establishes the breakpoint contract + canvas/DOM boundary pattern.
- FR-CHAR-001 — front-pose source.
- FR-CMS-002 — caption verbatim.

## §7 — Failure modes

| Failure | Detection | Recovery |
|---|---|---|
| Caption diverges from CMS source | AC#5 grep | Restore from `en.json` |
| Idea-spark colour drifts off-palette | AC#3 eyedropper | Replace with gold-200 exactly |
| Camera-path math doesn't match easing intent | R3F dev review | Verify ease-genie curve sampled at correct t-values |
| Wisp coil reads as too aggressive (over-animated) | Founder review | Reduce coil amplitude; FR-CHAR-011 owns the actual clip authoring |
| Caption typed in display face by mistake | Visual review | Use JetBrains Mono per FR-DS-007 caption family |
| Background drifts from brown-400 toward brown-500 | Eyedropper | Restore exact #6E3A18; Scene 1 is the warmer surface |
| storyboard.md exceeds 250 words | AC#9 wc | Trim |

---

*End of FR-SCENE-002. Audit: `FR-SCENE-002-scene-1-origin-figma-comp.audit.md`.*
