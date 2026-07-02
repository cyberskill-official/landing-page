# Auto-work run - 2026-07-02 - branch auto/motion-polish

Branch off `origin/main` (f7e2ebb). One FR (FR-DS-011), built as a premium
motion-polish pass over the existing structure and content - no redesign, no
new dependencies. Not merged, not deployed; awaiting review (the only fork).

## Ledger

DONE
- FR-DS-011 premium motion-polish layer, all requested effects plus tasteful
  extras:
  - Aurora backdrop (brand gold/umber) behind the hero and contact sections:
    `components/motion/Aurora.tsx` + pre-blurred radial blobs on transform
    drift (no runtime filter), both themes, clipped per section.
  - Kinetic masked hero headline: per-word overflow-mask rise with stagger +
    continuous travelling gold shimmer (background-clip: text). Full slogan
    stays the H1 accessible name via aria-label; words are real SSR text;
    reduced motion renders the static headline; forced-colors/print restore
    plain fills. EN/VN verified (diacritics clear the masks via padding
    compensation).
  - Custom cursor (1:1 gold dot + lerped ring + soft spotlight glow),
    magnetic CTAs (`.cs-btn`, theme toggle), and 3D card tilt
    (service/work/proof cards) in one manager
    (`components/motion/MotionExtras.tsx`): fine-pointer + hover + motion
    allowed only, live attach/detach on media-query change, hidden over text
    fields, transform-only, aria-hidden.
  - First-visit intro veil (`components/motion/IntroVeil.tsx`): Lumi orb +
    localized slogan resolving into the hero; armed once per session by an
    inline pre-paint script; skipped under reduced motion and without JS;
    pure-CSS timeline whose forwards fill guarantees dismissal;
    pointer-events none (cannot trap anything); hero word delays hand off
    from the veil.
  - Kinetic keyword marquee (`components/sections/Marquee.tsx`): bilingual
    keyword band between ValueProp and Services, seamless -50% CSS loop,
    hover pause, aria-hidden (Services below carries the real content),
    static under reduced motion.
  - Thin gold scroll-progress bar (mirrors scroll 1:1, stays for
    reduced-motion/touch), masked + staggered section-heading reveals
    ([data-mask-reveal], shows-only observer, scripting:none and
    reduced-motion force-show), animated nav/footer link underlines, button
    hover shine, gold ::selection, animated scroll-hint thread under the
    hero hint.
  - Skip-link tuck: top -3rem left a ~2px black sliver visible over the
    header (z-index 1000, pre-existing on prod in every screenshot); now
    -4rem, focus behaviour unchanged.
- Docs: FR-DS-011 file, BACKLOG row + totals re-baselined against FR status
  fields (58 shipped / 1 hold / 35 planned = 94; the table had drifted from
  the prose), decision record 2026-07-02-motion-polish-layer, this ledger,
  awh promotion + evolution rows.
- Tests: +8 (tests/motion-polish.test.ts - slogan word-split EN/VN incl.
  diacritics, clamp, magnetic cap + degenerate sizes, tilt centre/edges, Hero
  aria-label + mask-count contract, marquee doubling + aria-hidden, veil
  aria-hidden + localized slogan). tests/axe.test.ts now composes Marquee +
  IntroVeil into the jsdom axe run.

FOUND + FIXED IN-SESSION (screenshot round, before any push)
- Shimmer coverage bug: background-position outside 0-100% (125%/-25%) with
  background-size 250% + no-repeat left parts of each glyph unpainted -
  the slogan visibly clipped ("Tur", "Wi", "Hiệ") in every theme and in the
  reduced-motion fallback. Fixed by clamping the sweep to 0-100% (band parks
  just off-glyph at both ends); constraint documented in globals.css.

DEFERRED
- Lumi GLB untouched (FR-CHAR-021/022 hold - human-owned, per scope).
- Cursor/tilt on sub-pages work but mask-reveal attributes were scoped to the
  home sections; sub-page headings keep the existing Reveal behaviour.
- Live Lighthouse run against a deployed preview (CI's lighthouse job covers
  the built site per push; CLS budget is the hard gate).

## Evidence (Mac gate, 2026-07-02, all EXIT=0)

- `npm run typecheck` clean; `npm test` 16 files / 60 tests (52 -> 60);
  `npm run lint` clean; `npm run build` Compiled successfully, 26/26 static
  pages, First Load JS shared 175 kB; `npm run check:assets` OK - client JS
  2363KB < 2800KB budget, public/ 95KB < 600KB.
- Served-route axe (jsdom over `next start` SSR HTML, wcag2a/aa,
  color-contrast deferred to the CI Chrome job): /en 0 violations,
  /vi 0 violations.
- Visual QA (puppeteer + OS Chrome, viewport 1440x900): round 1 captured the
  reduced-motion fallbacks (host has OS Reduce Motion on - static headline,
  no veil, no cursor: gating proven) and exposed the shimmer coverage bug;
  round 2 (emulated no-preference) verified veil -> hero handoff, word rise,
  shimmer sweep, cursor dot + magnetic CTA offset, spotlight glow, marquee
  glide, ~30% progress bar at the marquee, dark-theme aurora, VN diacritics
  intact.

## Suitable next steps

- Review + merge auto/motion-polish to main (auto-deploys cyberskill.world);
  watch Vercel Speed Insights CLS/LCP for a day after.
- Consider extending [data-mask-reveal] to /work and /careers headings.
- The still-parked forks from earlier runs (Lumi GLB, real testimonials,
  Vietnamese native review) are unchanged.

---

# Round 2 - 2026-07-02 - futuristic v2 on the same branch

Operator review of round 1: VN font bugged, VN copy reads translated,
default should be dark, and the design should push past a "$50k" bar -
more creative, more futuristic. Round 2 ships FR-DS-008 + FR-DS-012 on
top of FR-DS-011.

## Ledger

DONE
- FR-DS-008 Vietnamese-complete typography: Space Grotesk via
  next/font/google, `subsets: ["latin", "vietnamese"]` (build fails if the
  subset were absent - coverage is build-verified), self-hosted woff2,
  swap + size-adjusted fallback. Root cause of the reported bug: the old
  display stack (Iowan Old Style/Palatino) has no VN diacritics, so VN
  headings mixed typefaces per-glyph. Display scale retuned for the
  grotesk (h1 700/-0.03em/1.02, 4xl up to 5.6rem); new --cs-font-mono
  token.
- Dark default (SSR data-theme="dark"); stored light preference still wins
  pre-paint. Decision record 2026-07-02-dark-default-futuristic-v2.
- FR-DS-012 gold HUD language: blueprint grid behind the hero (radial
  fade mask), monospace micro-meta row (coordinates, city, EN/VI), ghost
  section indices via CSS counters (`content: ... / ""` stays silent for
  AT), orbiting conic gold border on card hover (@property angle, static
  ring without support), gilded final slogan word ("Real" / "Chí") in
  per-theme gold ramps, marquee tilted -1.2deg, gold hairline under the
  scrolled header, breathing halo on the hero primary CTA.
- Vietnamese copy rewritten across dictionaries.ts, site.ts (services,
  values, work cards, commitments, all six scenes), Process, Faq,
  StoryArc, hero lead, locale metadata description. Slogan now brand-exact
  "Hiện Thực Hoá Ý Chí" (DESIGN.md casing). Duplicate home heading fixed:
  SocialProof no-quotes fallback is now "What we stand behind" / "Điều
  chúng tôi cam kết" (was a second "How we work").

DEFERRED
- FR-CMS-003 Vietnamese native review stays planned: this pass is
  agent-quality; a native speaker owns the final word.
- Case-study detail body copy (work/[slug]) got only the shared card
  strings; deep body text untouched.

## Evidence (Mac gate, 2026-07-02, all EXIT=0)

- tsc; vitest 16 files / 60 tests (VN slogan-casing expectation updated);
  lint; build 26/26 pages, First Load JS shared 175 kB (fonts land in
  .next/static/media, ~35KB woff2, inside the 120KB hard font budget);
  check:assets client JS 2364KB < 2800KB; served-route jsdom axe 0
  violations on /en + /vi (now exercising the dark default).
- Visual QA (puppeteer, motion-on): dark hero with gold "Real", VN hero
  "Hiện Thực Hoá Ý Chí" fully uniform diacritics, orbit border + cursor +
  spotlight on card hover with ghost "03" index, tilted marquee, light
  theme coherent, VN story section reading native.

---

# Round 3 - 2026-07-02 - Lumi becomes a living mascot (FR-CHAR-030)

Operator review of round 2: still not enough motion/3D, and "Lumi not a
static chat popup button - a living mascot that can move/fly and
interact/make magic within the website."

## Ledger

DONE
- Architectural unlock: the sections are opaque, so the old behind-content
  canvas made Lumi invisible past the hero - that is WHY it felt static.
  The live scene now rides ABOVE the content (cs-canvas-live, z-30,
  pointer-events:none, aria-hidden); the static poster path keeps the old
  layering on mobile/incapable devices.
- Full-page flight (lib/scene/journey.ts, pure + 10 unit tests): a ROUTE of
  per-section viewport anchors weaving page sides, measured against the
  real DOM (re-measured on resize/layout), smoothstepped between stops,
  swoop bows per leg, velocity banking, idle bobbing. Fixed camera with
  pointer parallax makes the anchor->world mapping deterministic
  (viewportToWorld) - the old scroll-driven camera stops in progressMap
  are no longer consumed (spin/glow/light stops still are).
- Living behaviours: comet Trail (drei, tracks a rig anchor so rig scale
  cannot distort it), mascot-scoped pixie-dust Sparkles, BurstField (3
  pooled additive point bursts) firing at section arrivals, on hover
  excitement, on chat open/close, and on lead-form success (LeadForm
  dispatches cs:wish-granted); while the chat is open Lumi leaves the
  route and attends the panel (CHAT_ANCHOR).
- Lumi IS the chat entry (components/canvas/LumiHotspot.tsx): a real
  focusable button with aria-label + dialog popup semantics rides the
  mascot's projected screen rect every frame (module store, no React
  re-render per frame), opens the chat via the existing GENIE_OPEN_EVENT,
  excites Lumi on hover/focus, hides while the chat is open / on touch /
  when the scene is unmounted. Core-sized and capped (r <= 190px) so it
  never blankets text.
- More 3D + motion: WishGrid - a CPU-waved gold wireframe floor under the
  hero that fades out with hero progress (never overlays sections); hero
  aurora scroll parallax via a --cs-scroll CSS length (MotionExtras) under
  prefers-reduced-motion: no-preference; the StoryArc timeline line now
  draws itself in ([data-line-reveal], shares the shows-only observer).
- Composition pass after first WebGL captures: hero anchor moved clear of
  the headline (vx .82, scale .72), side anchors into the gutters, chat
  anchor above the panel, hotspot radius core-sized, trail shortened
  (width .45 / length 3.5 / decay 3), grid subtler and lower, dust cloud
  tightened.

FOUND + FIXED IN-SESSION
- The old puppeteer harness (headless shell + --use-gl=swiftshader) never
  created a WebGL context: the 3D layer was silently absent from EVERY
  earlier screenshot round. New headless + --use-angle=swiftshader renders
  it; probes now assert the scene mounted, the hotspot tracked (rect
  258px), and clicking the mascot opened the chat (chatOpen:true).
- three 0.184 JSX generics: <points> ref needed a cast
  (NormalOrGLBufferAttributes vs THREE.Points default).

DEFERRED
- The commissioned GLB (FR-CHAR-021/022) still replaces the procedural
  body when it lands - the rig carries whichever model renders.
- GltfLumi's own idle offsets were left untouched (env-gated path, unused
  by default); re-check its local position when the real model arrives.
- Touch devices keep the static poster + button CTAs (no mascot).

---

# Round 4 - 2026-07-02 - section signatures, Lumi-first conversion
# (FR-DS-013 + FR-CHAR-031)

Operator review of round 3: sections still static ("each section needs a
WOW"), the Talk-to-Lumi CTAs are redundant next to the clickable mascot,
and the contact form is "the old way - integrate it into Lumi".

## Ledger

DONE
- FR-DS-013 section signature motion: TrustBand stat pop + gold ignition,
  StoryArc node ignition riding the line draw, levitating ValueProp cards,
  Services reveal scan-band, Process gold circuit + sequential index
  charge, Work HUD viewfinder brackets on hover, SocialProof paper tilt,
  FAQ breathing answers + rotating marker, Careers aurora. One observer
  now serves data-mask-reveal / data-line-reveal / data-pop.
- FR-CHAR-031 wish flow: pure keyless state machine (lib/genie/wishFlow.ts,
  4 unit tests) collecting name -> email -> company? -> wish? -> explicit
  consent in the chat with quick-reply chips, validating via the shared
  leadSchema, POSTing the exact /api/lead payload (source lumi-chat),
  celebrating via the wish-granted burst. AI conversation unchanged; the
  flow works while the AI proxy is down.
- Lumi-first contact: the section leads with a breathing "Grant it with
  Lumi" launcher; the classic form folds behind native details/summary
  (still works without JS); form card hugs its summary when folded.
- CTA dedup: CanvasMount publishes html[data-lumi-live]; the hero and
  persistent Talk-to-Lumi buttons (.cs-lumi-alt) hide while the mascot is
  on stage and remain on devices without it; the header launcher stays
  everywhere as the constant accessible entry. A one-time mono hint chip
  ("Click me") rides under Lumi per session.
- New analytics event wish_flow_started (client union + /api/analytics
  allowlist).

HONESTY
- FR-CHAR-026 (value-first, ICP-adaptive capture) stays planned: FR-CHAR-031
  is its deterministic foundation; the adaptive layer needs the AI path and
  Stephen's qualification criteria (down-payment noted in its §3).

## Evidence (Mac gate, 2026-07-02, all EXIT=0)

- tsc; vitest 18 files / 74 tests (+4 wish-flow); lint; build 26/26;
  check:assets; served-route jsdom axe 0 violations /en + /vi.
- Automated end-to-end probes on the served build, all green in one run:
  WISH_PROBE done:true (mascot click -> start chip -> name -> email ->
  skip -> skip -> consent -> real /api/lead 200 -> "the wish is on its
  way" bubble); CONTACT_PROBE lumiCta:true, form folded, hero duplicate
  CTA display:none under data-lumi-live; ARM/CHAT/PASSTHROUGH/CLICKTHROUGH
  from round 3b all still green.

## Evidence (Mac gate, 2026-07-02, all EXIT=0)

- tsc; vitest 17 files / 70 tests (10 new in tests/journey.test.ts); lint;
  build 26/26 pages, First Load JS shared 175 kB (mascot code rides the
  async 3D chunk); check:assets; served-route jsdom axe 0 violations /en +
  /vi.
- WebGL visual QA (new headless + ANGLE): hero scene (Lumi + wire floor
  clear of type), mascot at services' left gutter, hover excitement, click
  -> chat open with Lumi attending the panel, contact-form seam hover, VN
  story with the drawn timeline. Probes: SCENE live:true, hotspot
  visible:true rect 258px, CHAT chatOpen:true.

## Round 3b - input-blocking fix (operator: "Lumi blocks all other
## background interactives")

- ROOT CAUSE 1 (the big one): r3f's <canvas> takes pointer events itself,
  overriding the wrapper's pointer-events:none - above the content at z-30
  it swallowed every click on the page (probe: elementFromPoint over the
  careers CTA returned CANVAS). Fixed: `.cs-canvas-layer, .cs-canvas-layer
  *` forced inert with !important; gaze/camera-parallax pointer input now
  comes from a window listener (mascot.ts pointerNorm) consumed by
  GenieScene/LumiPlaceholder/GltfLumi instead of r3f state.pointer.
- ROOT CAUSE 2: the hotspot button blanketed whatever Lumi hovered. Fixed:
  pointer-transparent by default, arming per frame only when the pointer is
  on Lumi AND nothing interactive lies beneath (elementsFromPoint, skipping
  itself - a naive elementFromPoint saw the armed button and oscillated).
- Probes, all green in ONE run: ARM active:true on empty space; mascot
  click -> chatOpen:true; over the careers CTA the hotspot stays inactive,
  the hit test resolves A.cs-btn.cs-btn-brand, and CLICKING NAVIGATES to
  /en/careers through the layer. Full gate green again (70 tests).
- GltfLumi also localised (BASE_POSITION x 1.3 -> 0) so the commissioned
  model rides the rig correctly when it lands.
