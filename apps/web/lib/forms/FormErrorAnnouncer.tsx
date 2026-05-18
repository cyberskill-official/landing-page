'use client';

import React, { useEffect, useRef } from 'react';
import { useFormContext } from 'react-hook-form';
import type { Locale } from '@/lib/i18n';
import { errorMessages } from './use-a11y-form';
import { currentDocumentLocale, resolveValidationMessage } from './validation-messages';

export function FormErrorAnnouncer({ locale }: { locale?: Locale }) {
  const {
    formState: { errors, isValid, submitCount },
  } = useFormContext();
  const liveRef = useRef<HTMLDivElement>(null);
  const previousErrorCountRef = useRef(0);
  const resolvedLocale = locale ?? currentDocumentLocale();

  useEffect(() => {
    const messages = errorMessages(errors);
    const errorCount = messages.length;
    const live = liveRef.current;
    if (!live) return;

    if (submitCount > 0 && errorCount > 0) {
      const firstError = resolveValidationMessage(messages[0], resolvedLocale);
      live.textContent = `Form has ${errorCount} ${errorCount === 1 ? 'error' : 'errors'}: ${firstError}`;
    } else if (previousErrorCountRef.current > 0 && isValid) {
      live.textContent = 'Error resolved';
    }

    previousErrorCountRef.current = errorCount;
  }, [errors, isValid, resolvedLocale, submitCount]);

  return <div ref={liveRef} aria-live="polite" aria-atomic="true" className="visually-hidden" data-form-error-announcer />;
}
