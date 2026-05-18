'use client';

import { useCallback, useRef, useState } from 'react';

export const FORM_RETRY_DELAYS_MS = [1000, 2000, 4000] as const;
export const FORM_RETRY_MAX_ATTEMPTS = 3;

export type RetryableResponse = {
  ok: boolean;
  status: number;
};

export type FormRetryState = {
  attempt: number;
  maxAttempts: number;
  message: string;
  retryDelayMs: number | null;
  status: 'idle' | 'retrying' | 'failed' | 'cancelled';
};

const idleState: FormRetryState = {
  attempt: 0,
  maxAttempts: FORM_RETRY_MAX_ATTEMPTS,
  message: '',
  retryDelayMs: null,
  status: 'idle',
};

function isValidationResponse(response: RetryableResponse) {
  return response.status >= 400 && response.status < 500;
}

function isAbortError(error: unknown) {
  return error instanceof DOMException ? error.name === 'AbortError' : error instanceof Error && error.name === 'AbortError';
}

function sleep(ms: number) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

function retryingState(attempt: number, delay: number): FormRetryState {
  const seconds = Math.ceil(delay / 1000);
  return {
    attempt,
    maxAttempts: FORM_RETRY_MAX_ATTEMPTS,
    message: `Network error. Retrying in ${seconds} ${seconds === 1 ? 'second' : 'seconds'}...`,
    retryDelayMs: delay,
    status: 'retrying',
  };
}

function failedState(): FormRetryState {
  return {
    attempt: FORM_RETRY_MAX_ATTEMPTS,
    maxAttempts: FORM_RETRY_MAX_ATTEMPTS,
    message: 'Submission failed after 3 attempts. Retry now.',
    retryDelayMs: null,
    status: 'failed',
  };
}

export async function submitWithRetry<TResponse extends RetryableResponse>(
  submitFn: () => Promise<TResponse>,
  options: {
    onState?: (state: FormRetryState) => void;
    sleepFn?: (ms: number) => Promise<unknown>;
  } = {},
) {
  const sleepFn = options.sleepFn ?? sleep;

  for (let index = 0; index < FORM_RETRY_MAX_ATTEMPTS; index += 1) {
    try {
      const response = await submitFn();
      if (response.ok || isValidationResponse(response)) {
        options.onState?.(idleState);
        return response;
      }

      if (index < FORM_RETRY_MAX_ATTEMPTS - 1) {
        const delay = FORM_RETRY_DELAYS_MS[index] ?? FORM_RETRY_DELAYS_MS.at(-1)!;
        options.onState?.(retryingState(index + 1, delay));
        await sleepFn(delay);
        continue;
      }

      options.onState?.(failedState());
      return response;
    } catch (error) {
      if (isAbortError(error)) {
        options.onState?.({
          attempt: index + 1,
          maxAttempts: FORM_RETRY_MAX_ATTEMPTS,
          message: '',
          retryDelayMs: null,
          status: 'cancelled',
        });
        return null;
      }

      if (index < FORM_RETRY_MAX_ATTEMPTS - 1) {
        const delay = FORM_RETRY_DELAYS_MS[index] ?? FORM_RETRY_DELAYS_MS.at(-1)!;
        options.onState?.(retryingState(index + 1, delay));
        await sleepFn(delay);
        continue;
      }

      options.onState?.(failedState());
      return null;
    }
  }

  options.onState?.(failedState());
  return null;
}

export function useFormRetry<TResponse extends RetryableResponse>() {
  const [state, setState] = useState<FormRetryState>(idleState);
  const lastSubmitRef = useRef<(() => Promise<TResponse>) | null>(null);

  const submit = useCallback(async (submitFn: () => Promise<TResponse>) => {
    lastSubmitRef.current = submitFn;
    return submitWithRetry(submitFn, { onState: setState });
  }, []);

  const retryNow = useCallback(() => {
    if (!lastSubmitRef.current) return Promise.resolve(null);
    return submit(lastSubmitRef.current);
  }, [submit]);

  return {
    retryNow,
    state,
    submit,
  };
}
