/* @vitest-environment happy-dom */

import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { TimezoneClock } from '../TimezoneClock';

describe('FR-CTA-008 TimezoneClock', () => {
  beforeEach(() => {
    const storage = new Map<string, string>();
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: {
        clear: () => storage.clear(),
        getItem: (key: string) => storage.get(key) ?? null,
        removeItem: (key: string) => storage.delete(key),
        setItem: (key: string, value: string) => storage.set(key, value),
      },
    });
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-01-06T03:00:00.000Z'));
    window.localStorage.clear();
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  test('renders HCMC, visitor time, overlap, desk status, and schedule link', async () => {
    window.localStorage.setItem('cyberskill_tz_pref', 'Asia/Tokyo');

    render(<TimezoneClock locale="en" />);
    await act(async () => undefined);

    expect(document.getElementById('timezone-clock-detail')?.textContent).toContain('Asia/Tokyo.');
    expect(screen.getByText('HCMC')).toBeTruthy();
    expect(screen.getByText('Your zone')).toBeTruthy();
    expect(screen.getByText("We're at our desks")).toBeTruthy();
    expect(screen.getByText('5 hours of overlap with your afternoon')).toBeTruthy();
    expect(screen.getByRole('link', { name: 'Schedule with me' })).toHaveProperty(
      'href',
      'http://localhost:3000/?track=buy#cta-hub',
    );
  });

  test('updates the displayed minute on interval without announcing clock changes', async () => {
    window.localStorage.setItem('cyberskill_tz_pref', 'Asia/Singapore');

    render(<TimezoneClock locale="en" variant="compact" />);
    expect(screen.getByText('10:00')).toBeTruthy();

    act(() => {
      vi.advanceTimersByTime(60_000);
    });

    expect(screen.getByText('10:01')).toBeTruthy();
    expect(document.querySelector('.timezone-clock__times')?.getAttribute('aria-live')).toBe('off');
  });
});
