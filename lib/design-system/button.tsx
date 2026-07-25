/**
 * Named re-export of the package Button.
 *
 * `@cyberskill/design` resolves to its bundler-native React entry
 * (`_esm/react.mjs`, added in design-system #33), so this is the official
 * package export — no alias to a raw `.jsx` file. React/react-dom are peer
 * dependencies. Styles come from `app/cs-package.css` (package tokens + base;
 * fonts stay on DeferredFonts).
 */
export { Button as DesignSystemButton } from "@cyberskill/design";
export type { ButtonProps as DesignSystemButtonProps } from "@cyberskill/design";
