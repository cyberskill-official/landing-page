/** @vitest-environment happy-dom */
import { describe, expect, test, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import {
  clearSessionDraft,
  readSessionDraft,
  sessionDraftKey,
  useBeforeunloadGuard,
  writeSessionDraft,
} from '../use-beforeunload-guard';
import { FORM_RETRY_DELAYS_MS, submitWithRetry } from '../use-form-retry';

function memoryStorage(): Storage {
  const data = new Map<string, string>();
  return {
    clear: () => data.clear(),
    getItem: (key) => data.get(key) ?? null,
    key: (index) => Array.from(data.keys())[index] ?? null,
    get length() {
      return data.size;
    },
    removeItem: (key) => {
      data.delete(key);
    },
    setItem: (key, value) => {
      data.set(key, value);
    },
  };
}

describe('use-form-retry helpers', () => {
  test('returns success on the first attempt', async () => {
    const submit = vi.fn().mockResolvedValue(new Response('{}', { status: 200 }));

    const response = await submitWithRetry(submit, { sleepFn: vi.fn() });

    expect(response?.ok).toBe(true);
    expect(submit).toHaveBeenCalledTimes(1);
  });

  test('retries 5xx responses with exponential delays', async () => {
    const states: string[] = [];
    const sleepFn = vi.fn().mockResolvedValue(undefined);
    const submit = vi
      .fn()
      .mockResolvedValueOnce(new Response('{}', { status: 503 }))
      .mockResolvedValueOnce(new Response('{}', { status: 502 }))
      .mockResolvedValueOnce(new Response('{}', { status: 200 }));

    const response = await submitWithRetry(submit, {
      onState: (state) => states.push(state.message),
      sleepFn,
    });

    expect(response?.ok).toBe(true);
    expect(submit).toHaveBeenCalledTimes(3);
    expect(sleepFn).toHaveBeenNthCalledWith(1, FORM_RETRY_DELAYS_MS[0]);
    expect(sleepFn).toHaveBeenNthCalledWith(2, FORM_RETRY_DELAYS_MS[1]);
    expect(states).toContain('Network error. Retrying in 1 second...');
    expect(states).toContain('Network error. Retrying in 2 seconds...');
  });

  test('does not retry validation responses', async () => {
    const sleepFn = vi.fn();
    const submit = vi.fn().mockResolvedValue(new Response('{}', { status: 400 }));

    const response = await submitWithRetry(submit, { sleepFn });

    expect(response?.status).toBe(400);
    expect(submit).toHaveBeenCalledTimes(1);
    expect(sleepFn).not.toHaveBeenCalled();
  });

  test('does not retry AbortError user cancellations', async () => {
    const submit = vi.fn().mockRejectedValue(new DOMException('cancelled', 'AbortError'));

    const response = await submitWithRetry(submit, { sleepFn: vi.fn() });

    expect(response).toBeNull();
    expect(submit).toHaveBeenCalledTimes(1);
  });

  test('returns failed state after exhausted retries', async () => {
    const states: string[] = [];
    const submit = vi.fn().mockResolvedValue(new Response('{}', { status: 503 }));

    const response = await submitWithRetry(submit, {
      onState: (state) => states.push(state.message),
      sleepFn: vi.fn().mockResolvedValue(undefined),
    });

    expect(response?.status).toBe(503);
    expect(submit).toHaveBeenCalledTimes(3);
    expect(states.at(-1)).toBe('Submission failed after 3 attempts. Retry now.');
  });
});

describe('session draft helpers', () => {
  test('stores drafts for 30 minutes under the per-track key', () => {
    const storage = memoryStorage();
    const key = sessionDraftKey('partner');

    writeSessionDraft(key, { agency_name: 'Acme Studio' }, { appVersion: 'v1', now: 1000, storage });

    expect(readSessionDraft<{ agency_name: string }>(key, { appVersion: 'v1', now: 1001, storage })).toEqual({
      agency_name: 'Acme Studio',
    });
  });

  test('expires stale drafts and clears version mismatches', () => {
    const storage = memoryStorage();
    const key = sessionDraftKey('buy');

    writeSessionDraft(key, { company: 'Old Co' }, { appVersion: 'v1', now: 1000, storage });

    expect(readSessionDraft(key, { appVersion: 'v1', now: 1000 + 31 * 60 * 1000, storage })).toBeNull();
    expect(storage.getItem(key)).toBeNull();

    writeSessionDraft(key, { company: 'Old Co' }, { appVersion: 'v1', now: 1000, storage });
    expect(readSessionDraft(key, { appVersion: 'v2', now: 1001, storage })).toBeNull();
    expect(storage.getItem(key)).toBeNull();
  });

  test('clears drafts explicitly', () => {
    const storage = memoryStorage();
    const key = sessionDraftKey('join');

    writeSessionDraft(key, { role_id: 'eng' }, { appVersion: 'v1', now: 1000, storage });
    clearSessionDraft(key, storage);

    expect(storage.getItem(key)).toBeNull();
  });
});

describe('useBeforeunloadGuard', () => {
  test('registers a beforeunload warning only while active', () => {
    const addSpy = vi.spyOn(window, 'addEventListener');
    const removeSpy = vi.spyOn(window, 'removeEventListener');

    const { rerender, unmount } = renderHook(({ active }) => useBeforeunloadGuard(active), {
      initialProps: { active: false },
    });

    expect(addSpy).not.toHaveBeenCalledWith('beforeunload', expect.any(Function));

    rerender({ active: true });
    expect(addSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    unmount();
    expect(removeSpy).toHaveBeenCalledWith('beforeunload', expect.any(Function));

    addSpy.mockRestore();
    removeSpy.mockRestore();
  });
});
