/**
 * Font CSS variables alias package family tokens in globals.css.
 *
 * Package faces load after first paint via DeferredFonts + synced
 * public/fonts/brand-fonts.css (font-display: optional rewrite of
 * `@cyberskill/design/tokens/fonts.css`). `<html>` uses `.cs-display-face` for
 * the display role — not next/font className tokens — and we never mutate CSS
 * variables after paint (field CLS).
 */

export const displayFont = {
  variable: "",
  className: "",
};

export const bodyFont = {
  variable: "",
  className: "",
};
