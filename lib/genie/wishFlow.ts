import { leadSchema, type LeadInput } from "@/lib/lead/schema";
import type { Locale } from "@/lib/i18n/config";

// Conversational lead capture (FR-CHAR-026): a deterministic, keyless state
// machine that lets Lumi collect a wish IN the chat - name, email, optional
// company, the wish itself, then explicit consent - and submit it to the
// existing /api/lead endpoint. No LLM involved, so it works even when the
// AI proxy is unavailable; the panel wires it to bubbles and quick-reply
// chips. Pure and DOM-free for unit testing (tests/wish-flow.test.ts).

export type WishStep = "name" | "email" | "company" | "message" | "consent" | "done";

export type WishDraft = {
  name?: string;
  email?: string;
  company?: string;
  message?: string;
};

export type WishState = { step: WishStep; draft: WishDraft };

export type WishError = "required" | "invalid_email";

const ORDER: WishStep[] = ["name", "email", "company", "message", "consent", "done"];

export function startWishFlow(): WishState {
  return { step: "name", draft: {} };
}

// Which steps accept an empty answer ("skip").
export function isOptionalStep(step: WishStep): boolean {
  return step === "company" || step === "message";
}

function next(step: WishStep): WishStep {
  return ORDER[Math.min(ORDER.indexOf(step) + 1, ORDER.length - 1)];
}

// Feed one free-text answer into the flow. Returns the next state, or the
// same state plus an error key when the answer is rejected. The consent and
// done steps do not accept free text (consent is an explicit choice).
export function advanceWishFlow(
  state: WishState,
  input: string,
): { state: WishState; error?: WishError } {
  const value = input.trim();
  switch (state.step) {
    case "name": {
      if (!value) return { state, error: "required" };
      return { state: { step: next("name"), draft: { ...state.draft, name: value.slice(0, 120) } } };
    }
    case "email": {
      const parsed = leadSchema.shape.email.safeParse(value);
      if (!parsed.success) return { state, error: value ? "invalid_email" : "required" };
      return { state: { step: next("email"), draft: { ...state.draft, email: parsed.data } } };
    }
    case "company": {
      return {
        state: { step: next("company"), draft: { ...state.draft, company: value.slice(0, 160) } },
      };
    }
    case "message": {
      return {
        state: { step: next("message"), draft: { ...state.draft, message: value.slice(0, 2000) } },
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
  const candidate: LeadInput = {
    name: state.draft.name,
    email: state.draft.email,
    company: state.draft.company ?? "",
    intent: "project",
    message: state.draft.message ?? "",
    consent: true,
    website: "",
    locale,
    source: "lumi-chat",
  };
  const parsed = leadSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}
