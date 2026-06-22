"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useGenieStore, type GenieMessage } from "@/lib/genie/store";

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
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) inputRef.current?.focus();
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

  const busy = status === "thinking" || status === "speaking";

  async function send(e: React.FormEvent) {
    e.preventDefault();
    const text = input.trim();
    if (!text || busy) return;
    setInput("");

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
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      <div className="cs-genie-log" ref={logRef} aria-live="polite">
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

      <p className="cs-genie-consent">{dict.genie.consent}</p>

      <form className="cs-genie-form" onSubmit={send}>
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={dict.genie.placeholder}
          aria-label={dict.genie.placeholder}
          disabled={busy}
          maxLength={4000}
        />
        <button className="cs-btn cs-btn-primary" type="submit" disabled={busy || !input.trim()}>
          {dict.genie.send}
        </button>
      </form>
    </section>
  );
}
