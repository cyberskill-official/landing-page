---
id: FR-CHAR-012
title: "Streaming chat widget + Zustand state machine + consent"
module: CHAR
priority: MUST
status: done
class: product
verify: T
phase: P2
owner: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-CHAR-010]
blocks: []
source_pages:
  - "research doc §I (conversational Genie), §H (accessibility)"
new_files:
  - components/genie/GenieChat.tsx
  - components/genie/GenieChatPanel.tsx
  - lib/genie/store.ts
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

The chat MUST cost nothing at first paint and MUST be operable by keyboard.

1. The chat panel MUST be lazily loaded with `ssr: false` so it never adds to the
   initial render or first paint.
2. The widget MUST read the `/api/genie` response stream token-by-token and
   append text as it arrives.
3. State MUST run through a Zustand store as an `idle -> listening -> thinking ->
   speaking` machine.
4. The panel MUST be an ARIA dialog: Escape MUST close it and focus MUST be
   managed on open and close.
5. A consent line MUST be shown. The opening greeting MUST be UI-only so the API
   conversation history starts with the user's first turn.

## §2 Acceptance

- The panel chunk loads only when opened; first paint excludes it.
- Replies stream in; the state machine reflects listening/thinking/speaking.
- Escape closes the dialog and returns focus to the opener.

## §3 Evidence

Static: dynamic `ssr:false` panel, streaming reader, Zustand state machine, ARIA
dialog + Escape + focus handling, consent line, UI-only greeting all authored.
Deferred: live streaming and focus-trap testing on the operator machine.
