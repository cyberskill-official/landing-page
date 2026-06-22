import { createElement } from "react";
import { icons, type IconName } from "@/lib/icons";

// One renderer for the in-repo icon set (FR-DS-010). Size comes from --cs-icon-*
// tokens (sm/md/lg) and color inherits currentColor. Decorative by default
// (aria-hidden); pass `label` to expose a meaningful icon to assistive tech.
export function Icon({
  name,
  size = "md",
  label,
  className,
  strokeWidth = 1.75,
}: {
  name: IconName;
  size?: "sm" | "md" | "lg";
  label?: string;
  className?: string;
  strokeWidth?: number;
}) {
  const def = icons[name];
  const dim = `var(--cs-icon-${size})`;
  const a11y = label
    ? { role: "img", "aria-label": label }
    : { "aria-hidden": true as const, focusable: false as const };

  return (
    <svg
      className={className}
      viewBox={def.viewBox}
      style={{ width: dim, height: dim, display: "inline-block", flex: "none" }}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...a11y}
    >
      {def.els.map((el, i) => createElement(el.tag, { key: i, ...el.attrs }))}
    </svg>
  );
}
