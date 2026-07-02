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
  wishFlowPayload,
  type WishState,
} from "@/lib/genie/wishFlow";
import { WISH_GRANTED_EVENT } from "@/lib/scene/mascot";
import { track } from "@/lib/analytics";
import { Icon } from "@/components/ui/Icon";

function uid(): string {
  return Math.random().toString(36).slice(2);
}

export function GenieChatPanel({ locale, dict }: { locale: Locale; dict: Dictionary }) {
  const open = useGenieStore((s) => s.open);
  const status = useGenieStore((s) => s.status);
  const messages = useGenieStore((s) => s.messages);
  const setOpen = useGenieStore((s) => s.setOpen);
  const setStatus = useGenieStore((s) => s.setStatus);
  const addMessage = useGenieStore((s) => s.addMessage);
  const appendToMessage = useGenieStore((s) => s.appendToMessage);

  const [input, setInput] = useState("");
  // Conversational lead capture (FR-CHAR-026): when active, the input feeds
  // the deterministic wish flow instead of the AI proxy - keyless, so it
  // works even while Lumi's AI is resting.
  const [wish, setWish] = useState<WishState | null>(null);
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

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
      case "message":
        return dict.genie.wishAskMessage;
      case "consent":
        return dict.genie.wishAskConsent;
      default:
        return "";
    }
  }

  function startWish() {
    if (busy || wish) return;
    const state = startWishFlow();
    setWish(state);
    track("wish_flow_started");
    say(promptFor(state));
    inputRef.current?.focus();
  }

  function cancelWish() {
    setWish(null);
    say(dict.genie.wishCancelled);
  }

  function feedWish(raw: string) {
    if (!wish) return;
    const value = raw.trim();
    if (value) addMessage({ id: uid(), role: "user", content: value });
    const { state, error } = advanceWishFlow(wish, value);
    if (error) {
      say(error === "invalid_email" ? dict.genie.wishErrorEmail : dict.genie.wishErrorName);
      return;
    }
    setWish(state);
    say(promptFor(state));
  }

  async function submitWish() {
    if (!wish || wish.step !== "consent") return;
    const done = resolveConsent(wish, true);
    const payload = wishFlowPayload(done, locale);
    if (!payload) {
      say(dict.genie.wishFailed);
      return;
    }
    setSending(true);
    say(dict.genie.wishSending);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        track("lead_submitted", { source: "lumi-chat" });
        setWish(null);
        say(dict.genie.wishDone);
        // Lumi celebrates: the scene listens and bursts (FR-CHAR-030).
        window.dispatchEvent(new CustomEvent(WISH_GRANTED_EVENT));
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
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

    // Wish flow captures the input while active (no AI round-trip).
    if (wish && wish.step !== "consent" && wish.step !== "done") {
      feedWish(text);
      return;
    }

    const userMsg: GenieMessage = { id: uid(), role: "user", content: text };
    addMessage(userMsg);
    const assistantId = uid();
    addMessage({ id: assistantId, role: "assistant", content: "" });
    setStatus("thinking");

    // The visible greeting is UI-only; the API history starts with the user.
    const history = [...messages, userMsg].map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch("/api/genie", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: history, locale }),
      });
      if (!res.ok || !res.body) {
        appendToMessage(assistantId, dict.genie.unavailable);
        setStatus("idle");
        return;
      }
      setStatus("speaking");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        appendToMessage(assistantId, decoder.decode(value, { stream: true }));
      }
      setStatus("idle");
    } catch {
      appendToMessage(assistantId, dict.genie.unavailable);
      setStatus("idle");
    }
  }

  const consentStep = wish?.step === "consent";

  return (
    <section
      className="cs-genie cs-surface-heavy cs-no-print"
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
        {messages.map((m) => (
          <div
            key={m.id}
            className={`cs-genie-msg ${m.role === "user" ? "cs-genie-msg-user" : "cs-genie-msg-genie"}`}
          >
            {m.content || (m.role === "assistant" && busy ? dict.genie.thinking : "")}
          </div>
        ))}
      </div>

      {/* Quick actions: start the wish flow, or drive its skip/consent steps. */}
      <div className="cs-genie-chips">
        {!wish && (
          <button type="button" className="cs-genie-chip cs-genie-chip-gold" onClick={startWish} disabled={busy}>
            <Icon name="sparkle" size="sm" /> {dict.genie.wishCta}
          </button>
        )}
        {wish && consentStep && (
          <button type="button" className="cs-genie-chip cs-genie-chip-gold" onClick={submitWish} disabled={busy}>
            {dict.genie.wishAgree}
          </button>
        )}
        {wish && !consentStep && isOptionalStep(wish.step) && (
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

      <p className="cs-genie-consent">
        {dict.genie.consent}{" "}
        <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">
          {dict.footer.privacy}
        </a>
      </p>

      <form className="cs-genie-form" onSubmit={send}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={dict.genie.placeholder}
          aria-label={dict.genie.placeholder}
          disabled={busy || consentStep}
          maxLength={4000}
        />
        <button className="cs-btn cs-btn-primary" type="submit" disabled={busy || consentStep || !input.trim()}>
          {dict.genie.send}
        </button>
      </form>
    </section>
  );
}
