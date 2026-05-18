'use client';

import { useCallback, useEffect, useState } from 'react';

export const FORM_PREFILL_STORAGE_KEY = 'cyberskill_form_prefill';
export const FORM_PREFILL_TTL_MS = 24 * 60 * 60 * 1000;

export type FormPrefillSource = 'buy' | 'partner' | 'join' | 'accessibility';

export type StoredFormPrefill = {
  contact_email?: string;
  contact_name?: string;
  country?: string;
  expires_at: number;
  organization?: string;
  source?: FormPrefillSource;
};

export type FormPrefillInput = Omit<Partial<StoredFormPrefill>, 'expires_at'>;

function getStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  const storage = window.localStorage;
  if (
    !storage ||
    typeof storage.getItem !== 'function' ||
    typeof storage.setItem !== 'function' ||
    typeof storage.removeItem !== 'function'
  ) {
    return null;
  }
  return storage;
}

export function readStoredFormPrefill(now = Date.now()): StoredFormPrefill | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(FORM_PREFILL_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<StoredFormPrefill>;
    if (!parsed.expires_at || parsed.expires_at <= now) {
      storage.removeItem(FORM_PREFILL_STORAGE_KEY);
      return null;
    }

    return {
      contact_email: parsed.contact_email,
      contact_name: parsed.contact_name,
      country: parsed.country,
      expires_at: parsed.expires_at,
      organization: parsed.organization,
      source: parsed.source,
    };
  } catch {
    storage.removeItem(FORM_PREFILL_STORAGE_KEY);
    return null;
  }
}

export function writeStoredFormPrefill(data: FormPrefillInput, now = Date.now()) {
  const storage = getStorage();
  if (!storage) return null;

  const current = readStoredFormPrefill(now);
  const next: StoredFormPrefill = {
    ...current,
    ...removeEmptyValues(data),
    expires_at: now + FORM_PREFILL_TTL_MS,
  };

  try {
    storage.setItem(FORM_PREFILL_STORAGE_KEY, JSON.stringify(next));
    return next;
  } catch {
    return null;
  }
}

export function clearStoredFormPrefill() {
  const storage = getStorage();
  if (!storage) return;
  try {
    storage.removeItem(FORM_PREFILL_STORAGE_KEY);
  } catch {
    // Storage can be blocked. Clearing is best effort.
  }
}

export function useFormPrefill(formType: FormPrefillSource) {
  const [prefill, setPrefill] = useState<StoredFormPrefill | null>(null);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const stored = readStoredFormPrefill();
    setPrefill(stored);
    setShowBanner(Boolean(stored));
  }, [formType]);

  const applyPrefill = useCallback(() => {
    const stored = readStoredFormPrefill();
    setPrefill(stored);
    setShowBanner(false);
    return stored;
  }, []);

  const dismissPrefill = useCallback(() => {
    setShowBanner(false);
  }, []);

  const clearPrefill = useCallback(() => {
    clearStoredFormPrefill();
    setPrefill(null);
    setShowBanner(false);
  }, []);

  const savePrefill = useCallback(
    (data: FormPrefillInput) => {
      const next = writeStoredFormPrefill({ ...data, source: formType });
      setPrefill(next);
      setShowBanner(false);
      return next;
    },
    [formType],
  );

  return {
    applyPrefill,
    clearPrefill,
    dismissPrefill,
    prefill,
    savePrefill,
    showBanner,
  };
}

function removeEmptyValues(data: FormPrefillInput) {
  return Object.fromEntries(
    Object.entries(data).filter(([, value]) => typeof value === 'string' ? value.trim().length > 0 : value !== undefined),
  ) as FormPrefillInput;
}
