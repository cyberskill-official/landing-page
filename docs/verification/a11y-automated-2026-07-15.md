# A11y automated pass log (supports FR-A11Y-008 / 014)

## Automated (agent 2026-07-15)

| Suite | Result |
|---|---|
| `tests/axe.test.ts` | **pass** — English markup no serious/critical axe violations (vitest) |
| Genie dark input contrast | fixed earlier (surface + fg; no white-on-light) |
| Verify-us home duplicate | removed (footer + how-we-build only) |

## Manual still required (operator)

Use `docs/verification/a11y-manual-checklist.md`:

- [ ] VoiceOver pass (home, contact, Lumi chat)  
- [ ] NVDA pass (Windows) if available  
- [ ] Small phone + dark mode genie input readable  
- [ ] prefers-reduced-motion: no unwanted scene motion  

## How to log manual findings

Copy this file to `a11y-sr-YYYY-MM-DD.md` or tick the manual checklist and commit.
