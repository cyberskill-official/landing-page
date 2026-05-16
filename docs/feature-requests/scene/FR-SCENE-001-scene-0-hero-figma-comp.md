---
id: FR-SCENE-001
engineering_anchor: true
title: "Scene 0 Hero — Figma comp at 3 breakpoints + 6 motion frames + storyboard"
module: SCENE
priority: MUST
status: accepted
accepted_at: 2026-05-16
accepted_by: Stephen Cheng
verify: I
phase: P1
milestone: P1 · slice 2
slice: 1
owner: Designer (Art Director)
created: 2026-05-16
shipped: null
brain_chain_hash: null
related_frs: [FR-SCENE-002, FR-SCENE-003, FR-SCENE-004, FR-SCENE-005, FR-SCENE-006, FR-SCENE-007, FR-SCENE-008, FR-SCENE-009]
depends_on: [FR-CHAR-001, FR-DS-001, FR-DS-002]
blocks:
  - FR-SCENE-002..008    # all other scene comps reference this as the canonical pattern
  - FR-SCENE-009         # Scene 0 implementation (P3)
  - FR-CHAR-004          # greybox scenes calibrate to comp framing

source_pages:
  - docs/01-master-plan-v2.md §2.1 (Master arc — Scene 0 row)
  - docs/01-master-plan-v2.md §3.4 Scene 0 Hero art direction
  - docs/01-master-plan-v2.md §5.3 (Loading strategy — LCP element is headline)
  - docs/01-master-plan-v2.md §6.1 (LCP < 2.5s p75)

source_decisions:
  - "v2 §3.4: --brand-brown-700 void + single warm spotlight from upper-right; --brand-gold-200 slogan typography"
  - "v2 §5.3: LCP element is the hero headline DOM text, NOT the canvas; canvas mounts after FCP via requestIdleCallback"
  - "v2 §6.1: LCP < 2.5s mobile p75 — headline must be deliverable as static SSR-rendered HTML"

# Build envelope
language: figma + storyboard
service: design/scenes/scene-0-hero/
new_files:
  - design/scenes/scene-0-hero/scene-0-hero-v1.fig
  - design/scenes/scene-0-hero/scene-0-hero-desktop-1920.png
  - design/scenes/scene-0-hero/scene-0-hero-tablet-1024.png
  - design/scenes/scene-0-hero/scene-0-hero-mobile-390.png
  - design/scenes/scene-0-hero/motion-frame-01-empty.png
  - design/scenes/scene-0-hero/motion-frame-02-flyin-start.png
  - design/scenes/scene-0-hero/motion-frame-03-flyin-mid.png
  - design/scenes/scene-0-hero/motion-frame-04-flyin-end.png
  - design/scenes/scene-0-hero/motion-frame-05-idle-with-cta.png
  - design/scenes/scene-0-hero/motion-frame-06-scroll-cue.png
  - design/scenes/scene-0-hero/storyboard.md
modified_files: []
allowed_tools:
  - figma: design/scenes/scene-0-hero/**
  - file_read: design/character-sheets/lumi-character-sheet-v1.fig
  - file_read: docs/01-master-plan-v2.md
disallowed_tools:
  - introduce a hero element other than Lumi + headline + CTA + scroll cue
  - put any CTA inside a Drei-Html canvas overlay (master plan §5.6 forbids canvas-DOM mixing for CTAs)
  - place any text overlay on Lumi (Lumi's narration lives in a separate caption track)

effort_hours: 8
sub_tasks:
  - "1h: import Lumi character-sheet front pose + nón-lá-off variant"
  - "1h: define LCP headline + caption sub-headline typography per FR-DS-007"
  - "1h: desktop comp (1920×1080) — spotlight upper-right, Lumi center-left, headline center, CTA below"
  - "1h: tablet comp (1024×1366) — vertical stack, particulate dust 60%"
  - "1h: mobile comp (390×844) — single-column, Lumi 45% of height"
  - "1h: 6 motion frames at desktop scale — empty, fly_in start/mid/end, idle, scroll cue"
  - "1h: storyboard.md narrative — what the user sees frame-by-frame in the first 4 seconds"
  - "1h: founder review + 1 revision round"

risk_if_skipped: |
  Without a locked Scene 0 comp, the R3F developer in P3 will improvise Lumi's framing, the headline
  typography pairing, the camera angle, and the CTA placement. Mid-build founder feedback then
  cascades through every subsequent scene comp (P1.2 FR-SCENE-002..008 all reference Scene 0's
  visual language). Skip → 1 week of P3/P4 churn.
---

## §1 — Description (BCP-14 normative)

A Figma composition for **Scene 0 Hero** ("What if your will became real?") **MUST** be authored at three breakpoints + six motion frames + an accompanying storyboard.md narrative.

1. **MUST** include three breakpoint comps: desktop 1920×1080, tablet 1024×1366, mobile 390×844. All three derive from a single locked master frame.
2. **MUST** designate the **LCP element as the headline DOM text**, NOT the canvas. The comp MUST annotate the headline with an "LCP target" marker and the canvas region with a "post-FCP mount" marker, consistent with master plan §5.3.
3. **MUST** use ONLY the Saigon Dusk palette per FR-DS-002: background `--brand-brown-700`, headline in `--brand-gold-200`, sub-headline in `--brand-gold-100`, spotlight tint `--glow-genie-soft`.
4. **MUST** place Lumi in front-pose (from FR-CHAR-001's turnaround) at:
   - **Desktop:** center-left, Lumi height ≈ 60% of viewport height, eye-line on the rule-of-thirds intersection.
   - **Tablet:** center, Lumi height ≈ 55%.
   - **Mobile:** center, Lumi height ≈ 45%, headline above, CTA below.
5. **MUST NOT** include the nón lá in Scene 0 (it appears first in Scene 5 per master plan §3.4). Lumi here is bare-headed/hooded.
6. **MUST** include exactly **one** primary CTA: "Book a Discovery Call" (master plan §9.1 Track 1 entry-point). Button uses `--brand-gold-400` fill + `--brand-brown-700` label text. Target size ≥ 44×44 (WCAG 2.5.5 AAA — per master plan §7.5).
7. **MUST** include a "Skip story" pill in the top-right corner of every breakpoint (master plan §2.3 — keyboard-reachable + always-visible accessibility path).
8. **MUST** include a "Skip 3D entirely" toggle next to the mute toggle in the header (master plan §2.3).
9. **MUST** include a scroll cue at the bottom-center — a small animated chevron + the caption "Scroll to begin". This is the visual handoff into Scene 1.
10. **MUST NOT** place any CTA, control, caption, or DOM-controllable text inside the canvas region. Master plan §5.6 forbids Drei `<Html>` for CTAs; the comp MUST visually demonstrate this constraint by drawing the canvas/DOM boundary explicitly on each breakpoint.
11. **MUST** annotate the **6 motion frames** at desktop scale, capturing the cinematic entry: (1) empty/dark, (2) `fly_in` start (Lumi off-frame upper-right), (3) `fly_in` mid (Lumi mid-arc, wisp trailing), (4) `fly_in` end (Lumi settled), (5) headline + CTA fade-in, idle pose, (6) scroll cue pulses. Per master plan §3.3a `fly_in` is 2.0s, ease-out-quint; the 6 frames sample that curve at t = 0, 0.4, 0.8, 1.2, 1.6, 2.0+idle.
12. **MUST** ship a `storyboard.md` narrative file describing what the user sees and hears in the first 4 seconds (with `mute=on` and `mute=off` paths) frame-by-frame, in plain English. ≤ 250 words. This is the brief the R3F developer reads before implementing FR-SCENE-009.
13. **SHOULD** include particulate dust (200 instanced points) as a small subtle reference in the comp, marked "Render in R3F — see FR-SCENE-012". This is hint annotation, not a deliverable in this FR.
14. **MUST** carry a "scroll-jacking ethics note" annotation citing master plan §2.3: Lenis smooths, GSAP reads progress, user's wheel/trackpad delta directly drives `scroll.progress`. The comp MUST visually communicate that the user, not the page, is in control.

---

## §2 — Why this design (rationale for humans)

**Why annotate LCP explicitly?** Master plan §6.1 puts LCP < 2.5s mobile p75 as a hard target. If the implementer reads only the comp, they might be tempted to make the canvas the visual hero — and then chase a wild LCP value. By marking the headline as LCP on the comp, the comp itself becomes the brief that drives the Next.js metadata + the `<h1>` SSR rendering decision in FR-SCENE-009.

**Why a "Skip story" pill on every breakpoint?** Master plan §7.3 + §2.3 — WCAG 2.3.3 + the "buyer audience may find this too much" risk in §10.2. Putting the pill in the comp ensures it's not an after-thought; it's baked into the layout grid.

**Why no nón lá in Scene 0?** Master plan §2.1 Scene 5 ("From Sài Gòn to your time zone") is where the nón lá appears for the first time, as the climactic Vietnamese-identity reveal. Scene 0 introduces "the genie that turns wishes real" — the cultural signal lands later when the buyer has earned context. Showing the nón lá in Scene 0 would either (a) lead with the geography (cost-first tropes) or (b) blunt the Scene 5 moment.

**Why the canvas/DOM boundary line?** Master plan §5.6 — CTAs and controls live in DOM overlays, never in Drei `<Html>`. The line on the comp makes this protocol-level constraint reviewable by non-engineers (Designer + founder) at sign-off.

---

## §3 — Concrete content contract

### §3.1 Layout grid (desktop 1920×1080)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  CyberSkill·                                  [Skip 3D]  [Mute]  [Skip story]│
│                                                                              │
│        ┌── canvas/DOM boundary ──────────────────────┐                       │
│        │       (R3F canvas — Lumi + spotlight + dust)│                       │
│        │                                              │                       │
│        │           ┌─────┐                            │     LCP HEADLINE      │
│        │           │ LUMI│                            │     "What if your     │
│        │           │ 60% │←── eye-line on             │      will became      │
│        │           │     │    upper rule-of-thirds   │      real?"           │
│        │           └─────┘                            │                       │
│        │                                              │     [Book Discovery   │
│        │                                              │      Call →]          │
│        │                                              │                       │
│        └──────────────────────────────────────────────┘                       │
│                                                                              │
│                         v Scroll to begin v                                  │
└─────────────────────────────────────────────────────────────────────────────┘
```

### §3.2 Layout grid (mobile 390×844)

Single column. Lumi 45% of height, headline above Lumi (LCP-fast), CTA + scroll cue stacked below.

### §3.3 Typography assignments

| Element | Token | Size |
|---|---|---|
| LCP headline | `--brand-gold-200` on `--brand-brown-700` | `clamp(40px, 6vw, 96px)`, weight 800, letter-spacing -3% |
| Sub-headline (optional) | `--brand-gold-100` | `clamp(16px, 1.5vw, 22px)`, weight 400 |
| CTA button label | `--brand-brown-700` on `--brand-gold-400` | 16-18px |
| Skip-story pill | `--brand-gold-200` text on transparent + `--brand-gold-400` border | 14-15px |
| Scroll cue caption | `--brand-gold-100` | 13-14px, weight 400 |

### §3.4 Motion frame timeline (desktop)

| Frame | t (s) | Lumi state | Headline opacity | CTA opacity | Spotlight intensity |
|---|---:|---|---:|---:|---:|
| 01 | 0.0 | off-frame | 0 | 0 | 0 (dark) |
| 02 | 0.4 | mid fly_in arc | 0 | 0 | 0.3 ramp |
| 03 | 0.8 | continuing arc, wisp trailing | 0.5 fade-in | 0 | 0.6 |
| 04 | 1.2 | near landing position | 0.9 | 0.3 | 0.85 |
| 05 | 1.6 | settled in idle pose | 1.0 | 1.0 | 1.0 |
| 06 | 2.4+ | idle (looping) + scroll cue pulses | 1.0 | 1.0 | 1.0 |

### §3.5 storyboard.md (target shape, ≤ 250 words)

```markdown
# Scene 0 Hero — Storyboard (first 4 seconds)

t=0   The page renders in static HTML: the headline "What if your will became real?"
      is already visible (LCP), against a deep warm-brown background. No motion. No
      audio. Mute is on by default.

t=0.4 (FCP done; requestIdleCallback fires.) A warm spotlight begins to rise from
      upper-right. The screen is otherwise still.

t=0.6 Lumi enters from off-frame upper-right in a corkscrew arc — golden body, wisp
      tail trailing a soft fading line of light. The eye is led from headline to
      Lumi.

t=1.6 Lumi settles into idle pose, center-left of frame. Arms crossed. Hood "C"
      emissive at 0.2 default. Wisp drifts gently.

t=2.0 The "Book a Discovery Call" CTA fades up beneath the headline. The
      "Skip story" pill is already visible top-right.

t=2.4 A subtle scroll cue (chevron + "Scroll to begin") pulses at bottom-center.
      Lumi blinks once. The page is now in idle. The user has full control of
      scroll velocity from here on — Lenis smooths but never overrides.

If mute is off: a soft warm chime at t=0.6 marks Lumi's entry; gentle wind/breath
at -16 LUFS underpins idle. Mute can be toggled at any time; toggle state
persists in localStorage.
```

---

## §4 — Acceptance criteria (testable, ordered, numbered)

1. **Files exist** — All 11 files in `new_files:` MUST exist at the documented paths. PDF export of the Figma file MUST also exist for offline review (≤ 5 MB total deliverable).
2. **Three breakpoints** — The Figma file MUST contain three frames named exactly `desktop-1920`, `tablet-1024`, `mobile-390`. Each MUST adopt the layout proportions in §3.1 / §3.2.
3. **LCP marker** — Every breakpoint comp MUST carry an "LCP target — headline DOM" annotation overlay (Figma comment or visible marker). The canvas region MUST carry a "post-FCP mount" annotation. Annotations MUST cite master plan §5.3 + §6.1.
4. **Palette compliance** — Eyedropper sampling of every visual element (excluding annotation overlays) MUST return one of: `--brand-brown-{500,700}`, `--brand-gold-{100,200,400,500}`, `--glow-genie-soft`. Zero pixels MAY return cool tones, off-palette gold, the Vietnamese flag red/yellow (Scene 5 only).
5. **Lumi placement** — Lumi's bounding box on the desktop comp MUST occupy 60% ± 5% of viewport height; tablet 55% ± 5%; mobile 45% ± 5%. Measured via Figma's inspector.
6. **No nón lá** — Lumi appears in the bare front-pose from FR-CHAR-001 at all three breakpoints. No nón lá mesh / accessory. Spot-check: `grep -i 'nón\|nonla\|hat' design/scenes/scene-0-hero/scene-0-hero-v1.fig` MUST return zero hits in the artboard's layer names (excluding annotations that say "nón lá appears Scene 5").
7. **Canvas/DOM boundary** — Each breakpoint comp MUST show an explicit dashed line or hatched region delineating the R3F canvas surface vs DOM overlay surface. The CTA, Skip-story pill, Skip-3D toggle, mute toggle, scroll cue, and headline MUST sit OUTSIDE the canvas region.
8. **CTA target size** — Measured via Figma inspector, the "Book a Discovery Call" button MUST be ≥ 44×44 px at all three breakpoints (WCAG 2.5.5 AAA per master plan §7.5). The Skip-story pill MUST be ≥ 44×44 px (or ≥ 24×24 with AA-compliant adjacent spacing — pick one; comp annotates which standard applies).
9. **Six motion frames** — Six labelled `motion-frame-N` artboards MUST exist at desktop scale, matching the timeline in §3.4 (t-values, opacities, intensities). A reviewer scrubbing through the frames MUST see a continuous visual progression.
10. **storyboard.md** — `storyboard.md` MUST exist with the shape in §3.5 (≤ 250 words, time-stamped frames, mute-on + mute-off paths). It is the verbatim brief for FR-SCENE-009's implementer.
11. **Skip-story pill present** — Top-right "Skip story" pill MUST appear on all three breakpoint comps. Pill state diagram (default / hover / focused / clicked-to-Scene-6) annotated separately.
12. **Founder signoff** — Email reply approving the comp, archived to `design/scenes/scene-0-hero/signoff-FR-SCENE-001.eml`. Required to ship the FR.

---

## §5 — Verification method

**Inspection (`verify: I`)** by:

1. The Designer — files-exist + palette + layout + Lumi-placement + canvas-boundary + CTA size + motion-frame continuity checks (~60 min).
2. The R3F Developer — implementation feasibility review: can `fly_in` clip be timed to match the 6 motion frames? Does the canvas region cleanly host the meshes at the documented composition? (~30 min consult).
3. The founder — narrative + tone + Skip-story discoverability + "does this feel like CyberSkill?" (~45 min).

There is no automated test for an inspection FR; future CI can lint the file paths exist + the palette via sampled pixel grid. Not in scope.

**Test record:** the storyboard.md doubles as the test artefact — it is the canonical interpretation of the comp.

---

## §6 — Dependencies

- FR-CHAR-001 (Lumi 2D character sheet) — needed for the front pose and palette discipline.
- FR-DS-001 (mood board) — needed for tonal alignment.
- FR-DS-002 (palette swatch + WCAG matrix) — needed for the exact hex values.

---

## §7 — Failure modes inventory

| Failure | Detection | Recovery |
|---|---|---|
| Headline not annotated as LCP | Designer or founder review | Add the annotation overlay; re-export |
| Lumi placement out of % bounds | Figma inspector measurement | Adjust frame; re-measure |
| Cool tone slips into spotlight | Eyedropper grid | Replace; re-sample |
| Canvas/DOM boundary missing | Designer review | Draw the dashed boundary; re-export |
| CTA < 44×44 at mobile | Figma inspector | Resize CTA to meet AAA; verify text legibility at new size |
| Motion frames don't read as continuous | Reviewer scrub-through | Re-time the t-values; ensure ease-out-quint curve sampled at correct points |
| storyboard.md exceeds 250 words | `wc -w` check | Trim; the file is a brief, not a doc |
| nón lá accidentally included | Layer-name grep | Remove; the nón lá's first appearance is Scene 5 (master plan §2.1) |
| Founder requests revision after signoff | Email reply | Open `FR-SCENE-001a-...` successor FR; do not edit this one in place |

---

## §8 — Notes

- The 6 motion frames are reference, not rendered animation. The R3F developer reads them to validate that `fly_in` (master plan §3.3a — 2.0s, ease-out-quint) lands at the documented positions.
- The storyboard.md format will be reused verbatim for FR-SCENE-002..008. This FR establishes the per-scene storyboard contract.
- "Particulate dust" (SHOULD #13) is hint annotation only — FR-SCENE-012 is where the 200 instanced points get rendered in R3F.

---

*End of FR-SCENE-001. Audit: `FR-SCENE-001-scene-0-hero-figma-comp.audit.md`.*
