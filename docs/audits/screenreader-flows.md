# Screen Reader Flows

This document defines the manual assistive-technology scripts for FR-A11Y-012. Record results in the pre-launch audit report with environment, pass/fail, observed announcement text, and issue links.

## Flow 1 - Page Load To CTA Hub

Goal: verify first-focus bypass and CTA landing.

1. Open `/` in a fresh browser session.
2. Start the screen reader.
3. Press `Tab` once.
4. Confirm Skip Story is announced as an actionable control.
5. Activate it with keyboard.
6. Confirm focus moves to the CTA hub.
7. Confirm the CTA hub heading and first CTA are announced.

Expected result: the user can bypass story content and land at the conversion area without pointer input.

## Flow 2 - Story Narration

Goal: verify cinematic narration has an accessible equivalent.

1. Open `/`.
2. Navigate from the top of the page through the seven story scenes.
3. For each scene, record the announced heading and narration.
4. Confirm announcements are not duplicated repeatedly while the scene is idle.
5. Confirm reduced-motion mode presents the same story through `/lite` or inline storyboard panels.

Expected result: every scene has perceivable text content and screen-reader users can understand the full story.

## Flow 3 - Buy Form

Goal: verify form labels, validation, and success state.

1. Open `/`.
2. Navigate to the Buy CTA and activate it.
3. Confirm focus moves into the modal.
4. Move through each field and record announced label, required state, hint, and current value.
5. Submit the empty form.
6. Confirm errors are announced and each invalid field is marked.
7. Fill valid values and submit.
8. Confirm success is announced with `aria-live` or equivalent status semantics.
9. Close the modal and confirm focus returns to the Buy CTA.

Expected result: the form can be completed without sight, pointer input, or guessing.

## Flow 4 - Partner Form

Goal: verify partner lead form follows the same accessible contract.

1. Open `/`.
2. Navigate to the Partner CTA and activate it.
3. Confirm modal focus management.
4. Submit invalid data and verify announced errors.
5. Fill valid values and submit.
6. Confirm success message announcement.
7. Clear or reuse saved form details if the prefill prompt appears.

Expected result: partner submission has labels, errors, success, focus return, and redundant-entry support.

## Flow 5 - Join Form

Goal: verify jobs and hiring inquiry flow.

1. Open `/`.
2. Navigate to the Join CTA or hiring badge.
3. Confirm job-count or hiring copy does not hide essential form access.
4. Activate the form.
5. Move through role, portfolio, email, and message fields.
6. Submit invalid data, then valid data.
7. Confirm validation and success announcements.

Expected result: candidates can complete the join flow with screen reader and keyboard alone.

## Flow 6 - Language Switch

Goal: verify localized route changes and document language.

1. Open `/`.
2. Navigate to the language switch.
3. Activate Vietnamese.
4. Confirm route changes to `/vi`.
5. Confirm page language, heading, navigation labels, and CTA labels are Vietnamese.
6. Navigate to `/vi/accessibility`.
7. Confirm the criteria table caption and contact link are announced.

Expected result: localized pages expose the right language context and remain navigable.

## Flow 7 - Mute Toggle

Goal: verify audio preference semantics.

1. Open `/`.
2. Navigate to the mute toggle.
3. Confirm role, name, and pressed state are announced.
4. Activate with keyboard.
5. Confirm the changed state is announced.
6. Reload the page and confirm the preference persists.

Expected result: audio state is controllable, persistent, and announced without relying on icon-only meaning.

## Flow 8 - Lite Experience

Goal: verify the non-cinematic path is equivalent.

1. Open `/lite`.
2. Confirm H1 explains the read-only experience.
3. Navigate through all seven panels.
4. Confirm each panel has a heading, body copy, and CTA.
5. Confirm links and CTA controls are reachable and named.

Expected result: users who cannot or do not want the 3D runtime get a complete equivalent story.

## Flow 9 - Accessibility Statement

Goal: verify the public statement is accessible.

1. Open `/accessibility`.
2. Confirm H1, commitment, standard claimed, conformance status, known issues, and contact sections.
3. Navigate into the criteria table.
4. Confirm the scroll region has a useful name.
5. Confirm table headers associate with rows.
6. Activate the email link.
7. Repeat on `/vi/accessibility`.

Expected result: the statement itself is accessible and usable as procurement evidence.
