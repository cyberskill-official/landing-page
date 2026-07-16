/**
 * Font CSS variables are declared in globals.css (brand name + system stack).
 *
 * Brand faces load after first paint via DeferredFonts + public/fonts/brand-fonts.css
 * with font-display: optional. We intentionally do not set className tokens on
 * <html> (the old `--font-display --font-body` classes were no-ops that polluted
 * the DOM) and do not mutate CSS variables after paint (field CLS).
 */

export const displayFont = {
  variable: "",
  className: "",
};

export const bodyFont = {
  variable: "",
  className: "",
};
