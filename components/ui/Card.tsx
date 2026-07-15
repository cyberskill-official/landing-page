import type { HTMLAttributes } from "react";

// In-repo Card primitive (TASK-DS-003): a surface that picks a named Liquid Glass
// material (TASK-DS-004) by token, never inventing its own blur. Emits the
// existing `.cs-glass-card` / `.cs-surface-*` markup, so it is a drop-in.
type CardMaterial = "glass" | "whisper" | "light" | "standard" | "heavy" | "solid";

const MATERIAL_CLASS: Record<CardMaterial, string> = {
  glass: "cs-glass-card",
  whisper: "cs-surface-whisper",
  light: "cs-surface-light",
  standard: "cs-surface-standard",
  heavy: "cs-surface-heavy",
  solid: "cs-surface-solid",
};

export function Card({
  material = "glass",
  className,
  ...rest
}: HTMLAttributes<HTMLDivElement> & { material?: CardMaterial }) {
  const classes = [MATERIAL_CLASS[material], className].filter(Boolean).join(" ");
  return <div className={classes} {...rest} />;
}
