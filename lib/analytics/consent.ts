/**
 * TASK-OPS-013: Typed consent gate.
 *
 * Every optional (non-cookieless) tag MUST call `ConsentGate.canLoad(tag)`
 * before initialising. The gate defaults to `denied` for all categories.
 * A tag that skips this call should be caught by ESLint (no-unconsented-tag).
 *
 * Current stance: no optional tags load (site is genuinely cookieless).
 * See docs/decisions/consent-stance.md for the full decision record.
 */

export type ConsentCategory =
  | "analytics"      // GA4, cookieless analytics that uses cookies
  | "session-replay" // Microsoft Clarity, FullStory
  | "marketing"      // Meta Pixel, retargeting, marketing automation
  | "functional";    // Tags that are essential to UX (theme, language — always allowed)

export interface ConsentState {
  analytics: boolean;
  "session-replay": boolean;
  marketing: boolean;
  functional: boolean;
}

// Default state: all optional tags denied.
const DEFAULT_STATE: ConsentState = {
  analytics: false,
  "session-replay": false,
  marketing: false,
  functional: true, // Functional is always allowed (theme, language prefs).
};

// In-memory state. A future consent banner will call `upgrade()` to update.
let _state: ConsentState = { ...DEFAULT_STATE };

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
   * Upgrade the consent state. Called by the consent banner when the visitor
   * explicitly accepts. Partial updates are merged; unmentioned categories
   * remain unchanged.
   *
   * This is intentionally NOT exported as a public API surface to prevent
   * accidental or adversarial calls. Only the consent banner component should
   * import and call this.
   *
   * @internal
   */
  _upgrade(partial: Partial<ConsentState>): void {
    _state = { ..._state, ...partial };
  },

  /**
   * Reset to default denied state (used in tests / on session end).
   * @internal
   */
  _reset(): void {
    _state = { ...DEFAULT_STATE };
  },
} as const;
