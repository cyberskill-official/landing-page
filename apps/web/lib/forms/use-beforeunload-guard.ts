'use client';

import { useEffect } from 'react';

export const SESSION_DRAFT_TTL_MS = 30 * 60 * 1000;

type DraftEnvelope<T> = {
  app_version: string;
  data: T;
  expires_at: number;
};

export function useBeforeunloadGuard(active: boolean) {
  useEffect(() => {
    if (!active) return;

    const handler = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [active]);
}

export function sessionDraftKey(track: string) {
  return `cyberskill_form_draft_${track}`;
}

function getSessionStorage() {
  try {
    return typeof window === 'undefined' ? null : window.sessionStorage;
  } catch {
    return null;
  }
}

function cookieValue(cookie: string, name: string) {
  for (const pair of cookie.split(';')) {
    const [rawKey, ...rawValue] = pair.split('=');
    if (rawKey?.trim() === name) return decodeURIComponent(rawValue.join('=').trim());
  }
  return undefined;
}

export function currentAppVersion(cookie = typeof document === 'undefined' ? '' : document.cookie) {
  return cookieValue(cookie, 'app_version') ?? process.env.NEXT_PUBLIC_APP_VERSION ?? 'dev';
}

export function readSessionDraft<T>(
  key: string,
  options: {
    appVersion?: string;
    now?: number;
    storage?: Storage | null;
  } = {},
) {
  const storage = options.storage ?? getSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(key);
    if (!raw) return null;

    const draft = JSON.parse(raw) as DraftEnvelope<T>;
    if (draft.app_version !== (options.appVersion ?? currentAppVersion())) {
      storage.removeItem(key);
      return null;
    }

    if (draft.expires_at <= (options.now ?? Date.now())) {
      storage.removeItem(key);
      return null;
    }

    return draft.data;
  } catch {
    storage.removeItem(key);
    return null;
  }
}

export function writeSessionDraft<T>(
  key: string,
  data: T,
  options: {
    appVersion?: string;
    now?: number;
    storage?: Storage | null;
  } = {},
) {
  const storage = options.storage ?? getSessionStorage();
  if (!storage) return;

  const now = options.now ?? Date.now();
  const draft: DraftEnvelope<T> = {
    app_version: options.appVersion ?? currentAppVersion(),
    data,
    expires_at: now + SESSION_DRAFT_TTL_MS,
  };

  try {
    storage.setItem(key, JSON.stringify(draft));
  } catch {
    // Draft persistence is best effort.
  }
}

export function clearSessionDraft(key: string, storage = getSessionStorage()) {
  storage?.removeItem(key);
}
