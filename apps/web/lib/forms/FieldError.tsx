'use client';

import React from 'react';
import { useFormContext, type FieldErrors } from 'react-hook-form';
import type { Locale } from '@/lib/i18n';
import { fieldError } from './use-a11y-form';
import { currentDocumentLocale, resolveValidationMessage } from './validation-messages';

export function FieldError({ name, locale }: { name: string; locale?: Locale }) {
  const {
    formState: { errors },
  } = useFormContext();
  const error = fieldError(errors as FieldErrors, name);
  if (!error?.message) return null;

  return (
    <p id={`${name}-error`} className="field-error" role="alert" data-field-error={name}>
      <span aria-hidden="true">!</span>
      {resolveValidationMessage(error.message, locale ?? currentDocumentLocale())}
    </p>
  );
}
