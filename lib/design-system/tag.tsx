/**
 * Named re-export of the package Tag chip.
 *
 * Client boundary because Tag uses the package `useLang` hook for the optional
 * remove label. Static keyword tags omit `onRemove`.
 */
"use client";

export { Tag } from "@cyberskill/design";
export type { TagProps } from "@cyberskill/design";
