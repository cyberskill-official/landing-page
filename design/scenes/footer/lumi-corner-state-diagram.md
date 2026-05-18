# Footer Lumi Corner State Diagram

## States

| State | Trigger | Visual | Behaviour |
|---|---|---|---|
| idle | Footer enters viewport | 48x48 top-right Lumi avatar, nón lá on | Soft wisp loop, z-index above footer DOM |
| hover | Pointer or keyboard focus on corner avatar | Subtle gold pulse + tooltip | Tooltip text binds to FR-CMS-002 `lumi-tagline-hover`; bilingual EN/VI copy is allowed |
| scroll-back-up | User scrolls upward from footer into Scene 6 | Corner avatar rewinds into `wave_goodbye` | Play `wave_goodbye` in reverse, then restore Scene 6 Lumi pose |

## Persistence Rules

- The nón lá remains on in all three states.
- The avatar remains 48x48 viewport pixels at desktop, tablet, and mobile.
- The avatar must not cover footer navigation. If it conflicts, keep the avatar top-right and shift footer content left/down.
- The language switcher remains text-only: `EN / VI`.

## Tooltip Copy

Use the localized hover tagline from FR-CMS-002. Do not hardcode flag icons or extra cultural symbols.
