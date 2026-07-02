---
id: FR-CHAR-033
title: "Chat cloud: the genie panel becomes a thought bubble tethered to Lumi"
module: CHAR
priority: COULD
status: shipped
verify: T
phase: P4
created: 2026-07-02
shipped: 2026-07-02
owner: Stephen Cheng
depends_on: [FR-CHAR-012, FR-CHAR-030]
related_frs: [FR-CHAR-031]
source_pages:
  - "operator direction 2026-07-02: the chat still behaves like a static form at the bottom-right corner - make it a chat cloud that sticks with Lumi, with fancy magic effects when interacting"
new_files: []
modified_files:
  - lib/scene/journey.ts
  - app/globals.css
---

## §1 Requirement (BCP-14 normative)

1.1 While the living mascot is on stage (html[data-lumi-live]), the open
chat MUST read as Lumi's thought bubble, not a corner widget: an organic
blob-radius cloud positioned beside Lumi's chat-attend anchor, with
thought dots stepping from the mascot to the cloud, a gold rim and glow,
a materialise-in animation, and a gentle idle float. Each new message MUST
pop in with a spring scale. On devices without the mascot the classic
bottom-right panel MUST remain unchanged.

1.2 The cloud MUST NOT regress any chat contract: focus management, ESC
close, live-region announcements, the wish flow (FR-CHAR-031), and the
input/consent states all behave identically; the log scrolls within the
cloud; reduced-motion gets the cloud without float/pop animation.

## §2 Design

Pure CSS + one anchor change. CHAT_ANCHOR in lib/scene/journey.ts moves to
{vx:0.7, vy:0.2, scale:0.4}, so Lumi hovers above-left of the cloud and
"holds" it. globals.css scopes [data-lumi-live] .cs-genie: fixed right 4vw,
top 52%, translateY(-50%), an eight-value border-radius blob, gold border +
layered glow, cs-cloud-in materialise + cs-cloud-float idle loop
(transform-only), ::before/::after thought dots toward the mascot, and
.cs-genie-msg gets a cs-msg-pop spring. Guards force static rendering under
prefers-reduced-motion / scripting:none / forced-colors / print.

## §3 Evidence (2026-07-02, Mac gate + automated run)

- Gate all EXIT=0 (tsc, vitest 76, lint, build, assets, served axe /en+/vi
  0 serious/critical - the cloud is the same DOM, so dialog semantics and
  live regions are untouched).
- CHAT_PROBE + WISH_PROBE on the served build: mascot click opens the
  cloud; the full wish flow (chips, typed answers, consent, POST /api/lead)
  completes inside it - done:true. Screenshot 5-mascot-chat.png shows the
  blob cloud at centre-right with Lumi attending above it; 5c/5d capture
  consent and success states inside the cloud.
- Journey unit tests (tests/journey.test.ts) still pass with the new
  anchor; Lumi's chat-attend easing is unchanged (FR-CHAR-030).
