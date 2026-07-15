"use client";

import { useId, type InputHTMLAttributes, type ReactNode } from "react";

// In-repo Field primitive (TASK-DS-003): label + input in the `.cs-field` grid,
// with the label programmatically tied to the input, an optional marker, and an
// error that is announced via aria-invalid + aria-describedby. Native semantics
// keep it keyboard operable and screen-reader correct.
export function Field({
  label,
  optional,
  error,
  id,
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { label: ReactNode; optional?: boolean; error?: string }) {
  const autoId = useId();
  const fieldId = id ?? autoId;
  const errorId = error ? `${fieldId}-error` : undefined;
  return (
    <div className="cs-field">
      <label htmlFor={fieldId}>
        {label}
        {optional ? <span className="cs-field-optional"> (optional)</span> : null}
      </label>
      <input id={fieldId} aria-invalid={error ? true : undefined} aria-describedby={errorId} {...rest} />
      {error ? (
        <span id={errorId} className="cs-field-error" role="alert">
          {error}
        </span>
      ) : null}
    </div>
  );
}
