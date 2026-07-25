# Decision: Genie cloud stays local (ChatMessage / PromptInput do not map)

**Date:** 2026-07-25  
**Status:** Adopted — do **not** migrate  
**Identity:** `hoa` · `plasma` (unchanged)  
**Related:** [`docs/ds-keep-local-inventory.md`](../ds-keep-local-inventory.md), Phase 3 forms note

---

## 1. Ask

Migrate Genie message rows / free-text input in `components/genie/GenieChatPanel.tsx` to package `ChatMessage` and `PromptInput` **only if** cloud chrome (`.cs-genie-*`) can stay without fighting the package API. No invented DS variants. Keep hoa/plasma.

## 2. Package API (installed pin)

| Component | Markup / behaviour | Props |
|---|---|---|
| `ChatMessage` | `.cs-chat-msg` + `__avatar` + `__col` (`__name` + `__bubble`); roles `lumi` \| `user` | `role`, `name`, `avatar`, `children`, `className` |
| `PromptInput` | `.cs-prompt` wrapping a **textarea** (`.cs-prompt__field`) + `__bar` with mandatory-style **disclosure hint** + primary send button | `value`, `onChange`, `onSubmit`, `placeholder`, `sendLabel`, `hint`, `disabled`, `busy`, `className` — **no** `inputMode`, **no** single-line `<input>` |

## 3. Genie product surface

| Need | Local today |
|---|---|
| Painted cloud shell + orbit Lumi (scene) | `.cs-genie-stage` / `.cs-genie-cloud-art` — Lumi is **outside** the message list |
| Compact bubbles in a fixed shell height | `.cs-genie-msg` / `-user` / `-genie` — text only, no avatar column |
| Wish-step free text | `.cs-genie-form` + `<input>` with `inputMode` email/url/text + package `Button` send |
| Script chips / consent step / undo | `.cs-genie-chip*` — product chrome, not DS PromptSuggestions |

## 4. Why it does not map cleanly

1. **ChatMessage always renders avatar + name columns.** The cloud already shows Lumi in the scene; adding package avatars fights the painted chrome and doubles the mascot. Hiding them would require inventing a DS variant or CSS that gut the component contract.
2. **PromptInput is a multi-line ask box with disclosure bar.** The cloud needs a compact single-line field with wish-step `inputMode` and no permanent hint under the chip row (consent lives on the collect step only). `hint={null}` still leaves the textarea + bar layout.
3. **Class / layout collision.** Package `.cs-chat-msg` / `.cs-prompt` layouts are not the `.cs-genie-*` shell. Wrapping one inside the other would be a cosmetic lie, not an adoption.

## 5. Decision

**Stop.** Keep Genie message rows and prompt local. Document as keep-local (not a DS gap). Do not invent `ChatMessage` / `PromptInput` variants for Lumi cloud chrome. Hold: LAUNCH, Code Connect. Status Hub out of scope.

## 6. Verification

- `tests/ds-phase3-forms-polish.test.ts` — panel must not import `ChatMessage` / `PromptInput`
- `npm run check:ds:live` — genie open asserts `.cs-genie-msg` present and `.cs-chat-msg` / `.cs-prompt` absent
