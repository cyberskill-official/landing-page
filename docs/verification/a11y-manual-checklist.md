# Manual a11y lab checklists (FR-A11Y-008 / FR-A11Y-014)

Agent cannot run VoiceOver/NVDA or real devices for you. Use this sheet; log findings dated under `docs/verification/a11y-sr-YYYY-MM-DD.md` or `a11y-device-YYYY-MM-DD.md`.

## FR-A11Y-008 — Screen readers

| Check | VoiceOver (Safari macOS/iOS) | NVDA (Firefox Windows) |
|---|---|---|
| Skip link to main content | ☐ | ☐ |
| Primary nav + language switcher | ☐ | ☐ |
| Lumi chat open/close, focus trap, Escape | ☐ | ☐ |
| Lead form labels, errors, honeypot hidden | ☐ | ☐ |
| Teardown form / Lumi teardown seed | ☐ | ☐ |
| Verify us / footer landmark | ☐ | ☐ |
| Kinetic headings still readable | ☐ | ☐ |

**Pass rule:** no serious/critical barriers on home + contact + one service page.  
**Date / operator:** ________

## FR-A11Y-014 — Devices & contrast

| Viewport | Home | Contact | Chat | Contrast issues |
|---|---|---|---|---|
| iPhone SE / small Android | ☐ | ☐ | ☐ | |
| iPhone 14 / Pixel mid | ☐ | ☐ | ☐ | |
| iPad / tablet | ☐ | ☐ | ☐ | |
| Desktop 1280+ | ☐ | ☐ | ☐ | |
| prefers-reduced-motion | ☐ scene gated | | | |

**Pass rule:** 44px targets, no clipped CTA bar, genie input readable in dark mode.  
**Date / operator:** ________
