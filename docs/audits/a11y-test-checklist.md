# A11y Test Checklist

Use this checklist for FR-A11Y-012 pre-launch audit and quarterly re-audits. A launch audit is complete only when each required item has evidence, owner, date, environment, result, and follow-up issue link when failed.

## Audit Metadata

- Audit date:
- Auditor:
- External consultant or firm:
- Build SHA:
- Staging or production URL:
- Browser versions:
- Operating systems:
- Assistive technology versions:
- Device list:

## Automated Checks

- [ ] Playwright axe matrix has 0 serious or critical violations on `/`, `/lite`, `/work/sample`, `/accessibility`, `/vi`, `/vi/lite`, `/vi/work/sample`, and `/vi/accessibility`.
- [ ] `tests/a11y/all-routes.spec.ts` writes `test-results/a11y-report.json`.
- [ ] Target-size suite passes at 320, 375, 1280, and 1920 px widths.
- [ ] Form validation E2E suite passes for error announcement and success announcement.
- [ ] Form prefill E2E suite passes for reuse and clear flows.
- [ ] Mute toggle E2E suite passes for default state, keyboard activation, live status, persistence, and target size.
- [ ] Lite and reduced-motion E2E suite passes.
- [ ] `/accessibility` statement E2E suite passes in English and Vietnamese.
- [ ] TypeScript passes.
- [ ] Production build passes.

## Keyboard-Only Checks

- [ ] First `Tab` from page load reaches Skip Story.
- [ ] `Enter` on Skip Story scrolls and focuses the CTA hub.
- [ ] Header links are reachable in visual order.
- [ ] Scene anchors and next-scene controls are reachable without a pointer.
- [ ] Buy, partner, and join CTAs are reachable.
- [ ] Modal focus moves to the first actionable control on open.
- [ ] `Escape` closes modals and returns focus to the trigger.
- [ ] Footer links are reachable.
- [ ] There are no keyboard traps.
- [ ] Focus ring is visible on every interactive control.

## Screen Reader Matrix

Run every critical flow in `screenreader-flows.md` for each environment:

- [ ] VoiceOver, macOS Safari current version.
- [ ] VoiceOver, macOS Safari previous supported version.
- [ ] VoiceOver, iOS Safari iOS 17.
- [ ] VoiceOver, iOS Safari iOS 16.
- [ ] NVDA, Windows 11 Firefox.
- [ ] NVDA, Windows 11 Chrome.
- [ ] JAWS, Windows 11.

For each screen reader:

- [ ] Page title and H1 are announced.
- [ ] Skip Story has a clear accessible name.
- [ ] CTA hub receives focus after Skip Story.
- [ ] All scene narration updates are announced without duplicate chatter.
- [ ] Buy form labels, hints, errors, and success state are announced.
- [ ] Partner form labels, hints, errors, and success state are announced.
- [ ] Join form labels, hints, errors, and success state are announced.
- [ ] Language switch changes document language and announces the new page context.
- [ ] Mute toggle role, name, pressed state, and live status are announced.
- [ ] `/lite` provides equivalent content without requiring canvas interaction.
- [ ] `/accessibility` table is navigable and the scroll region is named.

## Reduced Motion And Low Resource

- [ ] OS `prefers-reduced-motion: reduce` keeps the canvas unmounted.
- [ ] Reduced-motion users can reach all seven story panels.
- [ ] Save-Data path prompts or routes users to `/lite`.
- [ ] Low-memory path hides unnecessary cinematic controls.
- [ ] There are no vestibular motion triggers in reduced-motion mode.

## Motor And Alternative Input

- [ ] macOS Voice Control can activate Skip Story, CTA buttons, modal controls, form fields, and submit buttons.
- [ ] Windows Speech Recognition can activate the same controls.
- [ ] Single-switch scanning can reach the CTA hub, forms, footer, and language switch.
- [ ] Dual-switch scanning can move forward and backward through the same controls.
- [ ] Drag or fine-pointer gestures are not required for critical tasks.

## Cognitive Review

- [ ] User or contractor with dyslexia completes the critical flows.
- [ ] Labels are clear without relying on surrounding marketing prose.
- [ ] Error messages identify the exact field and recovery action.
- [ ] No critical task has a timeout.
- [ ] Form progress and confirmation states are understandable.
- [ ] Vietnamese copy is reviewed by a native speaker for clarity.

## Color And Contrast

- [ ] Normal text contrast is at least 4.5:1.
- [ ] Large text contrast is at least 3:1.
- [ ] Non-text UI indicators are at least 3:1.
- [ ] Deuteranopia simulation preserves state and error meaning.
- [ ] Tritanopia simulation preserves state and error meaning.
- [ ] Achromatopsia simulation preserves state and error meaning.
- [ ] No status depends on color alone.

## Completion Gate

- [ ] All serious and critical findings are fixed.
- [ ] Moderate findings have owner, issue link, and target date.
- [ ] Remaining known issues are listed in `/accessibility`.
- [ ] External consultant signs the audit.
- [ ] Founder signs the launch decision.
- [ ] Quarterly re-audit reminder is created.
