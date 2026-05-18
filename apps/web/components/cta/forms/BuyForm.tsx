'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
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
import { useLumiFormReactions, type LumiFormSubmitStatus } from '@/lib/forms/use-lumi-form-reactions';
import { setEmissiveBoost } from '@/lib/stores';
import { CalendlyEmbed } from './CalendlyEmbed';
import {
  buyFormSchema,
  buyHelpTypeLabels,
  buyHelpTypes,
  buyLeadUseCase,
  defaultBuyFormValues,
  type BuyFormValues,
  type BuyHelpType,
} from './BuyFormSchema';
import type { TrackFormProps } from '../tracks';

const STEPS = ['help-type', 'about-you', 'pick-time', 'confirm'] as const;
type BuyStep = (typeof STEPS)[number];

const calendlyUrl = process.env.NEXT_PUBLIC_CALENDLY_DISCOVERY_URL ?? 'https://calendly.com/cyberskill/discovery';
const draftKey = sessionDraftKey('buy');

export default function BuyForm({ onClose }: TrackFormProps) {
  const [step, setStep] = useState<BuyStep>('help-type');
  const [scheduledSlot, setScheduledSlot] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [nextBusinessDay, setNextBusinessDay] = useState('the next business day');
  const formPrefill = useFormPrefill('buy');
  const formRetry = useFormRetry<Response>();
  const idempotencyKey = useRef(`buy-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const timeZone = useMemo(() => {
    try {
      return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
    } catch {
      return 'UTC';
    }
  }, []);
  const methods = useForm<BuyFormValues>({
    defaultValues: defaultBuyFormValues(timeZone),
    mode: 'onBlur',
    resolver: zodResolver(buyFormSchema),
  });

  const {
    formState: { errors, isDirty, isSubmitting },
    getValues,
    handleSubmit,
    register,
    setValue,
    trigger,
    watch,
  } = methods;

  useBeforeunloadGuard(isDirty && step !== 'confirm');
  useLumiFormReactions({
    currentStep: STEPS.indexOf(step) + 1,
    submitStatus: step === 'confirm' ? 'success' : submitError ? 'error' : (isSubmitting ? 'submitting' : 'idle') satisfies LumiFormSubmitStatus,
    track: 'buy',
  });

  useEffect(() => {
    try {
      const draft = readSessionDraft<Partial<BuyFormValues> & { step?: BuyStep }>(draftKey);
      if (!draft) return;
      for (const [key, value] of Object.entries(draft)) {
        if (key === 'step') continue;
        setValue(key as keyof BuyFormValues, value as BuyFormValues[keyof BuyFormValues], { shouldDirty: true });
      }
      if (draft.step && STEPS.includes(draft.step)) setStep(draft.step);
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
    if (formRetry.state.message) setSubmitError(formRetry.state.message);
  }, [formRetry.state.message]);

  useEffect(() => {
    if (step === 'help-type') setEmissiveBoost(0.3);
    if (step === 'about-you') setEmissiveBoost(0.6);
  }, [step]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      event.preventDefault();
      close();
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  });

  useEffect(() => {
    setNextBusinessDay(formatNextBusinessDay(new Date()));
  }, []);

  const close = () => {
    if (isDirty && step !== 'confirm' && !window.confirm('Discard the information you entered?')) return;
    onClose();
  };

  const goToAboutYou = async () => {
    const valid = await trigger('helpType');
    if (!valid) return;
    setStep('about-you');
    trackEvent('form_step', { track: 'buy', step: 'about-you' });
  };

  const applyStoredPrefill = () => {
    const data = formPrefill.applyPrefill();
    if (!data) return;
    if (data.contact_name) setValue('fullName', data.contact_name, { shouldDirty: true, shouldValidate: true });
    if (data.contact_email) setValue('email', data.contact_email, { shouldDirty: true, shouldValidate: true });
    if (data.organization) setValue('company', data.organization, { shouldDirty: true, shouldValidate: true });
  };

  const goToPickTime = async () => {
    const valid = await trigger(['fullName', 'company', 'role', 'email', 'timezone', 'description']);
    if (!valid) {
      focusFirstError();
      return;
    }
    setStep('pick-time');
    trackEvent('form_step', { track: 'buy', step: 'pick-time' });
  };

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError('');
    if (!scheduledSlot) {
      setSubmitError('Pick a Calendly slot before scheduling the call.');
      return;
    }

    const response = await formRetry.submit(() => fetch('/api/lead', {
      body: JSON.stringify({
        budget_range: 'tbd',
        consent: true,
        contact_email: values.email,
        contact_name: values.fullName,
        idempotency_key: idempotencyKey.current,
        locale: window.location.pathname.startsWith('/vi') ? 'vi' : 'en',
        scene_id: 'scene-6',
        scheduledSlot,
        step1: values.helpType,
        step2: {
          company: values.company,
          description: values.description ?? '',
          role: values.role,
          timezone: values.timezone,
        },
        track: 'buy',
        use_case: buyLeadUseCase(values, scheduledSlot),
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    }));

    if (!response) {
      setSubmitError('Submission failed after 3 attempts. Retry now.');
      return;
    }

    const payload = (await response.json().catch(() => ({ ok: false }))) as { ok?: boolean; error?: string };

    if (!response.ok || !payload.ok) {
      setSubmitError(
        response.status === 429
          ? 'Too many submits. Wait 60 seconds, then try again.'
          : response.status >= 500
            ? 'Submission failed after 3 attempts. Retry now.'
            : 'Submission failed. Try again.',
      );
      return;
    }

    clearSessionDraft(draftKey);
    formPrefill.savePrefill({
      contact_email: values.email,
      contact_name: values.fullName,
      organization: values.company,
    });
    trackEvent('form_submit', { track: 'buy', success: true });
    setStep('confirm');
  });

  const chooseHelpType = (helpType: BuyHelpType) => {
    setValue('helpType', helpType, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
  };

  return (
    <div className="cta-modal-backdrop" data-cta-modal-backdrop>
      <section
        className="cta-modal cta-modal--buy"
        role="dialog"
        aria-modal="true"
        aria-labelledby="buy-form-title"
        aria-describedby="buy-form-intro"
        data-cta-modal="buy"
        data-buy-step={step}
      >
        <div>
          <p className="cta-modal__eyebrow">buy</p>
          <h3 id="buy-form-title">Book a Discovery Call</h3>
          <p id="buy-form-intro">
            Three short steps: choose the work shape, add details, then pick a 30-minute slot.
          </p>
        </div>

        <ol className="cta-progress" aria-label="Buy form progress">
          {['What kind of help?', 'About you', 'Pick a time'].map((label, index) => {
            const currentIndex = Math.min(STEPS.indexOf(step), 2);
            return (
              <li key={label} aria-current={currentIndex === index ? 'step' : undefined} data-complete={currentIndex > index ? 'true' : 'false'}>
                <span>{index + 1}</span>
                {label}
              </li>
            );
          })}
        </ol>

        <form className="cta-form cta-form-buy" aria-busy={isSubmitting ? 'true' : 'false'} onSubmit={onSubmit}>
          <div className="cta-form__honeypot" aria-hidden="true">
            <label htmlFor="buy-hp-email">Leave this field empty</label>
            <input id="buy-hp-email" name="hp_email" type="email" tabIndex={-1} autoComplete="off" />
          </div>

          {formPrefill.showBanner ? (
            <PrefillNotice onClear={formPrefill.clearPrefill} onUse={applyStoredPrefill} />
          ) : null}

          {step === 'help-type' ? (
            <fieldset className="cta-step" data-buy-step-panel="help-type">
              <legend>What kind of help?</legend>
              <div className="cta-step__chips">
                {buyHelpTypes.map((helpType) => (
                  <button
                    key={helpType}
                    type="button"
                    className="cta-choice"
                    aria-pressed={watch('helpType') === helpType}
                    onClick={() => chooseHelpType(helpType)}
                  >
                    {buyHelpTypeLabels[helpType]}
                  </button>
                ))}
              </div>
              <FieldError message={errors.helpType?.message} id="buy-helpType-error" />
              <div className="cta-modal__actions">
                <button type="button" onClick={goToAboutYou}>
                  Next
                </button>
                <button type="button" onClick={close}>
                  Close
                </button>
              </div>
            </fieldset>
          ) : null}

          {step === 'about-you' ? (
            <fieldset className="cta-step" data-buy-step-panel="about-you">
              <legend>About you</legend>
              <BuyInput label="Full name" error={errors.fullName?.message} inputProps={register('fullName')} autoComplete="name" />
              <BuyInput label="Company name" error={errors.company?.message} inputProps={register('company')} autoComplete="organization" />
              <BuyInput label="Role" error={errors.role?.message} inputProps={register('role')} autoComplete="organization-title" />
              <BuyInput label="Work email" error={errors.email?.message} inputProps={register('email')} autoComplete="email" type="email" />
              <BuyInput label="Time zone" error={errors.timezone?.message} inputProps={register('timezone')} autoComplete="off" />
              <label htmlFor="buy-description">Brief project description</label>
              <textarea id="buy-description" rows={4} maxLength={280} aria-invalid={Boolean(errors.description)} {...register('description')} />
              <FieldError message={errors.description?.message} id="buy-description-error" />
              <div className="cta-modal__actions">
                <button type="button" onClick={() => setStep('help-type')}>
                  Back
                </button>
                <button type="button" onClick={goToPickTime}>
                  Continue
                </button>
              </div>
            </fieldset>
          ) : null}

          {step === 'pick-time' ? (
            <fieldset className="cta-step" data-buy-step-panel="pick-time">
              <legend>Pick a time</legend>
              <CalendlyEmbed
                url={calendlyUrl}
                prefill={{
                  customAnswers: {
                    a1: buyHelpTypeLabels[getValues('helpType')],
                    a2: getValues('company'),
                    a3: getValues('timezone'),
                  },
                  email: getValues('email'),
                  name: getValues('fullName'),
                }}
                onEventScheduled={setScheduledSlot}
              />
              <p className="cta-form__tip" data-scheduled-slot>
                {scheduledSlot ? 'Calendly slot received. You can schedule the call now.' : 'Choose a slot in Calendly to enable scheduling.'}
              </p>
              {submitError ? (
                <p className="field-error" role="alert">
                  <span>!</span>
                  {submitError}
                </p>
              ) : null}
              <div className="cta-modal__actions">
                <button type="button" onClick={() => setStep('about-you')}>
                  Back
                </button>
                <button type="submit" disabled={isSubmitting || formRetry.state.status === 'retrying' || !scheduledSlot}>
                  {isSubmitting || formRetry.state.status === 'retrying' ? 'Scheduling...' : 'Schedule call'}
                </button>
                {formRetry.state.status === 'failed' ? (
                  <button type="button" onClick={() => void onSubmit()} disabled={!scheduledSlot}>
                    Retry now
                  </button>
                ) : null}
              </div>
            </fieldset>
          ) : null}

          {step === 'confirm' ? (
            <div className="cta-step cta-confirmation" data-buy-step-panel="confirm" role="status">
              <h4>Booked.</h4>
              <p>We'll be in touch by {nextBusinessDay}. Watch your inbox for the calendar invite preview and context checklist.</p>
              <div className="cta-modal__actions">
                <button type="button" onClick={close}>
                  Close
                </button>
              </div>
            </div>
          ) : null}
        </form>
      </section>
    </div>
  );
}

function BuyInput({
  autoComplete,
  error,
  inputProps,
  label,
  type = 'text',
}: {
  autoComplete: string;
  error?: string;
  inputProps: UseFormRegisterReturn;
  label: string;
  type?: string;
}) {
  const id = `buy-${inputProps.name}`;
  const errorId = `${id}-error`;
  return (
    <>
      <label htmlFor={id}>{label}</label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        {...inputProps}
      />
      <FieldError message={error} id={errorId} />
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

function focusFirstError() {
  window.requestAnimationFrame(() => {
    const firstInvalid = document.querySelector<HTMLElement>('[aria-invalid="true"]');
    firstInvalid?.focus();
  });
}

function formatNextBusinessDay(now: Date) {
  const next = new Date(now);
  do {
    next.setDate(next.getDate() + 1);
  } while (next.getDay() === 0 || next.getDay() === 6);

  return new Intl.DateTimeFormat('en', {
    day: 'numeric',
    month: 'short',
    timeZone: 'Asia/Ho_Chi_Minh',
    weekday: 'long',
  }).format(next);
}
