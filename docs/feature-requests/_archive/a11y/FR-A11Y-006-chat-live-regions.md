---
id: FR-A11Y-006
title: "ARIA live regions for streaming chat updates"
module: A11Y
priority: SHOULD
status: done
class: product
verify: T
phase: P5
owner: agent
author: Stephen Cheng
created: 2026-06-22
shipped: 2026-06-22
depends_on: [FR-CHAR-012]
blocks: []
source_pages:
  - "research doc §H (ARIA live regions), §G (chat widget)"
routed_back_count: 0
awh: N/A
---

## §1 Requirement (BCP-14 normative)

Screen readers SHOULD be told when chat content changes so streamed replies are
not silent.

1. The chat transcript SHOULD sit in an ARIA live region so new and streaming
   messages are announced as they arrive.
2. The live region MUST use a politeness level that announces updates without
   interrupting the user mid-action.
3. Streaming text SHOULD be announced in coherent chunks, not character by
   character, to avoid a flood of fragments.
4. A busy or sending state MUST be exposed to assistive technology so users know
   a reply is in progress.

## §2 Acceptance

- A new chat message is announced by a screen reader without moving focus.
- Streaming output is announced in readable chunks, not per character.
- The sending state is conveyed to assistive technology.

## §3 Evidence

Shipped 2026-06-22 in `components/genie/GenieChatPanel.tsx`. The transcript
container is `role="log"` with `aria-live="polite"` and
`aria-relevant="additions text"`, so new and streaming messages are announced as
they arrive without moving focus (clauses 1-2). Streamed tokens are appended per
network chunk (multi-character), which a polite live region coalesces into
readable additions rather than character-by-character fragments (clause 3). The
log carries `aria-busy={busy}`, which is true while the reply is thinking or
streaming, exposing the sending state to assistive tech (clause 4). As an added
safeguard the panel returns focus to the launcher on close (FR-A11Y-006 sibling
focus concern). Verified by tsc + lint + `next build` green; manual screen-reader
confirmation remains a recommended follow-up.
