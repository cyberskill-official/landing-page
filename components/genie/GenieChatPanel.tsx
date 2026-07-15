"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useGenieStore, type GenieMessage } from "@/lib/genie/store";
import {
  advanceWishFlow,
  isOptionalStep,
  resolveConsent,
  startWishFlow,
  startWishFlowWith,
  startTeardownWishFlow,
  wishFlowPayload,
  type WishState,
} from "@/lib/genie/wishFlow";
import {
  getOpeningChips,
  matchScriptedFreeText,
  offlineFallbackReply,
  resolveScriptTopic,
  type ScriptChip,
} from "@/lib/genie/scriptedChat";
import { WISH_GRANTED_EVENT } from "@/lib/scene/mascot";
import { emit, readUtm } from "@/lib/analytics/taxonomy";
import { Icon } from "@/components/ui/Icon";

function uid(): string {
  return Math.random().toString(36).slice(2);
}

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let id = window.sessionStorage.getItem("cs-chat-session");
  if (!id) {
    id = Math.random().toString(36).slice(2) + Date.now().toString(36);
    window.sessionStorage.setItem("cs-chat-session", id);
  }
  return id;
}

export function GenieChatPanel({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const open = useGenieStore((s) => s.open);
  const status = useGenieStore((s) => s.status);
  const messages = useGenieStore((s) => s.messages);
  const setOpen = useGenieStore((s) => s.setOpen);
  const setStatus = useGenieStore((s) => s.setStatus);
  const addMessage = useGenieStore((s) => s.addMessage);
  const appendToMessage = useGenieStore((s) => s.appendToMessage);
  const pendingWish = useGenieStore((s) => s.pendingWish);
  const pendingWishKind = useGenieStore((s) => s.pendingWishKind);
  const setPendingWish = useGenieStore((s) => s.setPendingWish);
  const isLeadCaptured = useGenieStore((s) => s.isLeadCaptured);

  const [input, setInput] = useState("");
  // Conversational lead capture (FR-CHAR-026): when active, the input feeds
  // the deterministic wish flow instead of the AI proxy - keyless, so it
  // works even while Lumi's AI is resting.
  const [wish, setWish] = useState<WishState | null>(null);
  // Scripted discovery chips (no LLM) — opening menu + topic follow-ups.
  const [scriptChips, setScriptChips] = useState<ScriptChip[]>(() => getOpeningChips(locale));
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  const seededRef = useRef<string | null>(null);

  // Move focus into the panel on open and return it to the launcher on close
  // so keyboard and screen-reader users are never stranded (FR-A11Y-006).
  useEffect(() => {
    if (!open) return;
    openerRef.current = (document.activeElement as HTMLElement) ?? null;
    inputRef.current?.focus();
    return () => {
      openerRef.current?.focus?.();
    };
  }, [open]);

  useEffect(() => {
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight });
  }, [messages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  // A wish typed in the hero (or teardown CTA) seeds the flow on open: echo it,
  // then collect who to reply to (the message question is skipped when held).
  useEffect(() => {
    if (!open || !pendingWish || seededRef.current === pendingWish) return;
    seededRef.current = pendingWish;
    seedWish(pendingWish, pendingWishKind);
    setPendingWish(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingWish, pendingWishKind]);

  if (!open) return null;

  const busy = status === "thinking" || status === "speaking" || sending;

  function say(content: string) {
    addMessage({ id: uid(), role: "assistant", content });
  }

  function promptFor(state: WishState): string {
    switch (state.step) {
      case "name":
        return dict.genie.wishAskName;
      case "email":
        return dict.genie.wishAskEmail.replace("{name}", state.draft.name ?? "");
      case "company":
        return dict.genie.wishAskCompany;
      case "url":
        return dict.genie.wishAskUrl;
      case "message":
        return state.kind === "teardown" ? dict.genie.wishAskTeardownFocus : dict.genie.wishAskMessage;
      case "consent":
        return state.kind === "teardown" ? dict.genie.wishAskTeardownConsent : dict.genie.wishAskConsent;
      default:
        return "";
    }
  }

  function formIdFor(kind: WishState["kind"]): "lumi-chat" | "teardown" {
    return kind === "teardown" ? "teardown" : "lumi-chat";
  }

  function startWish() {
    if (busy || wish) return;
    const state = startWishFlow();
    setWish(state);
    setScriptChips([]);
    emit("form_started", { formId: "lumi-chat" });
    say(promptFor(state));
    inputRef.current?.focus();
  }

  function startTeardownFromScript(seed?: string) {
    if (busy || wish) return;
    // User chip/line was already logged by the caller when applicable.
    const message = seed?.trim() || dict.teardown.lumiSeed;
    const state = startTeardownWishFlow(message);
    setWish(state);
    setScriptChips([]);
    emit("form_started", { formId: "teardown" });
    say(dict.genie.wishTeardownSeedAck);
    inputRef.current?.focus();
  }

  function seedWish(message: string, kind: WishState["kind"] = "default") {
    if (wish) return;
    const state =
      kind === "teardown" ? startTeardownWishFlow(message) : startWishFlowWith(message);
    setWish(state);
    setScriptChips([]);
    emit("form_started", { formId: formIdFor(kind) });
    addMessage({ id: uid(), role: "user", content: message });
    say(kind === "teardown" ? dict.genie.wishTeardownSeedAck : dict.genie.wishSeedAck);
    inputRef.current?.focus();
  }

  function cancelWish() {
    setWish(null);
    setScriptChips(getOpeningChips(locale));
    say(dict.genie.wishCancelled);
  }

  /** Keyless topic / chip path — works with or without the LLM. */
  function runScriptChip(chip: ScriptChip) {
    if (busy || wish) return;
    addMessage({ id: uid(), role: "user", content: chip.label });
    const reply = resolveScriptTopic(locale, chip.id);
    applyScriptReply(reply);
  }

  function applyScriptReply(reply: ReturnType<typeof resolveScriptTopic>) {
    if (reply.startWish) {
      startWish();
      return;
    }
    if (reply.startTeardown) {
      startTeardownFromScript();
      return;
    }
    say(reply.message);
    setScriptChips(reply.chips ?? getOpeningChips(locale));
  }

  function feedWish(raw: string) {
    if (!wish) return;
    const value = raw.trim();
    if (value) addMessage({ id: uid(), role: "user", content: value });
    const { state, error } = advanceWishFlow(wish, value);
    if (error) {
      if (error === "invalid_email") say(dict.genie.wishErrorEmail);
      else if (state.step === "url") say(dict.genie.wishErrorUrl);
      else say(dict.genie.wishErrorName);
      return;
    }
    // Seeded wish already holds the message: skip re-asking it.
    if (state.step === "message" && state.draft.message) {
      const skip: WishState = { step: "consent", draft: state.draft, kind: state.kind };
      setWish(skip);
      say(promptFor(skip));
      return;
    }
    setWish(state);
    say(promptFor(state));
  }

  async function submitWish() {
    if (!wish || wish.step !== "consent") return;
    const done = resolveConsent(wish, true);
    const basePayload = wishFlowPayload(done, locale);
    if (!basePayload) {
      say(dict.genie.wishFailed);
      return;
    }
    const payload = {
      ...basePayload,
      transcript: messages.map((msg) => ({
        sender: msg.role === "user" ? "Visitor" : "Lumi",
        text: msg.content,
      })),
    };
    const leadSource = basePayload.source === "teardown" ? "teardown" : "lumi-chat";
    setSending(true);
    say(dict.genie.wishSending);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, sessionId: getSessionId() }),
      });
      if (res.ok) {
        emit("lead_submitted", { source: leadSource, locale, utm: readUtm() });
        setWish(null);
        setScriptChips(getOpeningChips(locale));
        say(leadSource === "teardown" ? dict.genie.wishDoneTeardown : dict.genie.wishDone);
        // Lumi celebrates: the scene listens and bursts (FR-CHAR-030).
        window.dispatchEvent(new CustomEvent(WISH_GRANTED_EVENT));
      } else if (res.status === 429) {
        say(dict.teardown.capFullBody);
        setWish(null);
        setScriptChips(getOpeningChips(locale));
      } else {
        say(dict.genie.wishFailed);
      }
    } catch {
      say(dict.genie.wishFailed);
    } finally {
      setSending(false);
    }
  }

  async function send(e: React.FormEvent) {
    e.preventDefault();
    // Consent is chip-only — never submit free text here.
    if (wish?.step === "consent" || wish?.step === "done") return;
    const text = input.trim();
    if (!text || busy || sending) return;
    setInput("");

    // Wish flow captures the input while active (no AI round-trip).
    if (wish) {
      feedWish(text);
      return;
    }

    const userMsg: GenieMessage = { id: uid(), role: "user", content: text };
    addMessage(userMsg);

    // 1) Keyless scripted match — intentional, works offline.
    const scripted = matchScriptedFreeText(locale, text);
    if (scripted) {
      applyScriptReply(scripted);
      return;
    }

    // 2) Optional LLM when free text did not match a known case.
    const assistantId = uid();
    addMessage({ id: assistantId, role: "assistant", content: "" });
    setStatus("thinking");
    setScriptChips([]);

    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/genie", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, locale, sessionId: getSessionId() }),
      });
      if (!res.ok || !res.body) {
        const fallback = offlineFallbackReply(locale);
        appendToMessage(assistantId, fallback.message);
        setScriptChips(fallback.chips ?? getOpeningChips(locale));
        setStatus("idle");
        return;
      }
      setStatus("speaking");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = "";
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        appendToMessage(assistantId, chunk);
      }

      const captureMatch = fullText.match(/<LEAD_CAPTURED>([\s\S]*?)<\/LEAD_CAPTURED>/);
      if (captureMatch) {
        try {
          const leadData = JSON.parse(captureMatch[1]);
          useGenieStore.getState().setLeadCaptured(true, leadData);
          emit("lead_submitted", { source: "lumi-chat", locale, utm: readUtm() });
        } catch {
          useGenieStore.getState().setLeadCaptured(true);
        }
      }

      setScriptChips(getOpeningChips(locale));
      setStatus("idle");
    } catch {
      const fallback = offlineFallbackReply(locale);
      appendToMessage(assistantId, fallback.message);
      setScriptChips(fallback.chips ?? getOpeningChips(locale));
      setStatus("idle");
    }
  }

  const consentStep = wish?.step === "consent";
  // Free-text is wrong on chip-only decisions (consent Yes/No) — keep chips primary.
  const chipOnlyStep = Boolean(consentStep);
  const inputDisabled = busy || chipOnlyStep || sending;

  return (
    <section
      className="cs-genie cs-surface-heavy cs-no-print clarity-mask"
      data-clarity-mask="true"
      role="dialog"
      aria-label={dict.genie.title}
      aria-modal="false"
    >
      <div className="cs-genie-head">
        <span className="cs-genie-title">{dict.genie.title}</span>
        <button className="cs-genie-close" type="button" aria-label={dict.genie.close} onClick={() => setOpen(false)}>
          <Icon name="close" size="sm" strokeWidth={2} />
        </button>
      </div>

      <div
        className="cs-genie-log"
        ref={logRef}
        role="log"
        aria-live="polite"
        aria-relevant="additions text"
        aria-busy={busy}
      >
        <div className="cs-genie-msg cs-genie-msg-genie">{dict.genie.greeting}</div>
        {messages.map((m) => {
          // Hide the JSON block from the user interface
          const visibleContent = m.content.replace(/<LEAD_CAPTURED>[\s\S]*?<\/LEAD_CAPTURED>/g, "").trim();
          return (
            <div
              key={m.id}
              className={`cs-genie-msg ${m.role === "user" ? "cs-genie-msg-user" : "cs-genie-msg-genie"}`}
            >
              {visibleContent || (m.role === "assistant" && busy ? dict.genie.thinking : "")}
            </div>
          );
        })}
      </div>

      {/* Scripted discovery chips (keyless) + wish-flow controls. */}
      {!isLeadCaptured && (
        <div className="cs-genie-chips">
          {!wish &&
            scriptChips.map((chip) => (
              <button
                key={`${chip.id}-${chip.label}`}
                type="button"
                className={`cs-genie-chip${chip.id === "wish" || chip.id === "teardown_flow" || chip.id === "fortune" ? " cs-genie-chip-gold" : ""}`}
                onClick={() => runScriptChip(chip)}
                disabled={busy}
              >
                {(chip.id === "wish" || chip.id === "fortune") && <Icon name="sparkle" size="sm" />}
                {chip.label}
              </button>
            ))}
          {wish && consentStep && (
            <button type="button" className="cs-genie-chip cs-genie-chip-gold" onClick={submitWish} disabled={busy}>
              {dict.genie.wishAgree}
            </button>
          )}
          {wish && !consentStep && isOptionalStep(wish.step, wish.kind) && (
            <button type="button" className="cs-genie-chip" onClick={() => feedWish("")} disabled={busy}>
              {dict.genie.wishSkip}
            </button>
          )}
          {wish && (
            <button type="button" className="cs-genie-chip" onClick={cancelWish} disabled={busy}>
              {dict.genie.wishCancel}
            </button>
          )}
        </div>
      )}

      {isLeadCaptured ? (
        <div style={{ padding: "var(--cs-space-md) var(--cs-space-lg)", borderTop: "1px solid var(--cs-color-border)" }}>
          <p className="cs-eyebrow" style={{ color: "var(--cs-color-primary)", marginBottom: "var(--cs-space-sm)" }}>
            {locale === "vi" ? "Đã ghi nhận thông tin" : "Details captured"}
          </p>
          <p style={{ margin: 0, fontSize: "var(--cs-text-sm)" }}>
            {locale === "vi" 
              ? "Cảm ơn bạn. Đội ngũ của chúng tôi sẽ liên hệ lại qua email trong vòng một ngày làm việc."
              : "Thank you. Our team will follow up via email within one business day."}
          </p>
        </div>
      ) : (
        <>
          <p className="cs-genie-consent">
            {dict.genie.consent}{" "}
            <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">
              {dict.footer.privacy}
            </a>
          </p>

          <form
            className={`cs-genie-form${chipOnlyStep ? " cs-genie-form-chip-only" : ""}`}
            onSubmit={send}
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={
                chipOnlyStep
                  ? locale === "vi"
                    ? "Chọn một tuỳ chọn phía trên"
                    : "Choose an option above"
                  : dict.genie.placeholder
              }
              aria-label={dict.genie.placeholder}
              disabled={inputDisabled}
              maxLength={4000}
              autoComplete="off"
            />
            <button
              className="cs-btn cs-btn-primary"
              type="submit"
              disabled={inputDisabled || !input.trim()}
              aria-disabled={inputDisabled || !input.trim()}
            >
              {dict.genie.send}
            </button>
          </form>
        </>
      )}
    </section>
  );
}
