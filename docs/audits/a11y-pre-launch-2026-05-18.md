# A11y pre-launch audit - 2026-05-18

Status: blocked for launch sign-off. Automated coverage passed locally, but the FR requires independent manual VoiceOver, NVDA, and JAWS sign-off that cannot be performed inside this workspace.

Auditor: Codex automated audit runner for local baseline. External consultant pending.
Build under test: local working tree at base commit `c4a9d11`, dev server `http://127.0.0.1:3000`.
Date: 2026-05-18.
Related FR: FR-A11Y-012.

## Scope

Routes covered by automated browser tests:

- `/`
- `/lite`
- `/work/sample`
- `/accessibility`
- `/vi`
- `/vi/lite`
- `/vi/work/sample`
- `/vi/accessibility`

Viewports covered by the main axe matrix:

- Mobile: 375 x 667
- Tablet: 768 x 1024
- Desktop: 1280 x 800
- Wide desktop: 1920 x 1080

Critical flows covered by existing E2E checks:

- First tab from page load reaches Skip Story.
- Skip Story activates and moves focus to the CTA hub.
- Interactive controls expose accessible names that match visible labels.
- `/lite` renders all seven storyboard panels without the 3D runtime.
- Reduced-motion mode keeps the canvas unmounted and exposes the storyboard.
- Mute toggle starts muted, persists state, announces changes, and supports keyboard activation.
- Buy, partner, and join form validation exposes field errors and success feedback.
- Form prefill can reuse and clear saved details.
- `/accessibility` and `/vi/accessibility` expose the compliance statement, criteria table, contact path, review date, and known issues.

## Automated Results

Commands run:

```bash
node_modules/.bin/playwright test tests/a11y/accessibility-statement.e2e.spec.ts tests/a11y/all-routes.spec.ts tests/a11y/target-size.e2e.spec.ts --project=chromium
A11Y_REPORT_PATH=test-results/a11y-report-expanded-2026-05-18.json node_modules/.bin/playwright test tests/a11y/all-routes.spec.ts --project=chromium
node_modules/.bin/vitest run components/accessibility/__tests__/CriteriaTable.unit.test.tsx --config vitest.config.ts
node_modules/.bin/tsc -p tsconfig.json --noEmit
node_modules/.bin/next build
```

Results:

- Chromium accessibility statement, route axe, keyboard, and target-size suite: 41 passed before the route-matrix expansion.
- Expanded route axe matrix covering English and Vietnamese routes: 34 passed.
- CriteriaTable unit tests: 3 passed.
- TypeScript validation: passed.
- Production build: passed.
- Restarted dev server and reran accessibility statement E2E: 2 passed.

## Per-Route Baseline

| Route | Automated axe baseline | Manual AT baseline | Notes |
|---|---|---|---|
| `/` | Passed serious/critical blocking check in Chromium | Pending | Full AT scene narration remains manual. |
| `/lite` | Passed serious/critical blocking check in Chromium | Pending | Equivalent reduced-motion content exists. |
| `/work/sample` | Passed serious/critical blocking check in Chromium | Pending | Work detail route is included in target-size and axe checks. |
| `/accessibility` | Passed serious/critical blocking check in Chromium | Pending | Public statement now lists known pending manual audit. |
| `/vi` | Passed serious/critical blocking check in Chromium | Pending | Localized root route included in expanded matrix. |
| `/vi/lite` | Passed serious/critical blocking check in Chromium | Pending | Localized lite route included in expanded matrix. |
| `/vi/work/sample` | Passed serious/critical blocking check in Chromium | Pending | Localized work detail route included in expanded matrix. |
| `/vi/accessibility` | Passed serious/critical blocking check in Chromium | Pending | Localized statement renders and links contact email. |

## Manual Evidence Required

These items are not complete and block launch sign-off:

- VoiceOver on macOS Safari current version.
- VoiceOver on macOS Safari previous supported version.
- VoiceOver on iOS Safari, iOS 17 and iOS 16.
- NVDA on Windows 11 Firefox.
- NVDA on Windows 11 Chrome.
- JAWS on Windows 11.
- Switch Control single-switch and dual-switch navigation.
- macOS Voice Control and Windows Speech Recognition.
- Cognitive review with a dyslexia tester or paid reviewer.
- Color-blindness simulations for deuteranopia, tritanopia, and achromatopsia.
- External consultant sign-off.

## Remediated During This Audit Packet

- The public `/accessibility` table wrapper now exposes a named, keyboard-focusable scroll region.
- The accessibility E2E route assertion now targets the exact standard claim text.
- The all-routes axe matrix now includes Vietnamese localized routes.

## Known Issues Carried Forward

1. External screen-reader audit is pending.
2. JAWS, switch-control, voice-control, cognitive, and color-blindness checks are pending.
3. This audit is a local baseline, not an independent procurement-ready report.

## Launch Decision

Launch sign-off: blocked.

Reason: FR-A11Y-012 requires independent manual AT evidence. Automated tests are useful guardrails, but they do not replace VoiceOver, NVDA, JAWS, motor, cognitive, and color-blindness reviews.

## Required Next Step

Book an external accessibility consultant for a two-day audit window and give them:

- This report.
- `docs/audits/a11y-test-checklist.md`.
- `docs/audits/screenreader-flows.md`.
- The public URL or staging URL.
- The current build SHA.

After consultant sign-off, replace this blocked baseline with the signed pre-launch report and update `/accessibility` known issues.
