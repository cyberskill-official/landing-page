---
id: TASK-DS-013
title: "Section signature motion: every home section gets its own beat"
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
depends_on: [TASK-DS-011, TASK-DS-012]
source_pages:
  - "operator direction 2026-07-02: other than Lumi the sections still look static - each section needs a wow"
new_files:
  - docs/tasks/ds/TASK-DS-013-section-signature-motion.md
modified_files:
  - components/sections/{TrustBand,WorkPreview,Careers}.tsx
  - components/motion/MotionExtras.tsx
  - app/globals.css
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Each home section MUST have a distinct signature move on top of the shared reveal system, and every move MUST follow the layer laws: transform/ opacity/paint only (zero CLS), one-shot or gently looping, reduced-motion and scripting:none guarded, decorative-only (no information carried by motion alone).

## §2 Design (the beats)

- TrustBand: stats pop in sequence ([data-pop] + per-item delay var) and each figure ignites with a one-shot gold text-glow.
- StoryArc: as the timeline draws (TASK-CHAR-030's line), the gold nodes ignite one after another with an expanding ring.
- ValueProp: the three stat cards levitate slowly, out of phase.
- Services: a light band scans each card once as it reveals.
- Process: a gold circuit line draws across behind the four steps and the step indices (01-04) charge to gold in order (sibling-combinator driven by the heading's reveal state).
- Work: HUD viewfinder brackets snap onto a card on hover.
- SocialProof: commitment cards rest at a slight paper tilt and square up on hover ('rotate' composes with the JS tilt's transform).
- FAQ: answers breathe in; the +/x marker rotates instead of swapping.
- Careers: gains the aurora backdrop.
- The observer in MotionExtras now serves three attributes (data-mask-reveal, data-line-reveal, data-pop) with one shows-only contract.

## §3 Evidence (2026-07-02, Mac gate)

- tsc, vitest 18/74, lint, build 26/26, check:assets, served-route jsdom axe 0 violations /en + /vi - all EXIT=0 with the beats in place.
- Guards verified by inspection and the reduced-motion CSS block (round-4 guards): every new animation nulls under prefers-reduced-motion; data-pop force-shows under scripting:none and print; brackets/hint hide under forced-colors.
