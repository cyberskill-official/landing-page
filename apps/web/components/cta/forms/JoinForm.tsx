'use client';

import React, { useEffect, useState, type ReactNode } from 'react';
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
import { useLumiFormReactions } from '@/lib/forms/use-lumi-form-reactions';
import {
  fallbackJoinRoles,
  joinDefaultValues,
  joinSchema,
  type AtsRole,
  type JoinFormData,
} from './schemas/join-schema';
import type { TrackFormProps } from '../tracks';

type JoinStatus = 'idle' | 'submitting' | 'success' | 'error_retry' | 'error_validation' | 'error_rate';
const draftKey = sessionDraftKey('join');

export function JoinForm({ onClose }: TrackFormProps & { defaultRoleId?: string }) {
  const [roles, setRoles] = useState<AtsRole[]>(fallbackJoinRoles);
  const [status, setStatus] = useState<JoinStatus>('idle');
  const [banner, setBanner] = useState('');
  const formPrefill = useFormPrefill('join');
  const formRetry = useFormRetry<Response>();
  const {
    formState: { errors, isDirty },
    handleSubmit,
    register,
    setError,
    setValue,
    watch,
  } = useForm<JoinFormData>({
    defaultValues: joinDefaultValues,
    mode: 'onBlur',
    resolver: zodResolver(joinSchema),
  });

  useBeforeunloadGuard(isDirty && status !== 'success');
  useLumiFormReactions({ currentStep: status === 'success' ? 2 : 1, submitStatus: status, track: 'join' });

  useEffect(() => {
    try {
      const draft = readSessionDraft<Partial<JoinFormData>>(draftKey);
      if (!draft) return;
      for (const [key, value] of Object.entries(draft)) {
        setValue(key as keyof JoinFormData, value as JoinFormData[keyof JoinFormData], { shouldDirty: true });
      }
    } catch {
      clearSessionDraft(draftKey);
    }
  }, [setValue]);

  useEffect(() => {
    const subscription = watch((values) => {
      writeSessionDraft(draftKey, values);
    });
    return () => subscription.unsubscribe();
  }, [watch]);

  useEffect(() => {
    if (!formRetry.state.message) return;
    setBanner(formRetry.state.message);
    setStatus(formRetry.state.status === 'failed' ? 'error_retry' : 'submitting');
  }, [formRetry.state.message, formRetry.state.status]);

  useEffect(() => {
    trackEvent('join_form_open', { source: 'cta_hub' });

    let cancelled = false;
    fetch('/api/jobs-count')
      .then((response) => response.json())
      .then((payload: { roles?: AtsRole[] }) => {
        if (cancelled) return;
        const nextRoles = payload.roles?.length ? payload.roles : fallbackJoinRoles;
        setRoles(nextRoles);
        if (nextRoles.length === 1 && nextRoles[0]) setValue('role_id', nextRoles[0].id, { shouldDirty: true, shouldValidate: true });
      })
      .catch(() => {
        if (!cancelled) setRoles(fallbackJoinRoles);
      });

    return () => {
      cancelled = true;
    };
  }, [setValue]);

  const applyStoredPrefill = () => {
    const data = formPrefill.applyPrefill();
    if (!data) return;
    if (data.contact_name) setValue('full_name', data.contact_name, { shouldDirty: true, shouldValidate: true });
    if (data.contact_email) setValue('email', data.contact_email, { shouldDirty: true, shouldValidate: true });
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

  const submit = handleSubmit(async (values) => {
    setStatus('submitting');
    setBanner('');

    try {
      const response = await formRetry.submit(() => fetch('/api/lead', {
        body: JSON.stringify({
          attribution_source: values.attribution_source,
          consent: true,
          contact_email: values.email,
          contact_name: values.full_name,
          cover_note: values.cover_note,
          idempotency_key: `join-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          locale: window.location.pathname.startsWith('/vi') ? 'vi' : 'en',
          portfolio_url: values.portfolio_url,
          role_id: values.role_id,
          scene_id: 'scene-6',
          track: 'join',
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
        contact_email: values.email,
        contact_name: values.full_name,
      });
      trackEvent('join_form_success', { source: 'cta_hub' });
      trackEvent('form_submit', { track: 'join', success: true });
      setStatus('success');
    } catch {
      setStatus('error_retry');
      setBanner('Submission failed after 3 attempts. Retry now.');
    }
  });

  const applyServerErrors = (serverErrors: Record<string, string[]> | undefined) => {
    if (!serverErrors) return;
    const map: Record<string, keyof JoinFormData> = {
      contact_email: 'email',
      contact_name: 'full_name',
      cover_note: 'cover_note',
      portfolio_url: 'portfolio_url',
      role_id: 'role_id',
    };
    for (const [key, messages] of Object.entries(serverErrors)) {
      const field = map[key] ?? (key as keyof JoinFormData);
      setError(field, { message: messages[0] ?? 'Invalid value.', type: 'server' });
    }
  };

  const close = () => {
    if (isDirty && status !== 'success' && !window.confirm('Discard the information you entered?')) return;
    onClose();
  };

  return (
    <div className="cta-modal-backdrop" data-cta-modal-backdrop>
      <section
        className="cta-modal cta-modal--join"
        role="dialog"
        aria-modal="true"
        aria-labelledby="join-form-title"
        aria-describedby="join-form-intro"
        data-cta-modal="join"
      >
        <div>
          <p className="cta-modal__eyebrow">join</p>
          <h3 id="join-form-title">Join the team</h3>
          <p id="join-form-intro">Tell us which senior craft lane you want to own. No resume upload required.</p>
        </div>

        <form className="cta-form cta-form-join" aria-busy={status === 'submitting' ? 'true' : 'false'} onSubmit={submit}>
          <div className="cta-form__honeypot" aria-hidden="true">
            <label htmlFor="join-hp-email">Leave this field empty</label>
            <input id="join-hp-email" name="hp_email" type="email" tabIndex={-1} autoComplete="off" />
          </div>

          {banner ? <StatusBanner status={status}>{banner}</StatusBanner> : null}

          {formPrefill.showBanner && status !== 'success' ? (
            <PrefillNotice onClear={formPrefill.clearPrefill} onUse={applyStoredPrefill} />
          ) : null}

          {status === 'success' ? (
            <div className="cta-step cta-confirmation" data-join-success role="status">
              <h4>Thanks.</h4>
              <p>Our team will be in touch within a week.</p>
            </div>
          ) : (
            <>
              <FormField label="Full name" error={errors.full_name?.message} inputProps={register('full_name')} autoComplete="name" />
              <FormField label="Email" error={errors.email?.message} inputProps={register('email')} autoComplete="email" type="email" />
              <label htmlFor="join-role">Role of interest</label>
              <select
                id="join-role"
                autoComplete="off"
                aria-invalid={Boolean(errors.role_id)}
                aria-describedby={errors.role_id ? 'join-role-error' : undefined}
                {...register('role_id')}
              >
                <option value="">Choose role</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.title} - {role.location}
                  </option>
                ))}
              </select>
              <FieldError id="join-role-error" message={errors.role_id?.message} />
              <FormField
                label="GitHub / portfolio URL"
                error={errors.portfolio_url?.message}
                inputProps={register('portfolio_url')}
                autoComplete="url"
                required={false}
                type="url"
              />
              <label htmlFor="join-cover-note">Cover note</label>
              <textarea
                id="join-cover-note"
                rows={5}
                maxLength={2000}
                aria-invalid={Boolean(errors.cover_note)}
                aria-describedby={errors.cover_note ? 'join-cover-note-error' : undefined}
                {...register('cover_note')}
              />
              <FieldError id="join-cover-note-error" message={errors.cover_note?.message} />
              <FormField
                label="How did you hear about us?"
                error={errors.attribution_source?.message}
                inputProps={register('attribution_source')}
                autoComplete="off"
                required={false}
              />
              <p className="cta-form__privacy">
                We'll store your application for 12 months per our <a href="/accessibility#privacy">privacy policy</a>. You can request deletion anytime.
              </p>
            </>
          )}

          <div className="cta-modal__actions">
            {status !== 'success' ? (
              <button type="submit" disabled={status === 'submitting'}>
                {status === 'submitting' ? 'Submitting...' : 'Submit application'}
              </button>
            ) : null}
            {status === 'error_retry' ? (
              <button type="button" onClick={() => void submit()}>
                Retry now
              </button>
            ) : null}
            <button type="button" onClick={close}>
              {status === 'success' ? 'Close' : 'Cancel'}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

export default JoinForm;

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
  const id = `join-${inputProps.name}`;
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

function StatusBanner({ children, status }: { children: ReactNode; status: JoinStatus }) {
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
