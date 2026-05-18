// @vitest-environment happy-dom

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { setFocusedCta } from '@/lib/stores';
import { CtaHub } from '../CtaHub';
import { consumePendingCtaOpen, requestCtaOpen } from '../cta-events';

const trackEventMock = vi.fn();

vi.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
}));

vi.mock('@/lib/stores', () => ({
  setFocusedCta: vi.fn(),
}));

vi.mock('../CtaPortal', () => ({
  CtaPortal: ({
    track,
    onActivate,
    onFocusTrack,
    onBlurTrack,
  }: {
    track: { id: string; label: string };
    onActivate: (track: string) => void;
    onFocusTrack: (track: string) => void;
    onBlurTrack: () => void;
  }) => (
    <button
      id={`cta-portal-${track.id}`}
      type="button"
      data-cta-portal
      data-cta-track={track.id}
      onBlur={onBlurTrack}
      onClick={() => onActivate(track.id)}
      onFocus={() => onFocusTrack(track.id)}
    >
      {track.label}
    </button>
  ),
}));

vi.mock('../forms/BuyForm', () => ({
  default: ({ onClose }: { onClose: () => void }) => (
    <div role="dialog" data-cta-modal="buy">
      <h3>Book a Discovery Call</h3>
      <button type="button" onClick={onClose}>Close</button>
    </div>
  ),
}));

describe('FR-SCENE-011 CTA open event bridge', () => {
  beforeEach(() => {
    trackEventMock.mockClear();
    vi.mocked(setFocusedCta).mockClear();
    window.__pendingCtaOpen = undefined;
    window.__ctaOpenEvents = [];
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test('records and consumes pending CTA requests', () => {
    requestCtaOpen({ track: 'buy', source: 'scene-0-hero', scrollIntoView: false });

    expect(window.__ctaOpenEvents).toEqual([
      expect.objectContaining({ track: 'buy', source: 'scene-0-hero', scrollIntoView: false }),
    ]);
    expect(consumePendingCtaOpen()).toMatchObject({ track: 'buy', source: 'scene-0-hero' });
    expect(consumePendingCtaOpen()).toBeUndefined();
  });

  test('is SSR-safe when the browser window is unavailable', () => {
    const originalWindow = globalThis.window;
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: undefined,
      writable: true,
    });

    expect(() => requestCtaOpen({ track: 'buy', source: 'scene-0-hero' })).not.toThrow();
    expect(consumePendingCtaOpen()).toBeUndefined();

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
      writable: true,
    });
  });

  test('CtaHub opens the existing Buy modal from a Scene 0 request', async () => {
    const scrollIntoView = vi.fn();
    Element.prototype.scrollIntoView = scrollIntoView;
    render(<CtaHub locale="en" />);

    requestCtaOpen({ track: 'buy', source: 'scene-0-hero', scrollIntoView: true });

    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
    expect(screen.getByRole('dialog').textContent).toContain('Book a Discovery Call');
    expect(scrollIntoView).toHaveBeenCalled();
    expect(setFocusedCta).toHaveBeenCalledWith('buy');
    expect(trackEventMock).toHaveBeenCalledWith(
      'cta_click',
      expect.objectContaining({
        cta_id: 'buy',
        scene_id: 'scene-0',
        track: 'buy',
      }),
    );
  });

  test('CtaHub opens portals directly, focuses deep-linked tracks, and emits view analytics', async () => {
    const observers: Array<(entries: Array<{ isIntersecting: boolean; intersectionRatio: number }>) => void> = [];
    class MockIntersectionObserver {
      constructor(callback: (entries: Array<{ isIntersecting: boolean; intersectionRatio: number }>) => void) {
        observers.push(callback);
      }
      observe = vi.fn();
      disconnect = vi.fn();
    }
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
    window.history.replaceState(null, '', '/?track=join');
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      configurable: true,
      value: 2000,
    });
    Object.defineProperty(window, 'innerHeight', {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(window, 'scrollY', {
      configurable: true,
      value: 500,
    });

    const { unmount } = render(<CtaHub locale="vi" />);

    observers[0]?.([{ isIntersecting: false, intersectionRatio: 0.2 }]);
    expect(trackEventMock).not.toHaveBeenCalledWith('cta_view', expect.anything());

    observers[0]?.([{ isIntersecting: true, intersectionRatio: 0.75 }]);
    observers[0]?.([{ isIntersecting: true, intersectionRatio: 0.75 }]);
    expect(trackEventMock).toHaveBeenCalledWith('cta_view', { cta_id: 'buy', scene_id: 'scene-6' });
    expect(screen.getByText('Ban muon bien dieu gi thanh that?')).toBeTruthy();
    expect(setFocusedCta).toHaveBeenCalledWith('join');

    fireEvent.focus(screen.getByText('Join the Team'));
    fireEvent.blur(screen.getByText('Join the Team'));
    expect(setFocusedCta).toHaveBeenCalledWith(null);

    fireEvent.click(screen.getByText('Book a Discovery Call'));

    await waitFor(() => expect(screen.getByRole('dialog')).toBeTruthy());
    expect(trackEventMock).toHaveBeenCalledWith(
      'cta_click',
      expect.objectContaining({
        cta_id: 'buy',
        scene_id: 'scene-6',
        scroll_depth: 50,
        track: 'buy',
      }),
    );

    fireEvent.click(screen.getByRole('button', { name: 'Close' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull());

    unmount();
    expect(setFocusedCta).toHaveBeenCalledWith(null);
  });
});
