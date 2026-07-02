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
