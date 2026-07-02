# CyberSkill landing page — audit + art-grade roadmap

Audited live (cyberskill.world, EN + VI) and against the codebase, 2026-07.

## What is already strong (keep)

- Confident dark gold art direction (Umber/Ochre), consistent tokens, liquid-glass surfaces.
- The 3D Lumi mascot that flies a scroll journey, plus premium bloom/AgX and the mobile poster.
- Real motion craft already shipped: kinetic per-word headings, custom cursor + magnetic CTAs + card tilt, reveals, marquee, aurora, big faint section numerals, HUD meta details.
- Honest, non-hypey copy; bilingual EN/VI in sync (typed); good a11y guards and a real perf budget.

The bones are strong. The gap is that the middle of the page is one visual idea repeated: text cards.

## Issues to fix

| Sev | Issue | Where |
|---|---|---|
| High | "Selected Work" has no visuals at all, and the items are invented categories (Logistics/Education/Retail) with no real client, screen, or metric. Undersells a software studio. | `components/sections/WorkPreview.tsx`, `lib/content/site.ts` work[] |
| High | Nav "Team" / "Đội ngũ" promises people but jumps to a block with no actual team (bios/faces). | `SiteHeader.tsx`, `#proof` block |
| Med | Un-localized English aria-labels on the VI site (a11y/i18n gap). | `PersistentCta.tsx:12`, `SiteHeader.tsx:15,20`, `LanguageSwitcher.tsx:26` |
| Med | Mascot drifts over body text on the right at some scroll depths; can obscure content. | `lib/scene/journey.ts` right-side anchors (vx 0.9-0.94) |
| Med | Copy fragmented across 3 sources (dictionary, content/site.ts, inline ternaries) — easy to miss in a rewrite/translation. | `Hero.tsx`, `Process.tsx`, `Faq.tsx`, `StoryArc.tsx`, etc. |
| Low | Weak, category-generic hero eyebrow ("Software solutions consultancy, since 2020"). | `dictionaries.ts` hero.eyebrow |
| Low | DUNS number shown as public body copy in the footer. | `SiteFooter.tsx`, `site.ts` |
| Low | Theme toggle reads a "light" default that can never match the hardcoded dark default (dead branch). | `ThemeToggle.tsx:15` vs `layout.tsx:58` |
| Note | Smooth-scroll + 3D deliberately ignore OS reduce-motion. Consider an in-page motion toggle for sensitive users. | `ScrollStoryProvider.tsx` |
| Deploy | Genie AI chat needs `ANTHROPIC_API_KEY` at runtime; without it the wish-flow still captures leads but the AI is a graceful placeholder. | `app/api/genie` |

## Copy: humanize (EN + VI)

The copy is honest but corporate-terse and under-uses the genie/wish personality that the whole brand is built on. Direction: warmer and more human, lean into "a wish becomes real software," tighter and punchier, keep bilingual in sync. A few before -> after seeds:

- Hero eyebrow EN: "Software solutions consultancy, since 2020" -> "A small studio in Saigon that turns wishes into working software. Since 2020."
- Value prop "Outcome-first / We measure success in your results, not our hours" -> "We win when your numbers move, not when the clock runs."
- Work intro "The kinds of wishes we are built to grant." (keep — this line is good; most sections should sound like it.)

## Art-grade / WOW roadmap (ranked, visual-first)

Wave 1 — foundation (fast, clearly wanted)
1. Fix the issues above (nav, aria-labels, hero eyebrow, theme toggle, footer DUNS).
2. Humanize all copy, EN + VI, across the three sources.

Wave 2 — break the text walls (highest visual ROI)
3. Custom gold line-art icons / micro-illustrations on every card section (Services, Process, Value props, Commitments). One consistent hand-drawn-in-the-brand set. Turns 5 identical text grids into a visual system.
4. Real visuals for "Selected Work": abstract device/UI mockups in SVG (or screenshots when available), with a hover preview. Make the portfolio look like a portfolio.
5. Give Process a drawn-on-scroll connective line (a "circuit" that ignites step by step) and number badges.

Wave 3 — signature WOW moments (delight)
6. A "make a wish" hero interaction: an input where a visitor types a wish, gold dust bursts, Lumi reacts and hands off to the chat. On-theme, memorable, screenshot-worthy.
7. Cursor gold-dust trail + richer magnetic/tilt polish; section-linked Lumi poses (idle across the page, the arms-open greet at Contact).
8. Stat delight: animated count-ups everywhere; a live "wishes granted / projects shipped" style counter.
9. Small joys: a Lumi-themed 404 and loading state; a keyboard easter egg; optional subtle sound on wish/hover with a toggle.
10. Trust: real (even stylized) faces for "the genie is a small team."

## Suggested order

Do Wave 1 now (fixes + copy). Then Wave 2 (icons + work visuals) for the biggest visual jump. Then Wave 3 for the WOW signature. Each wave ships on a branch for review.
