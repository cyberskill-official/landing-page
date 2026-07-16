---
id: TASK-DS-014
title: "Kinetic section type: per-word masked headings + ink-wipe leads, sitewide"
module: DS
priority: COULD
status: done
class: product
verify: T
phase: P4
created: 2026-07-02
shipped: 2026-07-02
owner: agent
author: Stephen Cheng
depends_on: [TASK-DS-011, TASK-DS-013]
related_tasks: [TASK-CHAR-031]
source_pages:
  - "operator direction 2026-07-02: each section still shows nothing WOW - the texts are still static; the remaining Start-my-project / Talk-to-Lumi CTAs should migrate to Lumi; the Click-Me hint should sit at Lumi's centre"
new_files:
  - components/motion/KineticText.tsx
modified_files:
  - components/sections/Services.tsx
  - components/sections/ValueProp.tsx
  - components/sections/Process.tsx
  - components/sections/WorkPreview.tsx
  - components/sections/SocialProof.tsx
  - components/sections/Faq.tsx
  - components/sections/Careers.tsx
  - components/sections/ContactCta.tsx
  - components/sections/StoryArc.tsx
  - components/sections/Hero.tsx
  - components/header/SiteHeader.tsx
  - components/cta/PersistentCta.tsx
  - components/canvas/LumiHotspot.tsx
  - app/globals.css
  - tests/motion-polish.test.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

1.1 Every section h2 MUST animate like the hero: each word rises out of its
own overflow mask with a per-word stagger when the heading scrolls into
view (the hero's kinetic language, extended sitewide). Section leads MUST
ink themselves in left-to-right as they reveal. The h2 MUST keep its full
accessible name via aria-label (masked words are aria-hidden), and
reduced-motion / scripting:none / forced-colors / print MUST render all
text plainly visible with no masks.

1.2 With the mascot live, ALL duplicate chat CTAs MUST yield to Lumi: the
hero pair ("Start my project" + "Talk to Lumi"), the persistent bottom bar,
AND the header launcher hide under html[data-lumi-live] (amends the
TASK-CHAR-031 clause that kept the header CTA visible - operator direction
2026-07-02). Discoverability while the mascot is live is carried by the
one-time centred "Click me" hint, the contact section's "Grant it with
Lumi" launcher, and the mascot's own affordances (cursor, excite, ring).
Devices without the mascot keep every CTA.

1.3 The hint chip MUST sit at Lumi's centre (translate(-50%,-50%) on the
tracked screen point), not float beside the mascot.

## §2 Design

components/motion/KineticText.tsx splits a title with splitSloganWords
(TASK-DS-011 helper, diacritic-safe for VN) into .cs-kt-word masks around
.cs-kt-inner spans carrying --kti indices. Section h2s add .cs-kt-h +
data-mask-reveal + aria-label and render <KineticText/>; the existing
MotionExtras observer flips them to "shown", and CSS staggers each word 55ms
by --kti. Leads use a @supports background-clip:text ink-wipe whose
background-position stays within 0-100% (the coverage law, TASK-DS-012
lesson). CTA migration is CSS-only: the header/persistent/hero launchers
carry .cs-lumi-alt, hidden under [data-lumi-live]. A markup test pins the
per-word mask count and the accessible name.

## §3 Evidence (2026-07-02, Mac gate + automated run)

- Gate all EXIT=0: tsc; vitest 18 files / 76 tests (KineticText renders 3
  masks for "How we work", keeps ">work</span>" and the aria-label); lint;
  build; assets (CSS still under the 60KB budget); served jsdom axe /en +
  /vi 0 serious/critical (aria-label preserves every heading's name).
- REVEAL_PROBE on the served build: after scrolling to #services the h2
  carries data-mask-reveal="shown" and the first word's computed transform
  is none (unmasked); shown-counter > 0 across the page. This probe was
  added after catching the hydration-race regression - see the TASK-SCENE-004
  addendum - where a mid-hydration GSAP pin-spacer stranded every reveal
  observer and left kinetic headings permanently masked.
- CONTACT_PROBE heroAltHidden:true (hero CTAs yield to Lumi);
  screenshots show the centred hint chip (1b) and revealed kinetic headings
  (3-mascot-services.png after the fix).
