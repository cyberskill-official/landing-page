import { leadSchema, type LeadInput } from "@/lib/lead/schema";
import type { Locale } from "@/lib/i18n/config";
import { readUtm } from "@/lib/analytics/taxonomy";

// Conversational lead capture (FR-CHAR-026): a deterministic, keyless state
// machine that lets Lumi collect a wish IN the chat - name, email, optional
// company, the wish itself, then explicit consent - and submit it to the
// existing /api/lead endpoint. No LLM involved, so it works even when the
// AI proxy is unavailable; the panel wires it to bubbles and quick-reply
// chips. Pure and DOM-free for unit testing (tests/wish-flow.test.ts).
//
// Teardown mode (FR-CTA-019): same conversation pattern, but requires a product
// URL and posts with source "teardown" so weekly cap + Resend still apply.

export type WishKind = "default" | "teardown";

export type WishStep =
  | "name"
  | "email"
  | "company"
  | "url"
  | "message"
  | "consent"
  | "done";

export type WishDraft = {
  name?: string;
  email?: string;
  company?: string;
  url?: string;
  message?: string;
};

export type WishState = { step: WishStep; draft: WishDraft; kind: WishKind };

export type WishError = "required" | "invalid_email";

const DEFAULT_ORDER: WishStep[] = ["name", "email", "company", "message", "consent", "done"];
const TEARDOWN_ORDER: WishStep[] = ["name", "email", "url", "message", "consent", "done"];

function orderFor(kind: WishKind): WishStep[] {
  return kind === "teardown" ? TEARDOWN_ORDER : DEFAULT_ORDER;
}

export function startWishFlow(): WishState {
  return { step: "name", draft: {}, kind: "default" };
}

// Seed the flow with a wish already captured (typed in the hero). The panel then
// collects name/email and skips re-asking the message it already holds.
export function startWishFlowWith(message: string): WishState {
  const trimmed = message.trim().slice(0, 2000);
  return { step: "name", draft: trimmed ? { message: trimmed } : {}, kind: "default" };
}

/** Open Lumi into the free 15-point teardown funnel (source=teardown). */
export function startTeardownWishFlow(seedMessage?: string): WishState {
  const trimmed = seedMessage?.trim().slice(0, 2000) ?? "";
  return {
    step: "name",
    draft: trimmed ? { message: trimmed } : {},
    kind: "teardown",
  };
}

// Which steps accept an empty answer ("skip").
export function isOptionalStep(step: WishStep, kind: WishKind = "default"): boolean {
  if (step === "message") return true;
  if (step === "company" && kind === "default") return true;
  return false;
}

function next(kind: WishKind, step: WishStep): WishStep {
  const order = orderFor(kind);
  const i = order.indexOf(step);
  if (i < 0) return "done";
  return order[Math.min(i + 1, order.length - 1)];
}

// Feed one free-text answer into the flow. Returns the next state, or the
// same state plus an error key when the answer is rejected. The consent and
// done steps do not accept free text (consent is an explicit choice).
export function advanceWishFlow(
  state: WishState,
  input: string,
): { state: WishState; error?: WishError } {
  const value = input.trim();
  const kind = state.kind;
  switch (state.step) {
    case "name": {
      if (!value) return { state, error: "required" };
      return {
        state: {
          step: next(kind, "name"),
          draft: { ...state.draft, name: value.slice(0, 120) },
          kind,
        },
      };
    }
    case "email": {
      const parsed = leadSchema.shape.email.safeParse(value);
      if (!parsed.success) return { state, error: value ? "invalid_email" : "required" };
      return {
        state: {
          step: next(kind, "email"),
          draft: { ...state.draft, email: parsed.data },
          kind,
        },
      };
    }
    case "company": {
      return {
        state: {
          step: next(kind, "company"),
          draft: { ...state.draft, company: value.slice(0, 160) },
          kind,
        },
      };
    }
    case "url": {
      if (!value) return { state, error: "required" };
      const url = value.slice(0, 300);
      return {
        state: {
          step: next(kind, "url"),
          draft: { ...state.draft, url, company: url },
          kind,
        },
      };
    }
    case "message": {
      return {
        state: {
          step: next(kind, "message"),
          draft: {
            ...state.draft,
            message: value ? value.slice(0, 2000) : state.draft.message,
          },
          kind,
        },
      };
    }
    default:
      return { state };
  }
}

// Explicit consent resolution from the consent step's chips.
export function resolveConsent(state: WishState, agreed: boolean): WishState {
  if (state.step !== "consent") return state;
  return agreed ? { ...state, step: "done" } : state;
}

// Build the /api/lead payload once the flow reached "done". Returns null if
// anything mandatory is missing (defensive - the flow cannot normally get
// here without them).
export function wishFlowPayload(state: WishState, locale: Locale): LeadInput | null {
  if (state.step !== "done" || !state.draft.name || !state.draft.email) return null;
  if (state.kind === "teardown" && !state.draft.url) return null;

  const utm = typeof window !== "undefined" ? readUtm() : {};
  const candidate: LeadInput = {
    name: state.draft.name,
    email: state.draft.email,
    company: state.draft.company ?? state.draft.url ?? "",
    intent: "project",
    message: state.draft.message ?? "",
    consent: true,
    website: "",
    locale,
    source: state.kind === "teardown" ? "teardown" : "lumi-chat",
    url: state.draft.url ?? "",
    ...utm,
  };
  const parsed = leadSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}
