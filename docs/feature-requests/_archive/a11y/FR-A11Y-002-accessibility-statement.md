---
id: FR-A11Y-002
title: "Accessibility statement page documenting conformance and motion stance"
module: A11Y
priority: SHOULD
status: done
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: []
blocks: []
source_pages:
  - "research doc §H (accessibility, WCAG 2.2 AA), §J (motion stance)"
new_files:
  - app/[lang]/accessibility/page.tsx
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The site SHOULD publish a statement that documents its accessibility conformance
and explains the motion decision.

1. An `/[lang]/accessibility` page SHOULD state the target conformance level,
   known limitations, and a contact route for accessibility feedback.
2. The page MUST describe the always-on motion stance and point to the
   reduced-motion path and any user-facing motion control.
3. The statement MUST exist for both locales and MUST read in each locale's
   language.
4. The page MAY be marked `noindex` while it remains a placeholder, but its
   content MUST stay reachable through site navigation.

## §2 Acceptance

- `/en/accessibility` and `/vi/accessibility` resolve and state a conformance
  target plus a feedback contact.
- The page explains the motion stance and links the reduced-motion path.
- Each locale's statement reads in its own language.

## §3 Evidence

Shipped 2026-06-22. `app/[lang]/accessibility/page.tsx` publishes the statement
in both locales (`Record<Locale, ...>`): it names the WCAG 2.2 AA target, lists
what has been done and the known limitations, and gives an email feedback route
with a one-business-day aim. A dedicated "Motion and the 3D scene" block explains
the always-on motion stance, and the page links the reduced-motion path with a
real link to `/[lang]/lite`. The footer carries a standing link to the page, so
it is reachable through navigation (clause 4). `generateMetadata` sets the
canonical and en/vi hreflang alternates. Verified by `next build`
(`/en/accessibility` and `/vi/accessibility` prerendered) and tsc + lint green.
