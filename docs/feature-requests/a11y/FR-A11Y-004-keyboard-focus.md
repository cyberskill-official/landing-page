---
id: FR-A11Y-004
title: "Full keyboard operability, visible focus, and focus order"
status: ready_to_implement
class: product
priority: MUST
owner: agent
depends_on: [FR-A11Y-011]
routed_back_count: 0
awh: N/A
traces_to: [research-doc/section-H, audit-B/finding-14-low]
---

# FR-A11Y-004: Full keyboard operability, visible focus, and focus order

## 0. Why (evidence)

Research doc §H (WCAG 2.1.1 keyboard, 2.4.7 focus visible). Substantially in place already, and this FR closes the rest.

Already true (2026-06): the site is HTML-first with native controls, a global 3px `:focus-visible` outline, a skip link,
and the 3D canvas marked decorative (`aria-hidden`, `pointer-events:none`) so it is never a tab stop. The chat is a
correctly-modelled non-modal `role="dialog"` (`aria-modal="false"`): focus moves to the input on open, returns to the
launcher on close, Escape closes it, and the launchers carry `aria-haspopup="dialog"` + `aria-expanded`. Per the WAI-ARIA
APG a non-modal dialog does not trap focus, so there is no trap.

Open: a real Tab / Shift+Tab pass across every route with no pointer, confirming order and the contrast of each focus
indicator - and the 18 sub-44px controls audit B found (FR-A11Y-011), which are the same header icons and rail dots this
FR must be able to reach.

## 1. Description (normative)

- 1.1 Every interactive element, including the chat widget, the chapter rail and the persistent CTA, SHALL be reachable and operable with the keyboard alone.
- 1.2 Every focusable element SHALL show a visible focus indicator meeting the WCAG 2.2 non-text contrast floor against its own background, in both themes.
- 1.3 Focus order SHALL follow the logical reading order, and no surface SHALL trap focus: focus SHALL always be able to leave.
- 1.4 When the chat or any overlay opens, focus SHALL move into it, and on close SHALL return to the control that opened it.

## 2. Acceptance criteria

- [ ] AC for 1.1 - a scripted Tab sweep reaches and activates every control on every route, EN and VN, with no pointer - test: `a11y/keyboard-sweep`
- [ ] AC for 1.2 - the focus ring passes contrast against every surface it lands on, dark and light - test: `check:apca`
- [ ] AC for 1.3 - the sweep never revisits a node twice and always escapes an open surface - test: `a11y/keyboard-sweep`
- [ ] AC for 1.4 - opening then closing the chat moves focus in and restores it - test: `a11y/chat-focus-return`

## 3. Edge cases

- The scene canvas must stay out of the tab order even when it mounts.
- A control that appears only on scroll (the persistent CTA) must still be reachable in order.
- Escape inside the chat while a field has a pending value must not lose the value silently.

## 4. Out of scope / non-goals

- The manual screen-reader pass (FR-A11Y-008).
- Enlarging the tap targets (FR-A11Y-011).

## 5. Protected invariants this FR must not weaken

- AGENTS.md §4.4: WCAG 2.2 AA floor and prefers-reduced-motion support.
- AGENTS.md §4.1 HTML-first: every meaningful state stays server-rendered DOM and the canvas never owns LCP.
