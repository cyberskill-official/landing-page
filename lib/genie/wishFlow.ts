import { leadSchema, type LeadInput, type LeadIntent } from "@/lib/lead/schema";
import type { Locale } from "@/lib/i18n/config";
import { readUtm } from "@/lib/analytics/taxonomy";

// Conversational lead capture (TASK-CHAR-026): deterministic keyless state machine.
// Flow kinds map CTA entry points → intent/source for /api/lead.

export type WishKind =
  | "default"
  | "contact"
  | "teardown"
  | "partnership"
  | "careers";

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

export type WishState = {
  step: WishStep;
  draft: WishDraft;
  kind: WishKind;
  /** Snapshot stack for Undo (previous states after each successful advance). */
  history: Array<{ step: WishStep; draft: WishDraft }>;
};

export type WishError = "required" | "invalid_email";

const DEFAULT_ORDER: WishStep[] = ["name", "email", "company", "message", "consent", "done"];
const TEARDOWN_ORDER: WishStep[] = ["name", "email", "url", "message", "consent", "done"];
const PARTNERSHIP_ORDER: WishStep[] = ["name", "email", "company", "message", "consent", "done"];
const CAREERS_ORDER: WishStep[] = ["name", "email", "message", "consent", "done"];

function orderFor(kind: WishKind): WishStep[] {
  switch (kind) {
    case "teardown":
      return TEARDOWN_ORDER;
    case "partnership":
      return PARTNERSHIP_ORDER;
    case "careers":
      return CAREERS_ORDER;
    default:
      return DEFAULT_ORDER;
  }
}

function baseState(kind: WishKind, draft: WishDraft = {}): WishState {
  return { step: "name", draft, kind, history: [] };
}

export function startWishFlow(kind: WishKind = "default"): WishState {
  return baseState(kind);
}

export function startWishFlowWith(message: string, kind: WishKind = "default"): WishState {
  const trimmed = message.trim().slice(0, 2000);
  return baseState(kind, trimmed ? { message: trimmed } : {});
}

export function startTeardownWishFlow(seedMessage?: string): WishState {
  return startWishFlowWith(seedMessage ?? "", "teardown");
}

export function startPartnershipWishFlow(seedMessage?: string): WishState {
  return startWishFlowWith(seedMessage ?? "", "partnership");
}

export function startCareersWishFlow(seedMessage?: string): WishState {
  return startWishFlowWith(seedMessage ?? "", "careers");
}

export function startContactWishFlow(seedMessage?: string): WishState {
  return startWishFlowWith(seedMessage ?? "", "contact");
}

export function isOptionalStep(step: WishStep, kind: WishKind = "default"): boolean {
  if (step === "message") return true;
  if (step === "company" && kind !== "teardown") return true;
  return false;
}

function next(kind: WishKind, step: WishStep): WishStep {
  const order = orderFor(kind);
  const i = order.indexOf(step);
  if (i < 0) return "done";
  return order[Math.min(i + 1, order.length - 1)];
}

function pushHistory(state: WishState): Array<{ step: WishStep; draft: WishDraft }> {
  return [...state.history, { step: state.step, draft: { ...state.draft } }];
}

/** Undo last successful free-text advance (not consent). */
export function undoWishFlow(state: WishState): WishState {
  if (state.history.length === 0) return state;
  const history = [...state.history];
  const prev = history.pop()!;
  return {
    step: prev.step,
    draft: { ...prev.draft },
    kind: state.kind,
    history,
  };
}

export function canUndoWish(state: WishState | null): boolean {
  return Boolean(state && state.history.length > 0 && state.step !== "done");
}

export function advanceWishFlow(
  state: WishState,
  input: string,
): { state: WishState; error?: WishError } {
  const value = input.trim();
  const kind = state.kind;
  const hist = pushHistory(state);

  switch (state.step) {
    case "name": {
      if (!value) return { state, error: "required" };
      return {
        state: {
          step: next(kind, "name"),
          draft: { ...state.draft, name: value.slice(0, 120) },
          kind,
          history: hist,
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
          history: hist,
        },
      };
    }
    case "company": {
      return {
        state: {
          step: next(kind, "company"),
          draft: { ...state.draft, company: value.slice(0, 160) },
          kind,
          history: hist,
        },
      };
    }
    case "url": {
      if (!value) return { state, error: "required" };
      const url = value.slice(0, 300);
      return {
        state: {
          step: next(kind, "url"),
          draft: { ...state.draft, url, company: state.draft.company || url },
          kind,
          history: hist,
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
          history: hist,
        },
      };
    }
    default:
      return { state };
  }
}

export function resolveConsent(state: WishState, agreed: boolean): WishState {
  if (state.step !== "consent") return state;
  if (!agreed) return state;
  return {
    ...state,
    step: "done",
    history: pushHistory(state),
  };
}

function intentFor(kind: WishKind): LeadIntent {
  switch (kind) {
    case "partnership":
      return "partnership";
    case "careers":
      return "careers";
    default:
      return "project";
  }
}

function sourceFor(kind: WishKind): LeadSubmittedSource {
  switch (kind) {
    case "teardown":
      return "teardown";
    case "partnership":
      return "partnership";
    case "careers":
      return "careers";
    case "contact":
      return "lumi-chat";
    default:
      return "lumi-chat";
  }
}

type LeadSubmittedSource =
  | "contact-form"
  | "lumi-chat"
  | "synthetic"
  | "teardown"
  | "partnership"
  | "careers";

export function wishFlowPayload(state: WishState, locale: Locale): LeadInput | null {
  if (state.step !== "done" || !state.draft.name || !state.draft.email) return null;
  if (state.kind === "teardown" && !state.draft.url) return null;

  const utm = typeof window !== "undefined" ? readUtm() : {};
  const candidate: LeadInput = {
    name: state.draft.name,
    email: state.draft.email,
    company: state.draft.company ?? state.draft.url ?? "",
    intent: intentFor(state.kind),
    message: state.draft.message ?? "",
    consent: true,
    website: "",
    locale,
    source: sourceFor(state.kind),
    url: state.draft.url ?? "",
    ...utm,
  };
  const parsed = leadSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}
