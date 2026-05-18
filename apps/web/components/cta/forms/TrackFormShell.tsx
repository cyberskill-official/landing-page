'use client';

import React, { useEffect, useState } from 'react';
import { FormProvider, useFormContext, type FieldValues, type Path } from 'react-hook-form';
import { trackEvent } from '@/lib/analytics';
import { FieldError } from '@/lib/forms/FieldError';
import { FormErrorAnnouncer } from '@/lib/forms/FormErrorAnnouncer';
import { useA11yForm } from '@/lib/forms/use-a11y-form';
import {
  ctaFormFields,
  ctaSchemas,
  defaultCtaValues,
  type CtaField,
} from '@/lib/forms/schemas/cta-schemas';
import type { TrackId, TrackFormProps } from '../tracks';

type TrackFormShellProps = TrackFormProps & {
  track: TrackId;
  title: string;
  intro: string;
};

export function TrackFormShell({ track, title, intro, onClose }: TrackFormShellProps) {
  const [submitted, setSubmitted] = useState(false);
  const methods = useA11yForm({
    schema: ctaSchemas[track],
    defaultValues: defaultCtaValues[track],
  });
  const fields = ctaFormFields[track];

  const close = () => {
    if (methods.formState.isDirty && !window.confirm('Discard the information you entered?')) return;
    onClose();
  };

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  const onValid = async () => {
    setSubmitted(true);
    trackEvent('form_submit', { track, success: true });
  };

  const onInvalid = () => {
    const firstField = Object.keys(methods.formState.errors)[0];
    trackEvent('form_error', {
      track,
      error_type: 'validation',
      ...(firstField ? { field: firstField } : {}),
    });
    methods.focusFirstError();
  };

  return (
    <div className="cta-modal-backdrop" data-cta-modal-backdrop>
      <section
        className="cta-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby={`cta-modal-${track}-title`}
        aria-describedby={`cta-modal-${track}-intro`}
        data-cta-modal={track}
      >
        <div>
          <p className="cta-modal__eyebrow">{track}</p>
          <h3 id={`cta-modal-${track}-title`}>{title}</h3>
          <p id={`cta-modal-${track}-intro`}>{intro}</p>
        </div>
        <FormProvider {...methods}>
          <form
            className="cta-form"
            data-cta-form={track}
            data-dirty={methods.formState.isDirty ? 'true' : 'false'}
            data-testid={`cta-form-${track}`}
            aria-busy={methods.formState.isSubmitting ? 'true' : 'false'}
            onSubmit={methods.handleSubmit(onValid, onInvalid)}
          >
            <FormErrorAnnouncer />
            <div className="cta-form__honeypot" aria-hidden="true">
              <label htmlFor={`cta-${track}-hp-email`}>Leave this field empty</label>
              <input id={`cta-${track}-hp-email`} name="hp_email" type="email" tabIndex={-1} autoComplete="off" />
            </div>
            {fields.map((field) => (
              <CtaFieldControl key={field.name} field={field} readonly={methods.formState.isSubmitting} />
            ))}
            {submitted ? (
              <p className="cta-form__success" role="status">
                Thanks. Your {track} details are validated and ready for the lead endpoint.
              </p>
            ) : null}
            <div className="cta-modal__actions">
              <button type="submit" disabled={methods.formState.isSubmitting}>
                {methods.formState.isSubmitting ? 'Submitting...' : 'Validate details'}
              </button>
              <button type="button" onClick={close}>
                Close
              </button>
            </div>
          </form>
        </FormProvider>
      </section>
    </div>
  );
}

function CtaFieldControl({ field, readonly }: { field: CtaField; readonly: boolean }) {
  const methods = useFormContext<FieldValues>();
  const name = field.name as Path<FieldValues>;
  const error = methods.formState.errors[field.name];
  const id = `cta-field-${field.name}`;
  const tipId = `${field.name}-tip`;
  const errorId = `${field.name}-error`;
  const invalid = Boolean(error);
  const describedBy = [tipId, invalid ? errorId : null].filter(Boolean).join(' ');
  const commonProps = {
    id,
    autoComplete: field.autocomplete,
    'aria-invalid': invalid,
    'aria-describedby': describedBy,
    readOnly: readonly,
    ...methods.register(name),
  };

  return (
    <div className="cta-form__field">
      <label htmlFor={id}>{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea rows={4} {...commonProps} />
      ) : field.type === 'select' ? (
        <select
          id={id}
          aria-invalid={invalid}
          aria-describedby={describedBy}
          disabled={readonly}
          autoComplete={field.autocomplete}
          {...methods.register(name)}
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input type={field.type} {...commonProps} />
      )}
      <p id={tipId} className="cta-form__tip">
        {field.tip}
      </p>
      <FieldError name={field.name} />
    </div>
  );
}
