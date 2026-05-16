# CyberSkill Marketing Landing Page — Master Plan **v2**
**A 3D + Animated, Storytelling-Driven Site Anchored by Lumi the Golden Genie**
*Document version: v2.0 · Updated May 2026 · Owner: Stephen Cheng (Trịnh Thái Anh), Founder*

> **What changed from v1:** The character is a **genie** (matching the actual logo), not a dragon. Brand palette is **saffron-gold on warm brown** (the real CyberSkill colors), not navy + amber. Vietnamese cultural signal is a **red nón lá with a yellow star**, not a bodhi-leaf. Scene 5 narration updated. All design-system tokens, character spec, and scene mood cards refreshed. Strategy, architecture, and roadmap unchanged from v1.

---

## TL;DR
- **Build a single-page, scroll-choreographed Next.js 15 + R3F site with one persistent "Lumi" Golden Genie mascot acting as narrator across 7 scenes**, three audience-routed CTA tracks (Buy / Partner / Join), and a strict 3 MB first-scene / 200 KB critical-JS budget. Treat the existing CyberSkill Design System as the *base layer* and extend it with a marketing-only "Cinematic Pack" — do **not** fork it.
- **Anchor your differentiation on craft, not cost.** Vietnamese outsourcing is now a crowded category. A 10-person boutique cannot win on scale; it can win on a museum-grade web experience that signals senior taste, with a mascot that is a genie *born from your literal logo*, gently signaling Vietnamese identity through brand colors and a red nón lá with a yellow star (the Vietnamese flag in micro-form).
- **Treat this as a 18-week, 6-phase delivery, not a "design + dev" project.** Ship Scene 1 polished at week 8 (proof of concept for partners and recruits), then sequence the rest. The single largest risk is asset weight blowing past budget — the plan below hard-wires a Blender → glTF-Transform → Draco/Meshopt + KTX2/Basis pipeline with file-size gates that block merges.

---

## 1. Strategy & Positioning

### 1.1 Lumi the Golden Genie — concept rationale and cultural framing

The slogan "Turn Your Will Into Real" is a wish-fulfillment promise. The natural mascot for that promise is a **genie** — a being who actualizes intent — and the CyberSkill logo *is already* a stylized golden genie: a pointed flame-leaf hood with an embossed "C", a round friendly face, crossed arms, and a swirling wisp tail. **Lumi** (the 3D incarnation) starts from that exact mark and gives it dimension, expression, and animation. We are not inventing a new character; we are **bringing the logo to life**.

**Why the genie archetype works globally.** The wish-granting figure is one of the few mythic archetypes that reads positively across nearly every culture (Aladdin, Arabian Nights, the Spirits in *A Christmas Carol*, fairy godmothers, Japanese kami of grants, Vietnamese *thần đèn*). It is friendly, helpful, and high-status by default — exactly right for a *services* brand whose job is to grant your software wish.

**Why this genie reads as Vietnamese, not generic.** Three layers of cultural signaling, in order of subtlety:

1. **The brand palette itself is quintessentially Vietnamese.** Deep warm brown (Bát Tràng pottery, lacquerware, Vietnamese coffee, *cánh gián* "cockroach-wing" brown) paired with saffron-gold (áo dài silk, temple light, the literal color of Saigon at dusk). This is *not* the navy-and-cyan tech-shop default — it does the cultural work without iconography.
2. **A red nón lá with a single yellow star** is Lumi's signature accessory. It appears prominently in Scene 5 (Vietnam → Global) and as a small Easter-egg detail on hover throughout. The nón lá is one of the most internationally recognized Vietnamese symbols, and the red+yellow-star pairing is the Vietnamese flag in micro-form. **This is the explicit cultural signal:** gentle, instantly readable, never kitschy. Lumi wears it the way one wears a favorite cap — casually, with affection.
3. **No dragons.** We deliberately reject the Chinese-coded dragon iconography that smaller Asian agencies often default to. CyberSkill is Vietnamese, modern, and confident. The genie + nón lá combination says that without a single line of explainer text.

**Naming.** Internally and externally call it **"Lumi"** — universal, short, "luminous," easy to chant, non-Vietnamese-language-locked so global audiences can pronounce it without tripping. A small bilingual hover-reveal in Vietnamese — *"Lumi — vì ánh sáng biến nguyện ước thành sự thật"* (Lumi — because light turns wishes into truth) — gives Vietnamese visitors a moment of recognition.

### 1.2 Three audiences, one page, three tracks

| Audience | Primary intent | Key fears | Conversion event | Where they enter the funnel |
|---|---|---|---|---|
| **NA/EU enterprise & SMB buyers** | Find a senior, English-fluent dev partner without paying NA prices | "Will time zones, communication, and quality break us?" | **Book a Discovery Call** (Calendly) | Hero CTA + Scene 4 + Scene 7 (CTA hub) |
| **Tech partners / agencies** | Find a white-label or co-delivery partner | "Will they steal my client / are they real?" | **Partner With Us** (multi-step → HubSpot) | Sticky nav, Scene 5, CTA hub |
| **Talent / recruits** | Join a craft-driven remote Vietnamese team | "Is this just another body shop?" | **Join the Team** (jobs / open-app form) | Footer track, Scene 4, "Behind Lumi" mini-arc |

### 1.3 Messaging hierarchy

- **Master proposition:** *We turn your will into real software — small senior team, global craft, Vietnamese roots.*
- **Buyer proof points:** 10 senior-only engineers · founded 2020 · DUNS-verified (673219568) · 2 active long-term enterprise engagements · time-zone-honest · GDPR-ready.
- **Partner proof points:** White-label-friendly process · React/Three.js/AI specialization · component-system-native (we ship with our own design system, not Bootstrap).
- **Recruit proof points:** Remote-first · craft-first culture · senior peers · founder-accessible.
- **Tone:** Confident, warm, slightly mythic in narration; precise and quantitative in proof. Avoid "synergize" / "leverage" / "world-class". Lumi narrates emotionally, the page text proves rationally.

### 1.4 Competitive landscape — what to emulate, what to avoid

| Studio / site | Emulate | Avoid |
|---|---|---|
| **Lusion (lusion.co, v3 SOTY 2023)** | Custom-baked assets, real-time-meets-craft fusion. | Their site is *all* shader and demands esoteric tech maturity. |
| **Active Theory** | Cinematic typography, Z-space layered planes, render-target dynamic text. | Don't gamify the homepage. |
| **Resn** | Fearless brand-tone weirdness; rewards exploration. | Too eccentric for a B2B services audience. |
| **Immersive Garden (Awwwards Agency 2024)** | gltf-Transform automation pipeline; backstage transparency section. | Their density is tuned for creative-industry, not enterprise. |
| **Lusion v3 / 14islands V4** | The persistent `<GlobalCanvas>` pattern with proxy-DOM-tracking — exactly our architecture. | Don't ship six Houdini sims. |
| **Igloo Inc. (abeto, Awwwards SOTY 2024)** | Hybrid scroll+3D with frictionless nav — **the gold standard for our target.** | Their crypto-coded aesthetic — we want enterprise warmth, not web3. |
| **OFF+BRAND / Lando Norris (SOTY 2025)** | Webflow + WebGL + Rive proves you can hit SOTY without bespoke engines. | F1-energy hyper-bold typography would feel manic for a consultancy. |
| **Ueno (retired)** | Minimal narrative case-study structure. | Too DOM-only for our craft differentiation. |
| **Bruno Simon portfolio** | Visible joy, Easter eggs, signed personality. | Don't drive a car. |

**Strategic synthesis:** Steal Igloo's hybrid scroll+3D architecture, Lusion's baked-asset craft, Active Theory's typography, 14islands' R3F-scroll-rig progressive enhancement, and Ueno's narrative discipline. Avoid every studio's signature exuberance — the bar for a *services* site is "make the buyer feel they are in safe, taste-driven hands within 6 seconds," not "make them play."

---

## 2. Storytelling Architecture

### 2.1 Master arc — "Lumi as guide, your idea as hero"

A Pixar-style three-act compressed into 7 scroll-driven scenes (~ 9 viewport heights total, ~ 90s of dwell at average scroll cadence).

| Scene | Title | Viewport heights | Lumi's role | Emotional beat | Narrative function |
|---|---|---|---|---|---|
| **0. Hero** | "What if your will became real?" | 1.0 | Fly-in, lands beside headline, points at scroll cue | Curiosity / intrigue | Hook + mascot intro + above-fold CTA #1 (Buy) |
| **1. Founder Origin** | "Saigon, 2020." | 1.5 | Wisp tail coils around floating idea-spark; voiceover-style captions tell Stephen's origin | Empathy | Establishes humanity of founder + slogan meaning |
| **2. Client Transformation** | "From sketch to system." | 1.5 | Uncrosses arms, becomes a paintbrush of light — draws a wireframe that morphs into a working app shell | Wonder | Proof of capability via two real long-term engagements |
| **3. Capability Showcase** | "How we turn will into real." | 1.5 | Splits into 4 wisp-ribbons that orbit 4 capability pillars | Confidence | Stack credibility — React, Three.js, AI/RAG, design systems |
| **4. The Team Behind the Light** | "Ten people. One craft." | 1.0 | Dim/quiet — pulls back to reveal 10 small hovering avatars | Trust / warmth | Humanize the team; doubles as recruit hook |
| **5. Vietnam → Global** | "From Sài Gòn to your time zone." | 1.5 | Red nón lá with yellow star fades onto Lumi's hood; tilts hat in salute; becomes luminous arc connecting HCMC to NA/EU pins | Pride / scale-readiness | Address the "but you're in Vietnam" objection head-on |
| **6. CTA Hub** | "What do you want to make real?" | 1.0 | Splits into 3 paths — Lumi turns toward whichever CTA you focus | Decision | The 3-track conversion fork |
| **Footer** | Trust signals + secondary nav | 0.7 | Lumi waves goodbye, curls into persistent corner avatar (nón lá stays on) | Closure | DUNS, address, contact, hreflang |

### 2.2 Microcopy and Lumi's voice

**Voice principles (English-first):**
- Short. Lumi never speaks more than 12 words at a time on screen.
- Concrete-mythic: "I light the path from sketch to ship" — not "We synergize digital transformation."
- First-person plural for the *company*, first-person singular for *Lumi* — they are distinct narrators.
- No exclamation marks. No emoji in body. Power restraint.

**Sample lines (per scene):**
- Scene 0: *"Whisper an idea. I'll show you the rest."*
- Scene 1: *"Stephen had one rule: build what you'd be proud to sign."*
- Scene 2: *"Most software dies in the gap between sketch and ship. We close it."*
- Scene 3: *"React, Three.js, AI, design systems — four hands of the same craft."*
- Scene 4: *"Ten of us. All senior. All Vietnamese. All remote."*
- Scene 5: *"From Sài Gòn to your time zone."*
- Scene 6: *"You bring the will. We bring the real."*

**Localization hooks:** every line lives in `/i18n/{en,vi}.json`. Vietnamese variants are slightly more poetic (cultural register), English is operational. `hreflang` set on the page; language switcher in footer.

### 2.3 Scroll-jacking ethics & accessibility paths

Pinned scenes with `scrub` are **scroll-linked**, not scroll-hijacked: the user always controls progress.
- **Never override scroll velocity** — Lenis smooths, GSAP ScrollTrigger reads progress, but the user's wheel/trackpad delta directly drives `scroll.progress`.
- **Always-visible "Skip story" pill** in the top-right: jumps directly to Scene 6 (CTA hub).
- **`prefers-reduced-motion`** → swap the Canvas for a 2D illustrated-storyboard fallback (six static SVG/PNG panels with the same captions). This is also the WCAG 2.3.3 alternative.
- **Keyboard:** `Tab` cycles through scene anchors (each scene has an `<h2>` and a "Next scene" button).
- **Skip 3D entirely** toggle in the header → renders a pure-DOM "Lite" version. Persisted in `localStorage`.

---

## 3. Design Language Extension — "Cinematic Pack"

### 3.1 Relationship to the existing Design System

The CyberSkill Design System (your 20+ part doc set covering foundations, components, AI ethics, theming, etc.) remains the **single source of truth for product UI**. We add a *non-replacing* extension package called `@cyberskill/ds-cinematic` containing only marketing-relevant tokens and components. It depends on `@cyberskill/ds-foundations` and inherits all base tokens.

```
@cyberskill/ds-foundations  (existing — color, typography, spacing primitives)
        ↑ extends
@cyberskill/ds-cinematic   (new — motion tokens, glow, cinematic type, Lumi components)
```

This obeys the existing Component Lifecycle governance: Cinematic Pack starts at *Experimental*, graduates to *Stable* once the marketing site ships, and any reusable parts can be back-promoted into foundations later.

### 3.2 New tokens — "Saigon Dusk" palette

The CyberSkill brand colors (read directly from the logo) **are already cinematic** — warm brown evokes Vietnamese lacquerware and Saigon evening, gold evokes silk, temple light, and the very meaning of "auspicious" in Vietnamese aesthetics. We do not need to dress them up. **Yellow-gold on deep warm brown is the entire visual language.**

```css
/* Primary — yellow-gold (from logo) */
--brand-gold-50:  #FEF6D9;   /* highlights, subtle backgrounds */
--brand-gold-100: #FCEAA8;
--brand-gold-200: #F9D966;
--brand-gold-400: #E8B523;   /* LOGO PRIMARY — Lumi base color */
--brand-gold-500: #C99317;   /* deeper gold — Lumi tail tip */
--brand-gold-600: #9F730E;

/* Primary — warm brown (from logo) */
--brand-brown-50:  #F4E5D6;
--brand-brown-100: #DDB995;
--brand-brown-200: #A36A3F;
--brand-brown-400: #6E3A18;
--brand-brown-500: #4A2208;   /* LOGO BACKGROUND — surface base */
--brand-brown-700: #2C1304;   /* deepest — canvas/cinematic surface */

/* Cinematic surfaces */
--surface-cinematic: #2C1304;
--surface-glow-bg:   #6E3A18;
--text-on-brown:     #FEF6D9;

/* Vietnamese-flag accents — RESERVED for Scene 5 only */
--accent-flag-red:    #DA251D;   /* Vietnamese flag red — nón lá */
--accent-star-yellow: #FFEB3B;   /* Vietnamese flag yellow — star */

/* Glow recipes */
--glow-genie-rim:   rgba(255, 196, 64, 0.85);
--glow-genie-soft:  rgba(232, 181, 35, 0.45);
--glow-scene-edge:  rgba(232, 181, 35, 0.15);
```

Cool tones (cyan, magenta) appear only as small per-scene accent injections in Scene 3 (the four capability satellites need to read distinctly), and the Vietnamese flag red+yellow-star pairing only in Scene 5. Nowhere else.

Always pair gold against a surface ≥ `--brand-brown-500` (#4A2208) to maintain WCAG AA 4.5:1 for body text. Gold body text against gold-50/100 backgrounds fails contrast — never do that.

**Motion tokens:**
```css
--duration-instant:    80ms;     /* micro-interactions */
--duration-swift:     240ms;     /* standard transitions */
--duration-cinematic: 720ms;     /* scene-camera moves */
--duration-epic:     1400ms;     /* hero entry */
--ease-genie:    cubic-bezier(0.22, 1, 0.36, 1);   /* out-quint, lumi's signature */
--ease-breath:   cubic-bezier(0.45, 0, 0.55, 1);   /* sin-like, idle loops */
--ease-anchor:   cubic-bezier(0.65, 0, 0.35, 1);   /* scene snap */
```

**Cinematic typography pairing:** keep your existing UI sans for paragraph text. Add a **display face** for scene titles — recommend **"Söhne Breit"** (paid) or open-source **"Inter Display"** at weights 600/800 with -3% letter-spacing, scaled `clamp(40px, 6vw, 96px)`. Reserve a third **"caption" variant** (mono, e.g. JetBrains Mono) for Lumi's quoted lines, which gives them a subtitle-card feel.

### 3.3 Lumi character design brief (for the modeler)

The CyberSkill logo IS Lumi in 2D. Our job is to give it dimension, expression, and animation while keeping the silhouette unmistakable.

| Attribute | Spec |
|---|---|
| Reference | The CyberSkill logo: pointed flame-leaf hood with embossed "C", round face, crossed arms, swirling wisp tail |
| Overall silhouette | Top-heavy: hood + face + body ≈ ⅔ of figure, wisp tail ≈ ⅓. Readable at 32×32 px on dark BG (silhouette test) |
| Hood | Pointed leaf/flame shape, slightly forward-leaning. The "C" is geometry (extruded ~3 mm), with subtle emissive that pulses softly when Lumi speaks |
| Face | Round, friendly. Two large expressive eyes (~30% of head height), no visible nose, gentle mouth that animates via shape keys. NO fangs. The face sits inside a circular "porthole" of warm-brown surface tone — matching the logo |
| Body | Stylized cylindrical torso narrowing to wisp. Crossed arms in idle (matching logo). Arms uncross for animations (point, wave, paint, summon) |
| Wisp tail | Flowing swirl, curls naturally. Bone-driven — trails when flying, settles when still. Translucent fade at the tip (alpha gradient, ~ 15% opacity at very end) |
| Material | PBR. Base color: vertical gradient from `--brand-gold-200` (hood top) → `--brand-gold-400` (body) → `--brand-gold-500` with alpha-fade at tail. Metallic 0.4, roughness 0.35. Subtle iridescence (custom TSL node) shifting toward warm pink, never cool blue |
| Emissive | Faint glow on the "C" embossing (default 0.2 intensity); rises to 0.8 when speaking; pulse-syncs with `glow_pulse` shape key |
| Tri count | Target **28k**, hard cap **40k**. Single watertight mesh except wisp tail (separate, alpha-blended) and optional nón lá accessory (separate) |
| Polygon distribution | 35% hood, 25% face, 25% body+arms, 15% wisp tail |
| UV layout | Single 2k atlas (BaseColor, Normal, ORM packed, Emissive). Wisp tail: own 1k atlas. Nón lá: 512×512 |
| Shape keys (10) | `eye_close`, `eye_squint`, `mouth_smile`, `mouth_speak`, `mouth_o`, `brow_raise`, `brow_concern`, `cheek_puff`, `glow_pulse` (drives emissive), `hood_tip` |
| Rig | **Custom armature, NOT Rigify.** Spine: 4 bones (hip → torso → neck → head). Arms: 8 bones total (2× shoulder + elbow + wrist + IK target). Wisp tail: 8 bones (chain) with auto-IK. Hood: root + tip bone. Jaw: 1. Eyes: 2. Brows: 2. Nón lá socket: 1 bone on top of hood. **Total ~ 27 bones.** Skinning capped at 4 vertex influences (glTF standard) |

#### 3.3a Animation library

| Clip | Duration | Loop? | Trigger | Notes |
|---|---|---|---|---|
| `idle` | 4.0 s | Yes | Default | Crossed arms, slow breathing (hood +1cm), wisp undulates, blinks every 4-7s randomized |
| `fly_in` | 2.0 s | No | Page load (Scene 0) | Corkscrew arc from (-5, +1, 8) → (0, 0, 0), ease-out-quint. Wisp leaves fading trail. Ends in idle pose |
| `point` | 1.2 s | No | Scene transitions, CTA hovers | Uncrosses right arm, points forward + slightly down. Returns to idle |
| `summon` | 3.0 s | No | Scene 0 hero CTA, Scene 6 hub | Both arms rise, hood emissive pulses, wisp spirals upward. Big confident gesture |
| `wave` | 1.5 s | No | First user interaction | Uncrosses right arm, waves twice |
| `coil_idle` | 5.0 s | Yes | Scene 1 (Origin) | Wisp wraps around an off-mesh "idea-spark" via constraint to a target object |
| `paint` | 4.0 s | No (loops cleanly) | Scene 2 (Transformation) | Right arm extends as if drawing; wisp trails; emissive pulses on hand |
| `split_to_4` | 2.5 s | No | Scene 3 (Capabilities) | Body fades; wisp splits into 4 ribbons orbiting 4 satellites. Morph blend on tail material |
| `wave_goodbye` | 2.0 s | No | Footer transition | Waves both arms, curls down + tail spirals into small persistent corner version |
| `nonla_appear` | 1.0 s | No | Scene 5 entry | Red nón lá with yellow star fades onto hood-socket bone. Lumi tilts hood in friendly salute |
| `nonla_tip` | 1.5 s | No | Scene 5 hover-on-Vietnam-pin | Lumi tips nón lá toward camera, briefly revealing inside (gold lining) |

#### 3.3b The nón lá accessory

A separate, swappable mesh:
- Conical hat shape, ~ 12 cm diameter at brim, ~ 8 cm tall (relative to Lumi's ~ 1.6m height)
- Color: `--accent-flag-red` (#DA251D) exterior, `--brand-gold-200` interior lining (visible on `nonla_tip`)
- Single yellow star (`--accent-star-yellow`, #FFEB3B) on the front, ~ 30% of cone diameter
- Tri count: ≤ 600
- Parented to a single bone (`hat_socket`) on top of the hood
- Toggle via `nonla_visible` Boolean in scene state — fade-in on Scene 5 entry, persists thereafter (Lumi has chosen its identity), stays on through the footer
- **Cultural note:** the nón lá is functional headwear, not ceremonial — its presence is warm and casual, not formal. Lumi wears it like one might wear a baseball cap. This casualness is the point: "we're Vietnamese, hello."

#### 3.3c Voice cues (audio, optional, muted by default)

Soft warm chime + gentle wind/breath sounds, no language. Designed by composer with brief: *"Imagine the sound a candle would make if it could greet you."* Maximum loudness ≤ -16 LUFS. Honors `prefers-reduced-motion` AND an explicit page mute toggle (default-on). Total audio library ≤ 1.5 MB across all cues.

### 3.4 Scene art direction

All scenes inherit the Saigon Dusk warm-brown surface; per-scene "tint" comes from lighting and selective accent injection, not from changing base palette.

- **Scene 0 Hero** — `--brand-brown-700` deep void with single warm spotlight on Lumi from upper-right. Subtle particulate dust (200 instanced points, alpha-fade). Slogan typed in `--brand-gold-200`.
- **Scene 1 Origin** — Sepia-warm interior feel — like a dimly lit Saigon café at 2 AM. Warmer brown (`--brand-brown-400`) backdrop with floating idea-spark (Lumi's wisp coils around it). Single text caption typed line-by-line.
- **Scene 2 Transformation** — High-contrast paper-white-on-brown sketchpad metaphor. Lumi's "paint" gesture leaves additive-blended trail in `--brand-gold-400` morphing into a working app shell wireframe. Wireframe uses *only* gold + brown.
- **Scene 3 Capabilities** — Quadrant composition. Four cool-tinted satellites are the *only* place we deviate from warm-only: cyan, magenta, lime, gold (need to read distinctly). Background `--brand-brown-500`. Gold satellite is the home base.
- **Scene 4 Team** — Warm golden-hour palette. Soft bokeh background using `<MeshTransmissionMaterial>` orbs. Ten small avatars float at varying depths. Lumi pulls back, dimmer, less rim-light — the team is the focus.
- **Scene 5 Vietnam → Global** — Stylized globe (~ 6k tris) lit warmly. **Only scene that uses `--accent-flag-red` and `--accent-star-yellow`**: as Lumi tilts the nón lá into view, the Vietnam pin pulses red, then a glowing arc draws to NA/EU pins. Arc is `--brand-gold-400` shading to `--accent-star-yellow` at endpoints.
- **Scene 6 CTA Hub** — Three glowing portals, color-coded per audience: solid gold (Buy), warm brown with gold edge (Partner), gold-50 with brown edge (Join). Background unchanged. Lumi turns toward the focused/hovered card.
- **Footer** — Lumi shrinks to a corner, idles, persistent across full footer scroll. Nón lá stays on. Background fades up to `--brand-brown-400`, signaling "out of the cinematic."

### 3.5 Light/dark mode

The 3D experience is **dark-only by design** (cinematic, brand-coherent). The DOM around it (header, footer, "Lite" mode) follows the existing DS theming. Honor `prefers-color-scheme` for the Lite path. Never try to retheme the canvas at runtime — it's costly, brand-incoherent, and changes Lumi's signature gold.

---

## 4. 3D / Blender Pipeline

### 4.1 Blender baseline conventions

| Setting | Value |
|---|---|
| Blender version | **4.4 LTS** (4.4 supports shape keys as action slots — relevant for facial animation export) |
| Units | Metric, Unit Scale 1.0, Length Meters |
| Scene scale | 1 unit = 1 meter; Lumi's height ≈ 1.6 m |
| Up axis | +Z up in Blender, glTF exporter auto-converts to +Y up for the web |
| Naming | `lumi_main` (mesh), `lumi_arm` (armature), `lumi_nonla` (accessory mesh), `scene_<n>_<prop>`, textures e.g. `tex_lumi_basecolor.ktx2` |
| Collections | One per scene + one for Lumi. `lumi_main` is **linked**, not duplicated, into each scene |
| Shading | **Principled BSDF only.** No Cycles-only nodes. Custom node groups must be flattened before export |
| UV layout | Single UDIM-free UV. Lumi uses one 2k atlas; nón lá uses 512×512; scene props share atlases per scene |

### 4.2 Modeling & rigging Lumi

**Model:** start from the logo SVG imported as reference, build hood + face + arms + body + wisp tail. Retopo with Quad Remesher to ~ 6k base, sculpt detail, bake to normal map. Final tri count target **28k**, hard cap **40k**.

**Rig (~ 27 bones):**
- Build a **custom armature**, not Rigify (Rigify exports poorly to glTF — multi-mesh morph target bug, sparse-accessor incompatibility).
- Skinning: max **4 vertex influences** (default glTF limit).
- Parent mesh **directly to armature**, not to a bone — required for shape-key animation export to behave correctly.

**Shape keys:** create the 10 listed in §3.3. Drive them via **custom properties** on a control bone (`c_head`), with Blender drivers — preserves the rig↔shape-key link through export.

**Animations:** use the NLA editor. Each clip ≤ 5 s, one strip per clip. Bake before export. Animation sample rate: 30 fps. Disable "Preserve Volume" on the armature modifier (game engines / glTF runtime don't support dual-quaternion skinning).

### 4.3 Export & optimization pipeline

The Blender exporter alone produces oversized GLBs and doesn't support `EXT_meshopt_compression`. We use a **two-stage pipeline**.

**Stage 1 — Blender exporter** (artist-side):
- Format: **GLB** (single-file binary)
- Uncheck "Use sparse accessor if better"
- Include: Selected Objects, Custom Properties, Cameras (off), Punctual Lights (off — we light in R3F)
- Animations: All Actions, NLA Strips, Sampling 1.0, Optimize Animation Size = **off** for hero animations
- Compression: **off** at this stage (Blender's Draco mangles morph targets)
- Output naming: `lumi.raw.glb`, `scene-1.raw.glb`, etc.

**Stage 2 — `glTF-Transform` post-processing** (CI/automation, Node.js):

```js
// scripts/gltf-pipeline.mjs — pseudocode
import { NodeIO } from '@gltf-transform/core';
import { dedup, prune, weld, resample, draco, meshopt, textureCompress } from '@gltf-transform/functions';

const doc = await io.read('lumi.raw.glb');
await doc.transform(
  dedup(),
  prune(),
  weld({ tolerance: 0.0001 }),
  resample(),
  // Lumi (rigged + morphs): Meshopt — handles morph targets and animation cleanly
  meshopt({ level: 'medium' }),
  // Static props: draco({ method: 'edgebreaker' }) is smaller
  textureCompress({ encoder: sharp, targetFormat: 'webp', quality: 80 }),
  // KTX2/Basis for VRAM-critical textures
);
await io.write('lumi.glb', doc);
```

**Critical rule:** for the **rigged & morphed Lumi use Meshopt, not Draco**. Draco degrades morph target precision; Meshopt was explicitly designed for geometry + morph targets + animation. For static props (logos, set-dressing) Draco edgebreaker (`-cc`) gives the smallest file.

**Texture path:**
- Author in **Substance 3D Painter** (Adobe Substance — Cowork-integrated). Bake mesh maps from high-poly sculpt onto low-poly. Normal map format: **OpenGL** (Three.js convention).
- Export as Adobe-preset "glTF PBR Metal-Roughness" → `BaseColor`, `OcclusionRoughnessMetallic` packed, `Normal`, `Emissive`.
- Run through gltf-transform's `textureCompress` to **KTX2 + Basis Universal** (UASTC for normals, ETC1S for color/MR/emissive). Reduces VRAM ~6× vs PNG/JPEG.

### 4.4 File-size budgets (hard gates in CI)

| Asset | Pre-pipeline | Post-pipeline budget | CI failure threshold |
|---|---|---|---|
| Lumi (model + rig + 11 anims + textures) | ~ 12–18 MB | **< 3.0 MB** | 3.5 MB |
| Nón lá accessory | ~ 1 MB | **< 200 KB** | 250 KB |
| Hero scene props total | ~ 5 MB | **< 1.0 MB** | 1.2 MB |
| Each subsequent scene | ~ 8 MB | **< 1.5 MB** | 1.8 MB |
| Total page weight first scene | — | **< 3.0 MB** | 3.5 MB |
| Total page weight all scenes (lazy-loaded) | — | **< 14 MB** | 16 MB |

CI script: `gltf-transform inspect dist/*.glb | jq '.fileSize' | awk '...'` — block PR merge if any GLB exceeds budget.

### 4.5 Cowork-integrated workflow (Adobe + Blender)

Concrete recipes for the team:

1. **Texture variant generation (Photoshop in Cowork):** prompt → "Generate 3 variant base-color maps for Lumi at gold-warm/gold-cool/gold-desat, output 2k WebP, save to `/textures/lumi/variants/`."
2. **Motion reference (After Effects in Cowork):** prompt → "Block out a 4 s Lumi fly-in: arc from (-5, 0, 8) to (0, 0, 0), ease-out-quint, 3 keyframes." AE generates reference render the rigger animates against in Blender.
3. **Blender scripting (Python via Cowork):** prompt → "Write a script that exports every NLA strip as a separate marker so the glTF exporter splits into named clips."
4. **Substance smart-material variants:** Cowork orchestrates Substance Designer node graphs to produce material variants batched.
5. **Asset triage on PR:** Cowork-driven script runs `gltf-transform inspect`, comments on PR with file-size delta, draw-call count, screenshot diff.

---

## 5. Web Implementation Architecture

### 5.1 Framework choice (opinionated)

| Layer | Pick | Why |
|---|---|---|
| Framework | **Next.js 15+ (App Router)** | RSC + streaming + ISR for SEO; built-in image optimization; typed routes |
| 3D renderer | **React Three Fiber 9 + Three.js r184** | R3F 9 pairs with React 19 (Next 15 default). r171+ ships zero-config WebGPU with WebGL2 fallback |
| 3D helpers | **@react-three/drei** | `useGLTF`, `useAnimations`, `<Html>`, `<Detailed>` (LOD), `<Preload>`, `<View />` |
| Persistent canvas | **@14islands/r3f-scroll-rig** | Single `<GlobalCanvas>`, `<UseCanvas>` tunneling, DOM-tracked scenes, smooth-scroll sync |
| Smooth scroll | **Lenis 1.3+** (bundled with r3f-scroll-rig) | Lightweight, accessible, modern successor to locomotive-scroll |
| DOM animation | **GSAP 3 + ScrollTrigger** | Scrub timelines, pinning, named scenes |
| State | **Zustand** for global scene state + **Valtio** *only* if a sub-tree needs proxy-mutated shader uniforms; otherwise Zustand alone | Built by R3F authors; no Provider, hook-based, ~ 1 KB |
| Forms | **react-hook-form + zod** | Smallest, accessible, schema-validated |
| CMS (case studies, blog) | **Sanity.io** | 14islands' V4 stack; structured content for hreflang, ISR-friendly |
| Analytics | **GA4 + Plausible** dual-track | GA4 for brand reporting, Plausible for "we respect EU" signal |

### 5.2 Component architecture

```
app/
├── layout.tsx                    # <SmoothScrollbar/> + <GlobalCanvas/> persistent
├── page.tsx                      # marketing scroll; pure DOM + <UseCanvas> tunnels
├── (lite)/page.tsx               # /lite — Skip-3D fallback (full DOM/SVG)
├── api/
│   ├── lead/route.ts             # form post -> HubSpot
│   └── analytics/route.ts        # server-side event proxy (cookieless)
└── components/
    ├── lumi/
    │   ├── Lumi.tsx              # Drei <useGLTF/> + <useAnimations/> + Zustand-driven anim picker
    │   ├── lumiStore.ts          # Zustand: { currentAnim, position, lookAt, nonlaVisible }
    │   ├── LumiNonla.tsx         # nón lá accessory mesh, parented to hat_socket bone
    │   └── LumiCaptions.tsx      # subtitle-style narration overlay (DOM, NOT Drei <Html>)
    ├── scenes/
    │   ├── Scene0Hero.tsx        # client component, registers UseCanvas
    │   ├── Scene1Origin.tsx
    │   └── ... (one per scene)
    ├── orchestrator/
    │   ├── ScrollOrchestrator.tsx  # GSAP timeline binding to scene progress
    │   └── sceneStore.ts           # Zustand: { activeScene, progress }
    └── ui/
        ├── SkipStoryButton.tsx
        ├── MuteToggle.tsx
        └── CTAHub.tsx              # 3-track conversion fork
```

**Persistent Lumi pattern.** Lumi mounts once at layout level inside `<GlobalCanvas>`, never unmounts between scenes. Scene components use `<UseCanvas>` to push *additional* meshes (props, particles) into the global canvas while in viewport, dispose on unmount. Crucially, **`<GlobalCanvas>` lives outside the router**, so navigation doesn't tear down WebGL context.

### 5.3 Loading strategy

- **Critical-path bundle ≤ 200 KB gz**. Three.js (~ 168 KB gz) is intentionally NOT in critical path; loaded via `next/dynamic({ ssr: false })` after first paint.
- LCP element is the hero **headline text** (DOM), not the canvas. Canvas mounts after `requestIdleCallback` or ~ 500ms after FCP, whichever is first.
- Lumi GLB streams during LCP-to-canvas-mount window via `<link rel="preload" as="fetch" crossorigin>`. Drei's `useGLTF.preload('/lumi.glb')` is called at module load.
- **Decoders:** Draco/Meshopt/KTX2 (WASM) load on-demand from `/decoders/` (locally bundled, not CDN — for offline-dev and CSP). Total ~ 240 KB combined.
- **Suspense boundaries:** one per scene. While a scene's assets stream, Lumi stays interactive on screen.
- **LOD:** use Drei's `<Detailed>` to swap Lumi to a low-poly variant (~ 8k tri) at distance > 12 m (e.g., the globe shot in Scene 5).
- **Preload chaining:** while user reads Scene 2, prefetch Scene 4's GLB (intersection observer, 200% rootMargin).

### 5.4 Audio

Default **muted**. Small `<MuteToggle>` in header (pill, soft-gold accent when active). One ambient pad track (~ 1.2 MB MP3, 96 kbps mono). Lumi voice cues are short SFX, not VO. All audio respects `prefers-reduced-motion`.

### 5.5 Responsive strategy

| Breakpoint | Strategy |
|---|---|
| Desktop ≥ 1280 px | Full 7-scene experience, R3F canvas at `dpr=[1, 1.5]`, particles 100% |
| Tablet 768–1279 px | Same scenes, `dpr=[1, 1.25]`, particles 60%, simpler post-processing |
| Mobile 360–767 px | Compressed scene flow (1+2 merge, 3+4 merge → 5 scenes total), `dpr=[1, 1.5]` capped, no post-processing, lower-poly Lumi (LOD 1), shadow maps off |
| WebGL2 not supported | Auto-redirect to `/lite` (DOM/SVG fallback) |
| Mobile, low-end (effective connection ≤ 3g) | Auto-prompt: "We can show a faster version — switch?" |

### 5.6 Conversion-friendly canvas overlays

DOM CTAs are NEVER drawn inside the canvas. Drei `<Html>` causes pointer-event rabbit holes and a11y regressions. Instead, scenes use **CSS-positioned DOM overlays** that scroll-track-pin alongside `<UseCanvas>` content.

---

## 6. Performance Budgets & Targets

### 6.1 Hard targets (Core Web Vitals 2026)

| Metric | Target | Strategy |
|---|---|---|
| **LCP** | **< 2.5 s** at p75 mobile | Hero headline = LCP element, preloaded font with `font-display: swap`, no lazy-load on hero, AVIF poster fallback for canvas region |
| **INP** | **< 200 ms** at p75 | Yield via `scheduler.yield()` and `scheduler.postTask()`; never block on mesh init; defer non-critical analytics with `requestIdleCallback` |
| **CLS** | **< 0.1** | Reserve canvas dimensions in CSS (`aspect-ratio` or fixed pixel container); explicit width/height on every image; font preloaded |
| **FPS** | **60 fps desktop, ≥ 30 fps mobile** | `useFrame` mutations only (no React state in render loop); `frameloop="demand"` for non-animating scenes |
| **Total initial JS** | **< 200 KB gz** | Code-split `three`, `@react-three/*`, GSAP per-scene; tree-shake; `transpilePackages: ['three']` in next.config |
| **Total page weight first scene** | **< 3.0 MB** | (per asset budgets in §4.4) |
| **Draw calls per scene** | **< 100** at any moment | Instanced meshes for repeated elements; merge static geometry; one material per atlas |

### 6.2 Specific code-level rules (enforced in lint + PR review)

- **No allocations in `useFrame`.** All `Vector3`/`Quaternion` are `useMemo`'d.
- **No React state in render loop.** Use `ref.current` for direct mutation.
- **`dispose()` everything** (geometries, materials, textures, render targets) on unmount.
- **Yield on user interactions:** `await scheduler.yield()` between sync work and navigation.
- **Use Drei `<Detailed>` LOD** for Lumi at all distances.
- **Preload LCP image with `fetchpriority="high"`** on the `/lite` hero.

### 6.3 Mobile / low-end device strategy

- Detect WebGL2 via `gl.getExtension`-probe; if absent → `/lite` route.
- Detect `navigator.connection.saveData` → automatic `/lite` redirect with non-modal banner.
- Detect `navigator.deviceMemory < 4` → use Lumi LOD-1 always, no post-processing, `dpr=[1, 1]`.

---

## 7. Accessibility & Inclusive Design — WCAG 2.2 AA Compliance Plan

### 7.1 The shadow DOM pattern for canvas accessibility

WebGL canvases are opaque to screen readers. We maintain a parallel hidden DOM tree mirroring meaningful canvas content. Each scene renders an `aria-hidden="false"` `<section>` with:
- `<h2>` carrying the scene title (also visible for sighted users)
- A `<p>` carrying Lumi's narration line (visually styled as subtitle, hidden from canvas via CSS `opacity` only — never `display:none`)
- `<button>` elements for any clickable canvas region, absolutely-positioned to overlap the visual hotspot

The `<canvas>` itself: `role="img" aria-labelledby="scene-N-h2 scene-N-narration"`.

### 7.2 Captions and narration

- Every Lumi line shown as **always-visible** caption — gold-on-charcoal, 18px min, 4.5:1 contrast verified.
- Audio cues (if mute is off) honor `prefers-reduced-motion`.
- The narration text is `aria-live="polite"` so updates are announced.

### 7.3 Reduced motion

- `@media (prefers-reduced-motion: reduce)` → swap to **static illustrated journey**: 7 panel SVG/PNG storyboard, identical headlines and narration, no scrubbing, no Lumi animation (still hero pose).
- All GSAP timelines wrapped: `if (!prefersReducedMotion) { tl.scrollTrigger = {...} } else { tl.progress(1) }`.
- Scrolling stays — essential page navigation (per WCAG SC 2.3.3 exempt from "essential function" rules).

### 7.4 Keyboard navigation

- `Tab` lands first on "Skip story", then header, then first scene's title, then through scene CTAs in order, finally footer.
- Each scene has a focus-visible "Next scene ↓" button — keyboard users never need a wheel.
- Focus rings: 2 px gold outline + 2 px offset.

### 7.5 AA criteria checklist

✅ **1.4.3 Contrast** body ≥ 4.5:1, large ≥ 3:1, UI ≥ 3:1  ·  ✅ **1.4.4 Resize 200%**  ·  ✅ **1.4.10 Reflow @ 320px**  ·  ✅ **1.4.11 Non-text Contrast** Lumi rim ≥ 3:1  ·  ✅ **2.1.1 Keyboard**  ·  ✅ **2.2.2 Pause/Stop/Hide** for Lumi idle  ·  ✅ **2.4.7 Focus Visible**  ·  ✅ **2.5.5 Target Size (AAA)** ≥ 44×44  ·  ✅ **2.5.7 Dragging** never required  ·  ✅ **3.3.7 Redundant Entry** forms autofill  ·  ✅ **4.1.3 Status Messages** via `aria-live`

### 7.6 Audit cadence

Pre-launch: full axe DevTools + manual VoiceOver + NVDA. Post-launch: monthly automated axe-core in CI; quarterly manual review. Public **`/accessibility`** page documenting compliance.

---

## 8. SEO, Metadata, Analytics

### 8.1 SSR/SSG strategy

Marketing page = **SSG with ISR (revalidate: 3600)**. The 3D experience is purely client-rendered (`'use client'` + `next/dynamic({ ssr: false })`), but every word of narration and proof is in the server-rendered HTML so Googlebot reads it like any other page.

### 8.2 Schema.org markup

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": "CyberSkill",
  "legalName": "CYBERSKILL SOFTWARE SOLUTIONS CONSULTANCY AND DEVELOPMENT JOINT STOCK COMPANY",
  "alternateName": ["CyberSkill JSC"],
  "url": "https://cyberskill.world",
  "logo": "https://cyberskill.world/logo.svg",
  "image": "https://cyberskill.world/og.jpg",
  "description": "Senior-only Vietnamese software solutions consultancy. We turn your will into real software.",
  "foundingDate": "2020",
  "founder": { "@type": "Person", "name": "Stephen Cheng", "alternateName": "Trịnh Thái Anh" },
  "email": "info@cyberskill.world",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "1st Floor, 207A Nguyen Van Thu Street, Tan Dinh Ward",
    "addressLocality": "Ho Chi Minh City",
    "addressCountry": "VN"
  },
  "identifier": [{ "@type": "PropertyValue", "propertyID": "DUNS", "value": "673219568" }],
  "areaServed": ["United States", "Canada", "European Union", "United Kingdom", "Australia", "Vietnam"],
  "knowsAbout": ["React", "Three.js", "TypeScript", "Node.js", "AI/RAG systems", "Design Systems"]
}
```

Add `Service` schema sub-blocks per capability and `Person` schema for the founder on his bio anchor.

### 8.3 OpenGraph / Twitter / hreflang

- `og:image`: 1200×630 hero render of Lumi against gold-on-brown gradient with slogan baked in (designed for LinkedIn paste).
- Twitter `summary_large_image`.
- `<link rel="alternate" hreflang="en" />` + `hreflang="vi"` + `hreflang="x-default"`.
- `<title>` ≤ 60 chars: "CyberSkill — Turn Your Will Into Real | Senior Software from Vietnam".
- `<meta name="description">` ≤ 158 chars: tight benefit + geographic credibility.

### 8.4 Analytics events

| Event | When | Properties |
|---|---|---|
| `scene_enter` | Scene anchor enters viewport (50%) | `scene_id, time_since_load, scroll_velocity` |
| `lumi_interact` | Click/hover on Lumi | `interaction_type, scene_id` |
| `cta_view` | A CTA enters viewport | `cta_id (book/partner/join)` |
| `cta_click` | A CTA is clicked | `cta_id, scene_id, scroll_depth` |
| `skip_story` | Skip-story button clicked | `scene_at_skip` |
| `lite_redirect` | Auto-redirect to /lite | `reason (no-webgl/save-data/manual)` |
| `mute_toggle` | Mute state changed | `to (on/off)` |
| `form_submit` | Lead form submitted | `track (buy/partner/join), source_scene` |
| `form_error` | Validation failure | `field, error_type` |
| `nonla_easter_egg` | User finds the nón lá hover-reveal | `scene_id` |

GA4 + Plausible dual-pipe via `/api/analytics` server-side proxy (cookieless, GDPR-cleaner).

---

## 9. Conversion & Funnel Design

### 9.1 The three CTA tracks — when each surfaces

**Track 1 — Book a Discovery Call (clients).** Most prominent. Appears: above the fold (Scene 0, primary button), sticky in nav after Scene 3, primary card in Scene 6 hub, footer.

Form: 3-step Calendly-embedded flow. Step 1 — "What kind of help?" (4 chips: new build / modernize / staff aug / not sure). Step 2 — company + role + email + timezone. Step 3 — pick a slot. Lumi reacts on each step (`mouth_smile` on step 2, `summon` on submit).

**Track 2 — Partner With Us (agencies).** Appears: sticky nav (secondary), Scene 5 (Vietnam→Global) as collaborate card, Scene 6 hub, footer.

Form: 4-field HubSpot-integrated (agency name, country, monthly capacity needed, brief). Auto-routes to a partner-track deal stage in HubSpot CRM.

**Track 3 — Join the Team (talent).** Appears: Scene 4 (team) as discreet "We're hiring" link with Lumi `point` animation, Scene 6 hub, footer, persistent "We're hiring 3" badge in footer (auto-updated from your ATS).

Form: Simple — name, email, role of interest (dropdown), GitHub/portfolio URL, optional cover.

### 9.2 Trust signals for global buyers

A dedicated **"Why us, why Vietnam"** sub-section in Scene 5:
- DUNS **673219568** (linked to D&B verification — clickable, opens in new tab)
- Founded **2020** — established but not legacy
- 10 senior-only engineers (no juniors → no bait-and-switch)
- 2 active long-term enterprise engagements (anonymized count if NDA, named if not)
- **Time-zone honesty:** small live-clock widget showing HCMC time + your zone, with overlap windows highlighted ("4 hours of overlap with London afternoon")
- **GDPR-ready** privacy practices, **NDAs standard**, **IP transfer clauses pre-drafted**
- (Future) ISO 27001 / SOC 2 Type II badges as you achieve them — leave reserved space

Critically, do *not* lead with cost. Vietnamese outsourcing is well-known globally now; leading with cost makes you indistinguishable from FPT's pricing. Lead with **craft + senior team + time-zone honesty** — what the larger firms can't credibly say at small-team intimacy.

### 9.3 Social proof placement

- **Logos strip** in Scene 3, grayscale-on-dark, 6 logos max — anonymized as "industry: fintech / healthtech" if NDA.
- **Pull-quote testimonials** woven into Scene 2 — 1 per scene moment.
- **Case-study deep links** in footer, opening as Sanity-CMS-driven sub-routes (`/work/<slug>`).

---

## 10. Phased Delivery Roadmap (summary)

**Total: ~ 18 weeks to public launch, plus ongoing post-launch.**

| Phase | Weeks | Key outputs | Gate |
|---|---|---|---|
| **P0 — Discovery, Narrative, Character** | 1–2 | Approved script, Lumi character sheet, mood boards | Founder signoff |
| **P1 — DS Extension + Storyboards + Greybox** | 3–5 | `@cyberskill/ds-cinematic` skeleton, 7 Figma comps, Blender greybox of all scenes | Design + tech-feasibility signoff |
| **P2 — Lumi Modeling, Rigging, Animation** | 6–9 (parallel with P3) | Final mesh ≤ 40k tri, custom rig + 11 anims, PBR textures, optimized GLB ≤ 3 MB | GLB passes CI gate + visual review |
| **P3 — Web Foundation + Scene 0 Polished** | 6–8 (parallel) | Next 15 monorepo, GlobalCanvas + Lenis + ScrollOrchestrator skeleton, Scene 0 polished, CI gates, /lite stub | Scene 0 ships to staging, Lighthouse 95+, axe-clean |
| **P4 — Scenes 1–6 Build-out + Choreography** | 9–12 | All 7 scenes scroll-choreographed; CTA hub with 3 forms wired; CMS integration; analytics events | Internal demo runs end-to-end without bugs |
| **P5 — Performance, A11y, QA, Localization** | 13–14 | All CWV at target on p75 mobile; axe + manual VO/NVDA clean; cross-browser tested; VI localization | Founder + DPO sign-off |
| **P6 — Soft Launch, Iteration** | 15+ | Soft launch, awards submission, ad campaigns, A/B testing | Ongoing |

> **Soft proof-of-concept moment:** end of week 8, share the Scene 0-only live URL with a small set of trusted partners and recruits.

> **Detailed task breakdown** (~ 165 tasks with IDs, owners, dependencies, acceptance criteria) lives in companion document `02-task-breakdown.md`.

### 10.1 Role assignments for the 10-person team

| Role | Headcount | Primary responsibility |
|---|---|---|
| Founder / Creative Director | 1 (Stephen) | Narrative, brand voice, signoffs |
| Frontend Lead / R3F Architect | 1 | Architecture, perf, R3F scaffolding |
| R3F Developer | 1 | Scene implementations, shader work |
| Frontend Developer | 1 | DOM, forms, CMS, analytics |
| Designer (Art Director) | 1 | Figma scene comps, design system extension, Lumi character sheet |
| 3D Modeler / Texture Artist | 1 | Lumi + scene props, Substance texturing, optimization |
| 3D Rigger / Animator | 1 | Custom armature, animation library, shape keys |
| QA / Accessibility | 1 | Cross-browser, axe, manual a11y, performance audits |
| Backend / DevOps | 1 | API routes, CI/CD, gltf-transform pipeline, file-size gates, HubSpot/Calendly |
| Content / Copywriter | 1 | Script, microcopy, captions, EN/VI, SEO content |

A 10-person team is tight for this scope; expect each person to wear 1.5 hats.

### 10.2 Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Lumi GLB exceeds 3 MB after texture authoring | High | High | Hard CI gate; weekly file-size review starting Phase 2 day 1 |
| Scroll choreography janky on mid-range Android | Medium | High | Test on Pixel 6a, Galaxy A54 every Friday from Phase 4 |
| Rigify produces broken morph targets | Eliminated | — | Custom armature decision (see §3.3) |
| WebGPU adoption forces hybrid path | Low | Low | r3f auto-fallback (try WebGPU, catch → WebGL2) |
| Buyer audience finds experience "too much" | Medium | High | Always-visible Skip Story; /lite auto-promoted on save-data; A/B test hero CTA prominence |
| Vietnamese cultural reading misfires globally | Low (nón lá is clear) | Medium | Usability test with 5 NA buyers in Phase 5; nón lá is unambiguous |
| Talent attrition mid-project | Medium | High | Cross-train R3F across at least 2 devs from week 1; document in Notion |
| Time-zone-overlap claim challenged by buyer | Low | Medium | Live-clock widget makes claim falsifiable & honest |

---

## 11. Cowork + Adobe + Blender Workflow

### 11.1 Concrete Cowork recipes

- **Recipe A — Asset triage on PR.** Cowork agent: "Run gltf-transform inspect on every .glb in /public, post markdown table to PR #N with size, delta vs main, draw-call estimate. If any asset exceeds budget in /budgets.json, fail PR check."
- **Recipe B — Texture variant batch (Photoshop).** "For texture `lumi_basecolor_2k.png`, output 3 variants — gold-warm, gold-cool, gold-desat — using Hue/Saturation (+10/0/-15), save WebP q80 to `/textures/lumi/variants/`."
- **Recipe C — Motion previs (After Effects).** "Generate a 4 s motion graphic of a wisp ribbon flying off-screen-left to scene center, ease-out-quint, 30 fps, 1080p, save MP4 to `/refs/lumi-flyin-v3.mp4`."
- **Recipe D — Blender Python automation.** "Write a Blender 4.4 script that exports each NLA strip in active armature as a separate glTF animation, with strip name as animation name."
- **Recipe E — Substance node graph variant.** "In Substance Designer, generate 3 variants of the gold-iridescent material with edge-wear factors 0.0 / 0.4 / 0.8."
- **Recipe F — Async review brief.** "Summarize the changes in PR #N for team Slack: what shipped, what regressed, what needs eyes."
- **Recipe G — Nón lá variant generation.** "Generate 3 nón lá texture variants — pristine, weathered, sunset-lit — for use as Easter-egg hover states. Output 512×512 WebP."

### 11.2 Asset versioning & file structure

```
/cyberskill-marketing-site
├── /apps/web                       # Next.js app
├── /packages/ds-cinematic          # extension package
├── /assets-source                  # NOT shipped to web — Blender/PSD/SBS source
│   ├── /blender
│   │   ├── lumi.v07.blend          # SemVer-style versioning
│   │   ├── lumi-nonla.v02.blend
│   │   └── scenes/scene-N-XX.vNN.blend
│   ├── /substance
│   └── /aftereffects
├── /assets-built                   # gltf-transform output, gitignored, rebuilt by CI
│   ├── /raw                        # exporter output
│   └── /optimized                  # post-pipeline (this is what /public consumes)
├── /public/models, /public/textures, /public/decoders
└── /scripts/gltf-pipeline.mjs
```

Blend files use Git LFS. `/assets-source/manifest.json` lockfile for source dependencies.

### 11.3 Async review across the remote team

- **Daily 15-min standup** (HCMC 9:00). Recorded.
- **Async PR review** — auto-generated screenshot diff, gltf-transform inspect comment, Lighthouse delta.
- **Weekly "Lumi Lab"** — 30 min, all-hands creative review.
- **Notion** for design-system spec; **Figma** for mocks; **GitHub** for code-of-record; **Slack** for everyday; **Loom** for any visual explainer > 60 sec.

---

## 12. Governance, Maintenance, Evolution

### 12.1 Component lifecycle (marketing version)

Cinematic Pack obeys your existing DS Component Lifecycle, with marketing-specific stages:
- **Experimental** (Phase 1–4): only used on this site, no docs
- **Stable** (post-launch + 4 weeks bug-clean): docs published; reusable on /work case-study pages
- **Promoted** (after 6 months stable + 2nd consumer): folded into core foundations
- **Deprecated** (when a successor lands): 90-day sunset

### 12.2 Update cadence & A/B testing

- **Monthly:** review analytics, top 3 funnel leak points; ship one A/B test per month.
- **Quarterly:** content refresh (new case study, refreshed metrics, swap one scene art-direction variant).
- **Seasonally:** Lumi variants — Tết (red lacquer trim on hood), Mid-Autumn (lantern accessory), brand anniversary. Limit to non-disruptive cosmetic changes (texture/mesh swap), keep rig identical.

### 12.3 Evolving Lumi

- **New animations** (target 1 per quarter): "thinking", "presenting", "celebrating" — each ≤ 3 s, integrated via NLA, file-size delta < 200 KB.
- **Vertical packs** (Year 2): Lumi specialized for fintech (data-stream wisps), healthtech (cool-toned palette), AI agencies (pulsing-neuron tail). Each as a *theme*, not a separate model — same GLB + variant texture/material kit.

### 12.4 Marketing system docs site

Stand up `system.cyberskill.world` — Storybook 8 + Astro for docs. Houses Cinematic Pack tokens, Lumi character bible, scene art direction archive, performance budgets (live, fed by CI), accessibility statement, component lifecycle status board. Doubles as recruiting + partner-credibility asset.

---

## 13. References & Inspiration

### 13.1 Specific award-winning sites to study

| Site | Award | Take this lesson |
|---|---|---|
| **Igloo Inc. (abeto)** | Awwwards SOTY 2024 + Developer Site of the Year | Combining immersive 3D with frictionless scroll nav — *exactly* our target |
| **Messenger** | Awwwards SOTY 2025 | Miniature WebGL world with delivery character — proof a "cute character with a job" can win |
| **Lando Norris** (OFF+BRAND) | Awwwards SOTY 2025 | Webflow + WebGL + Rive proves you can win SOTY without a custom engine |
| **Lusion v3** | Awwwards SOTY 2023 | Custom-baked Houdini sims & matcaps; studio-website-as-portfolio |
| **Don't Board Me** | Awwwards SOTY 2024 | Brand-personality with editorial restraint |
| **Bruno Simon Portfolio** | Awwwards SOTM Jan 2026 | Personal voice + spatial audio + Easter eggs |
| **Active Theory — Spotify Wrapped** | Multiple FWAs | Render-target dynamic typography on 3D models |
| **Active Theory — The Field** | FWA | Volumetric particle shadows + branching narrative |
| **Immersive Garden V4** | Agency 2024 | gltf-transform automation + custom Blender scripts |
| **14islands V4** | Sanity case + scroll-rig authors | Progressive-enhancement WebGL pattern |
| **Resn — Pioneer** | FWA | Brand-tone weirdness as positioning |
| **Opal Tadpole** | Awwwards e-com 2024 | Product storytelling with surgical 3D |
| **NUSSLI 3D Canvas** | SOTD Sep 2025 | Industrial buyer audience — *closer to our reality* than most SOTYs |
| **Heidelberg CCUS** | SOTD Sep 2025 | Enterprise sustainability storytelling — relevant template |

### 13.2 Recommended libraries (versions current May 2026)

```
next@^15.x  react@^19  three@^0.184  @react-three/fiber@^9
@react-three/drei@latest  @14islands/r3f-scroll-rig@^8.15
gsap@^3  lenis@^1.3  zustand@latest  valtio@^2
react-hook-form@^7  zod@^3
@gltf-transform/core @gltf-transform/extensions @gltf-transform/functions
sharp draco3dgltf
```

**Authoring:** Blender 4.4 LTS, glTF-Blender-IO, Auto-Rig Pro (paid, optional), Adobe Substance 3D Painter & Designer, Adobe Photoshop/Illustrator/After Effects/Premiere Pro (Cowork-integrated), gltfpack, gltf.report.

**Perf/monitoring:** Lighthouse CI, stats-gl, web-vitals, WebPageTest Pro.

**A11y:** axe-core, @axe-core/playwright, NVDA, VoiceOver.

### 13.3 Recommended reading

- glTF 2.0 spec (KhronosGroup) — Animation, Skin, Morph Target sections cover-to-cover before rigging Lumi.
- Three.js Migration Guide (mrdoob/three.js wiki).
- R3F docs at r3f.docs.pmnd.rs — Performance and Concurrency sections.
- Drei docs at drei.docs.pmnd.rs.
- "100 Three.js Tips That Actually Improve Performance (2026)" — Utsubo blog.
- "What's New in Three.js (2026)" — Utsubo (WebGPU production-readiness).
- Bruno Simon's Three.js Journey course; Wawa Sensei's R3F course.
- glTF-Transform docs at gltf-transform.dev.
- Immersive Garden, Lusion, Igloo Inc. case studies on Awwwards.
- Active Theory's Medium publication.
- WCAG 2.2 at w3.org/TR/WCAG22.
- web.dev Core Web Vitals reference.

---

## Caveats

1. **The toolchain moves fast.** R3F 9 / React 19 / Three r184 are current as of May 2026; minor version drift will require updates. The architecture is stable; verify versions in §13.2 at project kickoff.
2. **WebGPU is production-ready but not universal.** Three.js r171+ ships zero-config WebGPU with WebGL2 fallback. Design for WebGL2 floor; let WebGPU be a free perf upgrade.
3. **Cultural reading is never guaranteed.** The nón lá is the clearest possible Vietnamese signal; usability testing with 5–8 NA/EU buyers in Phase 5 confirms it lands.
4. **Budgets are aggressive but achievable.** Igloo Inc. operates in this envelope. Enforce from day 1 via CI gates — letting them drift to "we'll optimize at the end" has historically killed similar projects industry-wide.
5. **Awwwards / FWA is a downstream artifact, not the metric.** The metric is qualified discovery calls, partner inquiries, senior recruits. Awards are credibility for global B2B trust signaling.
6. **18 weeks assumes the 10-person team is full-strength.** Tết, holidays, client work — communicate 22-week external commitment, work to 18-week internal.
7. **Substance Painter is now Adobe-subscription-only.** Budget for it — it pays for itself in iteration speed.
8. **One external specialist on retainer.** A senior R3F freelancer (5–10 hrs/week through Phases 3–4), particularly someone with shipped Awwwards-recognized work. Best money you'll spend on this project.
9. **This master plan is opinionated.** Custom rig over Rigify; Zustand over Jotai; Lenis over Locomotive; soft-name "Lumi"; gold-on-brown only; no scroll-jacking — choices made under uncertainty. Their value is forcing decisions early and together, not ratifying specific choices.

— *Plan v2 prepared for Stephen Cheng (Trịnh Thái Anh), Founder, CyberSkill JSC. May 2026.*
