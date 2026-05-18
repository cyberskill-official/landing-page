import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MuteToggle } from '../../components/a11y/MuteToggle';
import {
  MUTE_PREF_KEY,
  mutePreferenceToMuted,
  mutedToMutePreference,
  useAudioStore,
} from '../../lib/stores/audioStore';

function stubLocalStorage() {
  const values = new Map<string, string>();
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => values.get(key) ?? null,
    setItem: (key: string, value: string) => {
      values.set(key, value);
    },
    removeItem: (key: string) => {
      values.delete(key);
    },
  });
  return values;
}

describe('FR-A11Y-004 mute toggle', () => {
  beforeEach(() => {
    useAudioStore.setState({ audioContext: null, muted: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('renders default muted toggle semantics before client enhancement', () => {
    const markup = renderToStaticMarkup(createElement(MuteToggle));

    expect(markup).toContain('type="button"');
    expect(markup).toContain('aria-pressed="true"');
    expect(markup).toContain('data-mute-toggle="true"');
    expect(markup).toContain('Muted');
    expect(markup).toContain('data-mute-toggle-status="true"');
    expect(markup).toContain('aria-live="polite"');
  });

  test('coerces storage values to muted-by-default semantics', () => {
    expect(mutePreferenceToMuted(null)).toBe(true);
    expect(mutePreferenceToMuted('bad')).toBe(true);
    expect(mutePreferenceToMuted('on')).toBe(true);
    expect(mutePreferenceToMuted('off')).toBe(false);
    expect(mutedToMutePreference(true)).toBe('on');
    expect(mutedToMutePreference(false)).toBe('off');
  });

  test('store writes exact localStorage preference values', () => {
    const values = stubLocalStorage();

    useAudioStore.getState().setMuted(false, { resume: false });
    expect(values.get(MUTE_PREF_KEY)).toBe('off');
    expect(useAudioStore.getState().muted).toBe(false);

    useAudioStore.getState().setMuted(true);
    expect(values.get(MUTE_PREF_KEY)).toBe('on');
    expect(useAudioStore.getState().muted).toBe(true);
  });
});
