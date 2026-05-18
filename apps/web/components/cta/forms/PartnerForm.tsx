'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import type { z } from 'zod';
import { trackEvent } from '@/lib/analytics';
import {
  clearSessionDraft,
  readSessionDraft,
  sessionDraftKey,
  useBeforeunloadGuard,
  writeSessionDraft,
} from '@/lib/forms/use-beforeunload-guard';
import { useFormPrefill } from '@/lib/forms/use-form-prefill';
import { useFormRetry } from '@/lib/forms/use-form-retry';
import { useLumiFormReactions } from '@/lib/forms/use-lumi-form-reactions';
import {
  partnerCountries,
  partnerDefaultValues,
  partnerSchema,
  partnerStepFields,
  partnerStepSchema,
  type PartnerFormData,
  type PartnerFormField,
  type PartnerStep,
} from './schemas/partner-schema';
import type { TrackFormProps } from '../tracks';

type SubmitStatus = 'idle' | 'submitting' | 'success' | 'error_retry' | 'error_validation' | 'error_rate';
const draftKey = sessionDraftKey('partner');

export function PartnerForm({ onClose }: TrackFormProps) {
  const [step, setStep] = useState<PartnerStep>(1);
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [banner, setBanner] = useState('');
  const formPrefill = useFormPrefill('partner');
  const formRetry = useFormRetry<Response>();
  const {
    clearErrors,
    formState: { errors, isDirty },
    getValues,
    register,
    setError,
    setValue,
    watch,
  } = useForm<PartnerFormData>({
    defaultValues: partnerDefaultValues,
    mode: 'onBlur',
  });

  useBeforeunloadGuard(isDirty && status !== 'success');
  useLumiFormReactions({ currentStep: step, submitStatus: status === 'submitting' ? 'submitting' : status, track: 'partner' });

  useEffect(() => {
    try {
      const draft = readSessionDraft<Partial<PartnerFormData> & { step?: PartnerStep }>(draftKey);
      if (!draft) return;
      for (const [key, value] of Object.entries(draft)) {
        if (key === 'step') continue;
        setValue(key as PartnerFormField, value as PartnerFormData[PartnerFormField], { shouldDirty: true });
      }
      if (draft.step && draft.step >= 1 && draft.step <= 3) setStep(draft.step);
    } catch {
      clearSessionDraft(draftKey);
    }
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((values) => {
      writeSessionDraft(draftKey, { ...values, step });
    });
    return () => subscription.unsubscribe();
  }, [step, watch]);

  useEffect(() => {
    if (!formRetry.state.message) return;
    setBanner(formRetry.state.message);
    setStatus(formRetry.state.status === 'failed' ? 'error_retry' : 'submitting');
  }, [formRetry.state.message, formRetry.state.status]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  const validateStep = (targetStep: PartnerStep) => {
    const schema = partnerStepSchema(targetStep);
    const result = schema.safeParse(getValues());
    applyZodErrors(result, targetStep);
    return result.success;
  };

  const applyStoredPrefill = () => {
    const data = formPrefill.applyPrefill();
    if (!data) return;
    if (data.organization) setValue('agency_name', data.organization, { shouldDirty: true, shouldValidate: true });
    if (data.country) setValue('country', data.country, { shouldDirty: true, shouldValidate: true });
    if (data.contact_email) setValue('contact_email', data.contact_email, { shouldDirty: true, shouldValidate: true });
    if (data.contact_name) setValue('contact_name', data.contact_name, { shouldDirty: true, shouldValidate: true });
  };

  const next = () => {
    if (!validateStep(step)) return;
    const nextStep = Math.min(3, step + 1) as PartnerStep;
    setStep(nextStep);
    setBanner('');
    trackEvent('form_step', { track: 'partner', step: `step-${nextStep}` });
  };

  const back = () => {
    setStep(Math.max(1, step - 1) as PartnerStep);
    setBanner('');
  };

  const submit = async () => {
    const parsed = partnerSchema.safeParse(getValues());
    applyZodErrors(parsed, 3);
    if (!parsed.success) {
      setStatus('error_validation');
      setBanner('Fix the highlighted fields and submit again.');
      return;
    }

    setStatus('submitting');
    setBanner('');

    try {
      const response = await formRetry.submit(() => fetch('/api/lead', {
        body: JSON.stringify({
          ...parsed.data,
          consent: true,
          idempotency_key: `partner-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          locale: window.location.pathname.startsWith('/vi') ? 'vi' : 'en',
          scene_id: 'scene-6',
          track: 'partner',
        }),
        headers: { 'content-type': 'application/json' },
        method: 'POST',
      }));

      if (!response) {
        setStatus('error_retry');
        setBanner('Submission failed after 3 attempts. Retry now.');
        return;
      }

      const payload = (await response.json().catch(() => ({ ok: false }))) as { errors?: Record<string, string[]>; ok?: boolean };

      if (response.status === 429) {
        setStatus('error_rate');
        setBanner('Hold up - too many submits. Wait 60 seconds.');
        return;
      }

      if (response.status >= 400 && response.status < 500) {
        setStatus('error_validation');
        applyServerErrors(payload.errors);
        setBanner('Fix the highlighted fields and submit again.');
        return;
      }

      if (!response.ok || !payload.ok) {
        setStatus('error_retry');
        setBanner(response.status >= 500 ? 'Submission failed after 3 attempts. Retry now.' : 'Network error. Retry now.');
        return;
      }

      clearSessionDraft(draftKey);
      formPrefill.savePrefill({
        contact_email: parsed.data.contact_email,
        contact_name: parsed.data.contact_name,
        country: parsed.data.country,
        organization: parsed.data.agency_name,
      });
      trackEvent('form_submit', { track: 'partner', success: true });
      setStatus('success');
      setStep(4);
    } catch {
      setStatus('error_retry');
      setBanner('Submission failed after 3 attempts. Retry now.');
    }
  };

  const close = () => {
    if (isDirty && status !== 'success' && !window.confirm('Discard draft?')) return;
    onClose();
  };

  const applyZodErrors = (result: z.SafeParseReturnType<unknown, unknown>, targetStep: PartnerStep) => {
    const fields = partnerStepFields(targetStep);
    for (const field of fields) clearErrors(field);
    if (result.success) return;

    for (const issue of result.error.issues) {
      const field = issue.path[0] as PartnerFormField | undefined;
      if (!field) continue;
      setError(field, { message: issue.message, type: 'zod' });
    }
    focusFirstInvalid();
  };

  const applyServerErrors = (serverErrors: Record<string, string[]> | undefined) => {
    if (!serverErrors) return;
    for (const [key, messages] of Object.entries(serverErrors)) {
      if (key in partnerDefaultValues) {
        setError(key as PartnerFormField, { message: messages[0] ?? 'Invalid value.', type: 'server' });
      }
    }
  };

  return (
    <div className="cta-modal-backdrop" data-cta-modal-backdrop>
      <section
        className="cta-modal cta-modal--partner"
        role="dialog"
        aria-modal="true"
        aria-labelledby="partner-form-title"
        aria-describedby="partner-form-intro"
        data-cta-modal="partner"
        data-partner-step={step}
      >
        <div>
          <p className="cta-modal__eyebrow">partner</p>
          <h3 id="partner-form-title">Partner with us</h3>
          <p id="partner-form-intro">A short agency intake for white-label and co-delivery opportunities.</p>
        </div>

        {step < 4 ? <Progress step={step} /> : null}

        <form
          className="cta-form cta-form-partner"
          aria-busy={status === 'submitting' ? 'true' : 'false'}
          data-dirty={isDirty ? 'true' : 'false'}
          data-testid="cta-form-partner"
          onSubmit={(event) => {
            event.preventDefault();
            if (step < 3) next();
            else void submit();
          }}
        >
          <div className="cta-form__honeypot" aria-hidden="true">
            <label htmlFor="partner-hp-email">Leave this field empty</label>
            <input id="partner-hp-email" name="hp_email" type="email" tabIndex={-1} autoComplete="off" />
          </div>

          {banner ? <StatusBanner status={status}>{banner}</StatusBanner> : null}

          {formPrefill.showBanner ? (
            <PrefillNotice onClear={formPrefill.clearPrefill} onUse={applyStoredPrefill} />
          ) : null}

          {step === 1 ? (
            <fieldset className="cta-step" data-partner-step-panel="1" disabled={status === 'submitting'}>
              <legend>Agency identity</legend>
              <FormField label="Agency name" error={errors.agency_name?.message} inputProps={register('agency_name')} autoComplete="organization" />
              <label htmlFor="partner-country">Country</label>
              <select
                id="partner-country"
                autoComplete="country"
                aria-invalid={Boolean(errors.country)}
                aria-describedby={errors.country ? 'partner-country-error' : undefined}
                {...register('country')}
              >
                <option value="">Choose country</option>
                {partnerCountries.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.label}
                  </option>
                ))}
              </select>
              <FieldError id="partner-country-error" message={errors.country?.message} />
              <FormField
                label="How did you hear about us?"
                error={errors.attribution_source?.message}
                inputProps={register('attribution_source')}
                autoComplete="off"
                required={false}
              />
            </fieldset>
          ) : null}

          {step === 2 ? (
            <fieldset className="cta-step" data-partner-step-panel="2" disabled={status === 'submitting'}>
              <legend>Engagement scope</legend>
              <FormField
                label="Monthly capacity needed"
                error={errors.monthly_capacity?.message}
                inputProps={register('monthly_capacity')}
                autoComplete="off"
                type="number"
              />
              <label htmlFor="partner-brief">Brief - what's the work?</label>
              <textarea
                id="partner-brief"
                rows={5}
                aria-invalid={Boolean(errors.brief)}
                aria-describedby={errors.brief ? 'partner-brief-error' : undefined}
                {...register('brief')}
              />
              <FieldError id="partner-brief-error" message={errors.brief?.message} />
            </fieldset>
          ) : null}

          {step === 3 ? (
            <fieldset className="cta-step" data-partner-step-panel="3" disabled={status === 'submitting'}>
              <legend>Contact details</legend>
              <FormField label="Contact email" error={errors.contact_email?.message} inputProps={register('contact_email')} autoComplete="email" type="email" />
              <FormField label="Contact name" error={errors.contact_name?.message} inputProps={register('contact_name')} autoComplete="name" />
            </fieldset>
          ) : null}

          {step === 4 ? (
            <div className="cta-step cta-confirmation" data-partner-step-panel="4" role="status">
              <h4>Thanks.</h4>
              <p>Our partner-success lead will respond in 24h.</p>
            </div>
          ) : null}

          <div className="cta-modal__actions">
            {step > 1 && step < 4 ? (
              <button type="button" onClick={back} disabled={status === 'submitting'}>
                Back
              </button>
            ) : null}
            {step < 3 ? (
              <button type="submit" disabled={status === 'submitting'}>
                Next
              </button>
            ) : null}
            {step === 3 ? (
              <button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Submitting...' : 'Submit'}
              </button>
            ) : null}
            {status === 'error_retry' ? (
              <button type="button" onClick={() => void submit()}>
                Retry now
              </button>
            ) : null}
            <button type="button" onClick={close}>
              {step === 4 ? 'Close' : 'Cancel'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default PartnerForm;

function Progress({ step }: { step: PartnerStep }) {
  return (
    <div className="cta-step-meter" aria-label={`Step ${step} of 3`} data-step-meter>
      <span>Step {step} of 3</span>
      <div aria-hidden="true">
        <i style={{ width: `${(Math.min(step, 3) / 3) * 100}%` }} />
      </div>
    </div>
  );
}

function FormField({
  autoComplete = 'off',
  error,
  inputProps,
  label,
  required = true,
  type = 'text',
}: {
  autoComplete?: string;
  error?: string;
  inputProps: UseFormRegisterReturn;
  label: string;
  required?: boolean;
  type?: string;
}) {
  const id = `partner-${inputProps.name}`;
  const errorId = `${id}-error`;
  return (
    <>
      <label htmlFor={id}>
        {label}
        {required ? null : <span className="cta-form__optional"> optional</span>}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      <FieldError id={errorId} message={error} />
    </>
  );
}

function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p className="field-error" id={id} role="alert">
      <span>!</span>
      {message}
    </p>
  );
}

function StatusBanner({ children, status }: { children: ReactNode; status: SubmitStatus }) {
  return (
    <p className={`cta-form__banner cta-form__banner--${status}`} role="alert">
      {children}
    </p>
  );
}

function PrefillNotice({ onClear, onUse }: { onClear: () => void; onUse: () => void }) {
  return (
    <div className="cta-form__prefill" role="region" aria-label="Prefill notice">
      <p>We saved your details from your last visit.</p>
      <div className="cta-form__prefill-actions">
        <button type="button" onClick={onUse}>
          Use them
        </button>
        <button type="button" onClick={onClear}>
          Clear
        </button>
      </div>
    </div>
  );
}

function focusFirstInvalid() {
  window.requestAnimationFrame(() => {
    document.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus();
  });
}
