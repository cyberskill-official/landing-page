"use client";

import { useId, type SelectHTMLAttributes, type ReactNode } from "react";

// In-repo Select primitive (FR-DS-003): a native <select> in the `.cs-field`
// grid with a linked label, optional marker, and error wiring. Native select
// keeps full keyboard operability and platform a11y for free.
export function Select({
  label,
  optional,
  error,
  id,
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { label: ReactNode; optional?: boolean; error?: string }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className="cs-field">
      <label htmlFor={fieldId}>
        {label}
        {optional ? <span className="cs-field-optional"> (optional)</span> : null}
      </label>
      <select id={fieldId} aria-invalid={error ? true : undefined} aria-describedby={errorId} {...rest}>
        {children}
      </select>
      {error ? (
        <span id={errorId} className="cs-field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
