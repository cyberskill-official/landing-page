/**
 * TASK-OPS-013: Typed consent gate.
 *
 * Every optional (non-cookieless) tag MUST call `ConsentGate.canLoad(tag)`
 * before initialising. The gate defaults to `denied` for all categories.
 * A tag that skips this call should be caught by ESLint (no-unconsented-tag).
 *
 * Banner path: ConsentBanner persists a decision in localStorage (first-party,
 * functional preference only) and calls `decide()` / `hydrate()`. Analytics
 * loaders listen for `cs-consent-change` to load tags after Accept.
 *
 * See docs/decisions/consent-stance.md for the full decision record.
 */

export type ConsentCategory =
  | "analytics" // GA4, cookieless analytics that uses cookies
  | "session-replay" // Microsoft Clarity, FullStory
  | "marketing" // Meta Pixel, retargeting, marketing automation
  | "functional"; // Tags that are essential to UX (theme, language — always allowed)

export interface ConsentState {
  analytics: boolean;
  "session-replay": boolean;
  marketing: boolean;
  functional: boolean;
}

/** Categories the visitor can opt into via the banner (not functional). */
export type OptionalConsentCategory = Exclude<ConsentCategory, "functional">;

export const CONSENT_STORAGE_KEY = "cs-consent";
export const CONSENT_CHANGE_EVENT = "cs-consent-change";

/** Stored decision shape (localStorage only — not a third-party cookie). */
export type ConsentDecision = {
  version: 1;
  /** ISO timestamp when the visitor last decided. */
  decidedAt: string;
  /** Optional categories only. Absent keys mean undecided / denied. */
  choices: Partial<Record<OptionalConsentCategory, boolean>>;
};

// Default state: all optional tags denied.
const DEFAULT_STATE: ConsentState = {
  analytics: false,
  "session-replay": false,
  marketing: false,
  functional: true, // Functional is always allowed (theme, language prefs).
};

// In-memory state. Banner calls decide()/hydrate(); tests use _upgrade/_reset.
let _state: ConsentState = { ...DEFAULT_STATE };
/** True once hydrate() or decide() has applied a stored/explicit decision. */
let _decided = false;

function emitChange(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CONSENT_CHANGE_EVENT));
}

function readStoredDecision(): ConsentDecision | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CONSENT_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ConsentDecision;
    if (!parsed || parsed.version !== 1 || typeof parsed.choices !== "object") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

function writeStoredDecision(decision: ConsentDecision): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(decision));
  } catch {
    // Private mode / quota — in-memory state still applies for this session.
  }
}

function applyChoices(choices: Partial<Record<OptionalConsentCategory, boolean>>): void {
  _state = {
    ..._state,
    analytics: choices.analytics ?? false,
    "session-replay": choices["session-replay"] ?? false,
    marketing: choices.marketing ?? false,
    functional: true,
  };
}

export const ConsentGate = {
  /**
   * Returns true if the given category is allowed to load.
   * Every optional tag must call this before initialising.
   */
  canLoad(category: ConsentCategory): boolean {
    return _state[category];
  },

  /**
   * Returns the current consent state (read-only snapshot).
   */
  getState(): Readonly<ConsentState> {
    return { ..._state };
  },

  /**
   * True after hydrate() found a stored decision, or after decide().
   * Banner uses this to avoid re-prompting.
   */
  hasDecision(): boolean {
    return _decided;
  },

  /**
   * Apply a stored localStorage decision into the in-memory gate.
   * Safe to call on every client mount; no-op when nothing is stored.
   */
  hydrate(): boolean {
    const stored = readStoredDecision();
    if (!stored) return false;
    applyChoices(stored.choices);
    _decided = true;
    emitChange();
    return true;
  },

  /**
   * Record an explicit visitor decision (Accept / Decline).
   * Persists to localStorage and notifies analytics loaders.
   */
  decide(choices: Partial<Record<OptionalConsentCategory, boolean>>): void {
    const decision: ConsentDecision = {
      version: 1,
      decidedAt: new Date().toISOString(),
      choices: { ...choices },
    };
    applyChoices(decision.choices);
    _decided = true;
    writeStoredDecision(decision);
    emitChange();
  },

  /**
   * Upgrade the consent state without persisting (tests / advanced callers).
   * Prefer `decide()` from the consent banner so choice survives reloads.
   *
   * @internal
   */
  _upgrade(partial: Partial<ConsentState>): void {
    _state = { ..._state, ...partial, functional: true };
    emitChange();
  },

  /**
   * Reset to default denied state (used in tests / on session end).
   * Does not clear localStorage unless `clearStorage` is true.
   * @internal
   */
  _reset(clearStorage = false): void {
    _state = { ...DEFAULT_STATE };
    _decided = false;
    if (clearStorage && typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(CONSENT_STORAGE_KEY);
      } catch {
        // ignore
      }
    }
  },
} as const;
