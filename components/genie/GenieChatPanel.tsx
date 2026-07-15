"use client";

import { useEffect, useRef, useState } from "react";
import type { Locale } from "@/lib/i18n/config";
import type { Dictionary } from "@/lib/i18n/dictionaries";
import { useGenieStore, type GenieMessage, type GenieFlowKind } from "@/lib/genie/store";
import {
  advanceWishFlow,
  canUndoWish,
  isOptionalStep,
  resolveConsent,
  startWishFlow,
  startWishFlowWith,
  startTeardownWishFlow,
  startContactWishFlow,
  startPartnershipWishFlow,
  startCareersWishFlow,
  undoWishFlow,
  wishFlowPayload,
  type WishKind,
  type WishState,
} from "@/lib/genie/wishFlow";
import {
  getOpeningChips,
  resolveScriptTopic,
  type ScriptChip,
} from "@/lib/genie/scriptedChat";
import { WISH_GRANTED_EVENT } from "@/lib/scene/mascot";
import { emit, readUtm } from "@/lib/analytics/taxonomy";
import { stopPageScroll, startPageScroll } from "@/lib/scroll/lenis-gsap";
import { Icon } from "@/components/ui/Icon";

function uid(): string {
  return Math.random().toString(36).slice(2);
}

/** Strip lead tags + light markdown so chat bubbles never show raw `**bold**`. */
function formatGenieDisplayText(raw: string): string {
  return raw
    .replace(/<LEAD_CAPTURED>[\s\S]*?<\/LEAD_CAPTURED>/g, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\*([^*]+)\*/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/_([^_]+)_/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .trim();
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

function createFlowState(kind: WishKind, seed?: string | null): WishState {
  const msg = seed?.trim() ?? "";
  switch (kind) {
    case "teardown":
      return startTeardownWishFlow(msg || undefined);
    case "contact":
      return startContactWishFlow(msg || undefined);
    case "partnership":
      return startPartnershipWishFlow(msg || undefined);
    case "careers":
      return startCareersWishFlow(msg || undefined);
    default:
      return msg ? startWishFlowWith(msg, "default") : startWishFlow("default");
  }
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
  const resetStore = useGenieStore((s) => s.reset);

  const [input, setInput] = useState("");
  const [wish, setWish] = useState<WishState | null>(null);
  const [scriptChips, setScriptChips] = useState<ScriptChip[]>(() => getOpeningChips(locale));
  const [sending, setSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const logRef = useRef<HTMLDivElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);
  /** Tracks last applied open intent so we do not re-seed on every render. */
  const seededKeyRef = useRef<string | null>(null);

  useEffect(() => {
    if (!open) {
      // Allow the same CTA to re-seed a flow on the next open.
      seededKeyRef.current = null;
      document.documentElement.removeAttribute("data-genie-open");
      return;
    }
    // Raise 3D canvas above this shell so the big Lumi can orbit the cloud.
    document.documentElement.setAttribute("data-genie-open", "");
    openerRef.current = (document.activeElement as HTMLElement) ?? null;
    inputRef.current?.focus();
    // Lock page scroll while modal is open (html + body + Lenis).
    const prevHtml = document.documentElement.style.overflow;
    const prevBody = document.body.style.overflow;
    document.documentElement.style.overflow = "hidden";
    document.body.style.overflow = "hidden";
    stopPageScroll();

    /**
     * Keep wheel/trackpad from driving Lenis/document.
     * When the pointer is over the log, apply delta to the log directly.
     */
    const onWheel = (e: WheelEvent) => {
      const t = e.target as Node | null;
      const log = logRef.current;
      const chips = document.querySelector(".cs-genie-chips");
      const inLog = !!(log && t && log.contains(t));
      const inChips = !!(chips && t && chips.contains(t));

      // Always prevent the page/Lenis from receiving the wheel while open.
      e.preventDefault();
      e.stopPropagation();

      if (inLog && log) {
        log.scrollTop += e.deltaY;
        return;
      }
      if (inChips && chips instanceof HTMLElement) {
        chips.scrollTop += e.deltaY;
      }
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.target as Node | null;
      const log = logRef.current;
      if (log && t && log.contains(t)) return;
      const chips = document.querySelector(".cs-genie-chips");
      if (chips && t && chips.contains(t)) return;
      e.preventDefault();
    };
    window.addEventListener("wheel", onWheel, { passive: false, capture: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false, capture: true });

    return () => {
      document.documentElement.style.overflow = prevHtml;
      document.body.style.overflow = prevBody;
      document.documentElement.removeAttribute("data-genie-open");
      window.removeEventListener("wheel", onWheel, true);
      window.removeEventListener("touchmove", onTouchMove, true);
      startPageScroll();
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

  // Seed lead flow when CTA opens with kind and/or message.
  useEffect(() => {
    if (!open) return;
    const seed = pendingWish;
    const kind = pendingWishKind;
    // Only auto-start lead capture for intentional CTA flows (or when a seed is present).
    const shouldStart =
      seed != null ||
      kind === "teardown" ||
      kind === "contact" ||
      kind === "partnership" ||
      kind === "careers";
    if (!shouldStart) return;

    const key = `${kind}::${seed ?? ""}`;
    if (seededKeyRef.current === key) return;
    seededKeyRef.current = key;
    // CTA entry always starts a clean lead funnel (clear prior mid-flow state).
    setWish(null);
    setInput("");
    setScriptChips([]);
    // Defer begin so setWish(null) applies before we set the new flow.
    queueMicrotask(() => {
      beginFlow(kind, seed, { force: true });
      setPendingWish(null);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, pendingWish, pendingWishKind]);

  if (!open) return null;

  const busy = status === "thinking" || status === "speaking" || sending;
  const chatStarted = messages.length > 0 || wish !== null || isLeadCaptured;
  const canUndo = canUndoWish(wish) && !busy && !sending;

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

  function seedAckFor(kind: WishKind): string {
    switch (kind) {
      case "teardown":
        return dict.genie.wishTeardownSeedAck;
      case "partnership":
        return dict.genie.wishPartnershipSeedAck;
      case "careers":
        return dict.genie.wishCareersSeedAck;
      case "contact":
        return dict.genie.wishContactSeedAck;
      default:
        return dict.genie.wishSeedAck;
    }
  }

  function formIdFor(kind: WishKind): string {
    switch (kind) {
      case "teardown":
        return "teardown";
      case "partnership":
        return "partnership";
      case "careers":
        return "careers";
      default:
        return "lumi-chat";
    }
  }

  function beginFlow(
    kind: GenieFlowKind,
    seed?: string | null,
    opts: { force?: boolean } = {},
  ) {
    if (wish && !opts.force) return;
    const state = createFlowState(kind, seed);
    setWish(state);
    setScriptChips([]);
    emit("form_started", { formId: formIdFor(kind) });
    if (seed?.trim()) {
      addMessage({ id: uid(), role: "user", content: seed.trim() });
      // Ack the seed, then always prompt for the current COLLECT step (usually name).
      say(`${seedAckFor(kind)}\n\n${promptFor(state)}`);
    } else if (kind !== "default") {
      say(`${seedAckFor(kind)}\n\n${promptFor(state)}`);
    } else {
      say(promptFor(state));
    }
    queueMicrotask(() => inputRef.current?.focus());
  }

  function startWish() {
    if (busy || wish) return;
    beginFlow("default");
  }

  function startTeardownFromScript(seed?: string) {
    if (busy || wish) return;
    const message = seed?.trim() || dict.teardown.lumiSeed;
    beginFlow("teardown", message);
  }

  function cancelWish() {
    setWish(null);
    setScriptChips(getOpeningChips(locale));
    say(dict.genie.wishCancelled);
  }

  function undoLastAnswer() {
    if (!wish || !canUndoWish(wish) || busy || sending) return;
    const prev = undoWishFlow(wish);
    setWish(prev);
    say(dict.genie.wishUndoAck.replace("{field}", fieldLabel(prev.step)));
    inputRef.current?.focus();
  }

  function fieldLabel(step: WishState["step"]): string {
    switch (step) {
      case "name":
        return locale === "vi" ? "tên" : "name";
      case "email":
        return locale === "vi" ? "email" : "email";
      case "company":
        return locale === "vi" ? "công ty" : "company";
      case "url":
        return locale === "vi" ? "URL" : "URL";
      case "message":
        return locale === "vi" ? "nội dung" : "message";
      case "consent":
        return locale === "vi" ? "đồng ý" : "consent";
      default:
        return step;
    }
  }

  function resetConversation() {
    if (busy || sending) return;
    setWish(null);
    setInput("");
    seededKeyRef.current = null;
    resetStore();
    setScriptChips(getOpeningChips(locale));
  }

  function runScriptChip(chip: ScriptChip) {
    if (busy || wish) return;
    addMessage({ id: uid(), role: "user", content: chip.label });
    const reply = resolveScriptTopic(locale, chip.id);
    applyScriptReply(reply);
  }

  function applyScriptReply(reply: ReturnType<typeof resolveScriptTopic>) {
    if (reply.startWish) {
      beginFlow("default", reply.seedMessage ?? null, { force: true });
      return;
    }
    if (reply.startTeardown) {
      startTeardownFromScript(reply.seedMessage);
      return;
    }
    if (reply.startPartnership) {
      beginFlow("partnership", reply.seedMessage ?? null, { force: true });
      return;
    }
    if (reply.startCareers) {
      beginFlow("careers", reply.seedMessage ?? null, { force: true });
      return;
    }
    if (reply.startContact) {
      beginFlow("contact", reply.seedMessage ?? null, { force: true });
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
    // Seeded wish already holds the message: skip re-asking it, keep history.
    if (state.step === "message" && state.draft.message) {
      const skip: WishState = {
        step: "consent",
        draft: state.draft,
        kind: state.kind,
        history: state.history,
      };
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
    const leadSource =
      basePayload.source === "teardown" ||
      basePayload.source === "partnership" ||
      basePayload.source === "careers"
        ? basePayload.source
        : "lumi-chat";
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
    // Free-text is only for COLLECT mode (active wish flow) on steps that need typing.
    if (!wish || wish.step === "consent" || wish.step === "done") return;
    const text = input.trim();
    if (!text || busy || sending) return;
    setInput("");
    feedWish(text);
  }

  /** COLLECT = info-capture only. SCRIPTED = all pre-LLM consult chat (chips). */
  const isCollectMode = Boolean(wish);
  const consentStep = wish?.step === "consent";
  const needsFreeText =
    isCollectMode && wish != null && wish.step !== "consent" && wish.step !== "done";
  const chipOnlyStep = isCollectMode && !needsFreeText;
  const inputDisabled = busy || sending || !needsFreeText;

  return (
    <div className="cs-genie-root" role="presentation">
      <button
        type="button"
        className="cs-genie-backdrop"
        aria-label={dict.genie.close}
        onClick={() => setOpen(false)}
      />

      {/*
        Option A: painted smoke-cloud art shell + freehand golden edge energy.
        Art sits behind chrome; soft content overlay keeps text readable.
        3D Lumi (GenieScene) orbits outside and beams into the cloud.
      */}
      <div className="cs-genie-stage">
        {/* Painted cloud shell — v3 cache-bust; full-bleed smoke mass */}
        <picture className="cs-genie-cloud-art-wrap" aria-hidden="true">
          <source srcSet="/brand/lumi-cloud.webp?v=5" type="image/webp" />
          <img
            className="cs-genie-cloud-art"
            src="/brand/lumi-cloud.png?v=5"
            alt=""
            width={1152}
            height={864}
            decoding="async"
            draggable={false}
          />
        </picture>

        {/*
          Soft ambient rim on the cloud (not a closed oval “portal” stroke).
          Open wisps only — never a full ring that reads as fake UI chrome.
        */}
        <div className="cs-genie-energy-ambient" aria-hidden="true" />
        <svg
          className="cs-genie-energy-svg"
          viewBox="0 0 560 720"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <defs>
            <linearGradient id="csGenieGoldA" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#fffef5" stopOpacity="0.95" />
              <stop offset="50%" stopColor="#f4ba17" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#c07008" stopOpacity="0.55" />
            </linearGradient>
            <filter id="csGenieGlow" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="3.5" result="b" />
              <feMerge>
                <feMergeNode in="b" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Brief open wisps only — deliberately short so they never form a ring */}
          <path
            className="cs-genie-energy-stroke cs-genie-energy-stroke-a"
            d="M 40 240 C 28 300, 38 360, 55 410"
            fill="none"
            stroke="url(#csGenieGoldA)"
            filter="url(#csGenieGlow)"
          />
          <path
            className="cs-genie-energy-stroke cs-genie-energy-stroke-b"
            d="M 520 220 C 540 290, 535 360, 515 420"
            fill="none"
            stroke="url(#csGenieGoldA)"
            filter="url(#csGenieGlow)"
          />
          <path
            className="cs-genie-energy-stroke cs-genie-energy-stroke-c"
            d="M 180 55 C 250 38, 320 42, 390 65"
            fill="none"
            stroke="url(#csGenieGoldA)"
            filter="url(#csGenieGlow)"
          />
          <path
            className="cs-genie-energy-stroke cs-genie-energy-stroke-d"
            d="M 160 660 C 240 685, 330 682, 410 655"
            fill="none"
            stroke="url(#csGenieGoldA)"
            filter="url(#csGenieGlow)"
          />
        </svg>
        <span className="cs-genie-energy-spark s1" aria-hidden="true" />
        <span className="cs-genie-energy-spark s2" aria-hidden="true" />
        <span className="cs-genie-energy-spark s3" aria-hidden="true" />
        <span className="cs-genie-energy-spark s4" aria-hidden="true" />

        <section
          className="cs-genie cs-genie-cloud cs-no-print clarity-mask"
          data-clarity-mask="true"
          role="dialog"
          aria-label={dict.genie.title}
          aria-modal="true"
        >
          {/* Soft-edge mask kills hard rect card corners */}
          <div className="cs-genie-cloud-inner">
            <div className="cs-genie-head">
              <span className="cs-genie-title">
                <Icon name="sparkle" size="sm" /> {dict.genie.title}
              </span>
              <div className="cs-genie-head-actions">
                {chatStarted && (
                  <button
                    className="cs-genie-reset"
                    type="button"
                    onClick={resetConversation}
                    disabled={busy || sending}
                  >
                    {dict.genie.resetChat}
                  </button>
                )}
                <button
                  className="cs-genie-close"
                  type="button"
                  aria-label={dict.genie.close}
                  onClick={() => setOpen(false)}
                >
                  <Icon name="close" size="sm" strokeWidth={2} />
                </button>
              </div>
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
                const visibleContent = formatGenieDisplayText(m.content);
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

            {!isLeadCaptured && (
              <div className="cs-genie-chips">
                {!wish &&
                  scriptChips.map((chip) => (
                    <button
                      key={`${chip.id}-${chip.label}`}
                      type="button"
                      className={`cs-genie-chip${
                        chip.id === "wish" ||
                        chip.id === "teardown_flow" ||
                        chip.id === "mvp_flow" ||
                        chip.id === "book_call_flow" ||
                        chip.id === "book_call" ||
                        chip.id === "mvp_start" ||
                        chip.id === "fortune" ||
                        chip.id === "quiz_start"
                          ? " cs-genie-chip-gold"
                          : ""
                      }`}
                      onClick={() => runScriptChip(chip)}
                      disabled={busy}
                    >
                      {(chip.id === "wish" ||
                        chip.id === "fortune" ||
                        chip.id === "quiz_start" ||
                        chip.id === "mvp_start" ||
                        chip.id === "book_call") && (
                        <Icon name="sparkle" size="sm" />
                      )}
                      {chip.label}
                    </button>
                  ))}
                {wish && consentStep && (
                  <button
                    type="button"
                    className="cs-genie-chip cs-genie-chip-gold"
                    onClick={submitWish}
                    disabled={busy}
                  >
                    {dict.genie.wishAgree}
                  </button>
                )}
                {wish && !consentStep && isOptionalStep(wish.step, wish.kind) && (
                  <button type="button" className="cs-genie-chip" onClick={() => feedWish("")} disabled={busy}>
                    {dict.genie.wishSkip}
                  </button>
                )}
                {canUndo && (
                  <button type="button" className="cs-genie-chip" onClick={undoLastAnswer} disabled={busy}>
                    {dict.genie.wishUndo}
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
              <div className="cs-genie-done-banner">
                <p className="cs-eyebrow" style={{ color: "var(--cs-color-primary)", marginBottom: "var(--cs-space-sm)" }}>
                  {locale === "vi" ? "Đã ghi nhận" : "Details captured"}
                </p>
                <p style={{ margin: 0, fontSize: "var(--cs-text-sm)" }}>
                  {locale === "vi"
                    ? "Cảm ơn bạn. Đội ngũ sẽ gửi email lại trong một ngày làm việc."
                    : "Thank you. Our team will email you within one business day."}
                </p>
              </div>
            ) : (
              <>
                {/*
                  No permanent dual footer (consent + mode-hint) under chips —
                  reclaim height for ~3 bubble rows. Consent lives on the COLLECT
                  consent step only; Privacy remains in the site footer.
                */}
                {consentStep && (
                  <p className="cs-genie-consent">
                    {dict.genie.consent}{" "}
                    <a href={`/${locale}/privacy`} target="_blank" rel="noopener noreferrer">
                      {dict.footer.privacy}
                    </a>
                  </p>
                )}
                {needsFreeText && (
                  <form className="cs-genie-form" onSubmit={send}>
                    <input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder={dict.genie.placeholder}
                      aria-label={dict.genie.placeholder}
                      disabled={inputDisabled}
                      maxLength={4000}
                      autoComplete="off"
                      inputMode={
                        wish?.step === "email"
                          ? "email"
                          : wish?.step === "url"
                            ? "url"
                            : "text"
                      }
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
                )}
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
