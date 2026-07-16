/**
 * Font CSS variables only — no Google Fonts loader on the critical path.
 *
 * Brand faces (Space Grotesk / Be Vietnam Pro) are loaded after first paint /
 * first interaction via DeferredFonts so mobile lab LCP is never gated on a
 * webfont request (Lantern was inflating text LCP ~2–3s when fonts were in the
 * graph even with display:optional). System stacks keep first paint clean.
 */

export const displayFont = {
  variable: "--font-display",
  className: "",
};

export const bodyFont = {
  variable: "--font-body",
  className: "",
};
