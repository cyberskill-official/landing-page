/**
 * Next-safe re-export of the package Button.
 *
 * `@cyberskill/design` main export (`_esm/cs.mjs`) is a browser UMD bridge
 * (injects React 18 from unpkg + `_ds_bundle.js`). That path is not SSR-safe
 * for this Next 16 / React 19 app. Package `exports` also omit `components/*`.
 *
 * Webpack/Turbopack alias `@cyberskill/design/button` → the published
 * `components/button/Button.jsx` (same tarball). Styles come from
 * `app/cs-package.css` (package tokens + base; fonts stay on DeferredFonts).
 */
export { Button as DesignSystemButton } from "@cyberskill/design/button";
export type { ButtonProps as DesignSystemButtonProps } from "@cyberskill/design/button";
