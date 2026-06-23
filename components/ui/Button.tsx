import type { ButtonHTMLAttributes } from "react";

// In-repo Button primitive (FR-DS-003). Emits the existing token-styled
// `.cs-btn` markup so adoption is a drop-in with no visual change and no
// external component dependency. Variants map to the `.cs-btn-*` classes.
type ButtonVariant = "primary" | "secondary" | "brand";

export function Button({
  variant = "primary",
  className,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const classes = ["cs-btn", `cs-btn-${variant}`, className].filter(Boolean).join(" ");
  return <button type={type} className={classes} {...rest} />;
}
