/* @vitest-environment happy-dom */

import { act, cleanup, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import {
  clearStoredFormPrefill,
  FORM_PREFILL_STORAGE_KEY,
  FORM_PREFILL_TTL_MS,
  readStoredFormPrefill,
  useFormPrefill,
  writeStoredFormPrefill,
} from '../use-form-prefill';

describe('FR-A11Y-010 useFormPrefill', () => {
  const storage = new Map<string, string>();

  beforeEach(() => {
    storage.clear();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: () => storage.clear(),
        getItem: (key: string) => storage.get(key) ?? null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });
    vi.spyOn(Date, 'now').mockReturnValue(new Date('2026-05-18T00:00:00Z').getTime());
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test('returns null prefill when no storage exists', () => {
    const { result } = renderHook(() => useFormPrefill('buy'));
    expect(result.current.prefill).toBeNull();
    expect(result.current.showBanner).toBe(false);
  });

  test('returns stored data when fresh and shows consent banner', async () => {
    window.localStorage.setItem(
      FORM_PREFILL_STORAGE_KEY,
      JSON.stringify({
        contact_email: 'alex@example.com',
        contact_name: 'Alex Tran',
        expires_at: Date.now() + 60_000,
      }),
    );

    const { result } = renderHook(() => useFormPrefill('partner'));

    await waitFor(() => expect(result.current.prefill?.contact_email).toBe('alex@example.com'));
    expect(result.current.showBanner).toBe(true);
  });

  test('expires after 24 hours and removes stale storage', () => {
    window.localStorage.setItem(
      FORM_PREFILL_STORAGE_KEY,
      JSON.stringify({ contact_email: 'old@example.com', expires_at: Date.now() - 1 }),
    );

    expect(readStoredFormPrefill()).toBeNull();
    expect(window.localStorage.getItem(FORM_PREFILL_STORAGE_KEY)).toBeNull();
  });

  test('clearPrefill removes storage and hides the banner', async () => {
    writeStoredFormPrefill({ contact_email: 'alex@example.com', source: 'buy' });
    const { result } = renderHook(() => useFormPrefill('join'));

    await waitFor(() => expect(result.current.showBanner).toBe(true));
    act(() => result.current.clearPrefill());

    expect(window.localStorage.getItem(FORM_PREFILL_STORAGE_KEY)).toBeNull();
    expect(result.current.prefill).toBeNull();
    expect(result.current.showBanner).toBe(false);
  });

  test('savePrefill persists merged data with a 24-hour expiry', () => {
    const { result } = renderHook(() => useFormPrefill('buy'));

    act(() => {
      result.current.savePrefill({
        contact_email: 'buyer@example.com',
        contact_name: 'Buyer Person',
        organization: 'Acme Studio',
      });
    });

    const stored = JSON.parse(window.localStorage.getItem(FORM_PREFILL_STORAGE_KEY) ?? '{}');
    expect(stored).toMatchObject({
      contact_email: 'buyer@example.com',
      contact_name: 'Buyer Person',
      organization: 'Acme Studio',
      source: 'buy',
    });
    expect(stored.expires_at).toBe(Date.now() + FORM_PREFILL_TTL_MS);
  });

  test('standalone clear helper is safe when storage has data', () => {
    writeStoredFormPrefill({ contact_email: 'clear@example.com', source: 'accessibility' });
    clearStoredFormPrefill();
    expect(readStoredFormPrefill()).toBeNull();
  });
});
