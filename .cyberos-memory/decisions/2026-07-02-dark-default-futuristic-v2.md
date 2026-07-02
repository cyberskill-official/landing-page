# DEC: Dark is the default theme; art direction moves to a gold HUD language

- Date: 2026-07-02
- Status: accepted
- Modules: DS, CMS, WEB
- Deciders: Stephen Cheng (direction), CyberOS agent (implementation)

## Context

After the FR-DS-011 motion pass, Stephen reviewed and directed: Vietnamese
headings render with a font bug, the Vietnamese copy reads like translation,
default the site to dark, and push the design past a "$50k" bar - more
creative, more futuristic. The font bug's root cause: the display stack was
system serifs (Iowan Old Style/Palatino) with no Vietnamese coverage, so VN
diacritics fell back per-glyph to a second typeface.

## Decision

1. Display typography moves to Space Grotesk via next/font/google with the
   explicit `vietnamese` subset (FR-DS-008): build-verified coverage,
   self-hosted at build time, keyless, swap with size-adjusted fallback.
   One face now carries EN and VN identically, and its geometric grotesk
   voice is the backbone of the futuristic direction.
2. Dark becomes the SSR default theme. The gold-on-umber look is the
   brand-defining state (the aurora, the gilded slogan word, the HUD
   details all read strongest on dark); light remains one toggle away and
   any stored preference still wins before first paint.
3. The art direction adopts a precision "gold HUD" language (FR-DS-012):
   blueprint grid, monospace coordinates row, ghost section indices,
   orbiting conic card borders, gilded final slogan word, tilted marquee,
   scrolled-header hairline, breathing hero CTA. Everything stays
   CSS/pseudo-element, transform/opacity-only, guarded for reduced motion,
   forced colors, and print.
4. All Vietnamese strings were rewritten to read as written-in-Vietnamese,
   and the slogan now uses the brand-exact DESIGN.md casing ("Hiện Thực Hoá
   Ý Chí"). FR-CMS-003 (native review) deliberately stays open - this pass
   raises the floor, a native speaker still owns the final word.

## Consequences

- The a11y and Lighthouse gates now exercise the dark theme by default,
  which is the stricter direction for the muted-text contrast fix from
  FR-DS-006.
- Font transfer adds ~35KB of self-hosted woff2 (well inside the 120KB
  hard font budget); no runtime third-party requests were added.
- The SocialProof fallback heading no longer duplicates the Process
  heading on the home page ("What we stand behind" / "Điều chúng tôi cam
  kết").

## Related

[[FR-DS-008-typography-vietnamese]] [[FR-DS-011-motion-polish]]
[[FR-DS-012-futuristic-art-direction]] [[2026-07-02-motion-polish-layer]]
