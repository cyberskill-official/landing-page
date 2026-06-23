---
id: FR-A11Y-004
title: "Full keyboard operability, visible focus, and focus order"
module: A11Y
priority: MUST
status: planned
verify: T
phase: P5
owner: Stephen Cheng
created: 2026-06-22
shipped: null
depends_on: []
blocks: []
source_pages:
  - "research doc §H (WCAG 2.1.1 keyboard, 2.4.7 focus visible)"
---

## §1 Requirement (BCP-14 normative)

Every interactive surface MUST be fully operable by keyboard with a clear,
ordered focus path.

1. All interactive elements, including the canvas controls and the chat widget,
   MUST be reachable and operable with the keyboard alone.
2. Every focusable element MUST show a visible focus indicator that meets the
   contrast floor against its background.
3. Focus order MUST follow the logical reading order, and there MUST be no focus
   trap in the canvas or chat; focus MUST be able to leave any open surface.
4. When the chat or any overlay opens, focus MUST move into it, and on close
   MUST return to the control that opened it.

## §2 Acceptance

- Tab and Shift+Tab reach and operate every control with no pointer.
- Each focused element shows a visible, sufficiently contrasted indicator.
- Opening then closing the chat moves focus in and returns it, with no trap.

## §3 Evidence

Substantially in place (status stays planned pending a manual keyboard pass,
which belongs with FR-A11Y-008).

Structural keyboard operability holds by construction: the site is HTML-first
with native controls (links, buttons, form fields), a visible `:focus-visible`
outline (3px) globally, a skip link, and the 3D canvas marked decorative
(`aria-hidden`, `pointer-events:none`) so it is never a tab stop. The chat is a
correctly-modelled non-modal `role="dialog"` (`aria-modal="false"`): on open
focus moves to the input, on close it returns to the launcher, and Escape closes
it - per the WAI-ARIA APG a non-modal dialog does not trap focus, so there is no
trap (§2 item 3). This run added the launcher-to-dialog relationship: the
"Talk to Lumi" buttons now carry `aria-haspopup="dialog"` and `aria-expanded`
bound to the open state.

Open for full acceptance: a manual Tab / Shift+Tab pass through every route with
no pointer, confirming order and the contrast of each focus indicator (§2 items
1-2). That is a human/AT verification step (A11Y-008), so this FR stays planned.
