// @vitest-environment happy-dom

import React from 'react';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { requestCtaOpen } from '@/components/cta/cta-events';
import { setFocusedCta } from '@/lib/stores';
import { Scene0CTA } from '../Scene0CTA';
import { Scene0CTAClient } from '../Scene0CTA.client';

const scrollTriggerMock = vi.hoisted(() => ({
  config: null as null | {
    onRefresh?: (self: { progress: number }) => void;
    onUpdate?: (self: { progress: number }) => void;
    scrub?: number;
    start?: string;
  },
  create: vi.fn((config: Record<string, unknown>) => {
    scrollTriggerMock.config = config as typeof scrollTriggerMock.config;
    return { kill: vi.fn() };
  }),
  refresh: vi.fn(),
}));

vi.mock('gsap', () => ({
  gsap: {
    registerPlugin: vi.fn(),
  },
}));

vi.mock('gsap/ScrollTrigger', () => ({
  ScrollTrigger: scrollTriggerMock,
}));

vi.mock('@/lib/stores', () => ({
  setFocusedCta: vi.fn(),
}));

vi.mock('@/components/cta/cta-events', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/components/cta/cta-events')>();
  return {
    ...actual,
    requestCtaOpen: vi.fn(actual.requestCtaOpen),
  };
});

function stubMatchMedia(matches = false) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      matches,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
  });
}

describe('FR-SCENE-011 Scene0CTAClient', () => {
  beforeEach(() => {
    stubMatchMedia(false);
    scrollTriggerMock.config = null;
    scrollTriggerMock.create.mockClear();
    scrollTriggerMock.refresh.mockClear();
    vi.mocked(requestCtaOpen).mockClear();
    vi.mocked(setFocusedCta).mockClear();
    window.__scene0CtaState = undefined;
    window.__ctaOpenEvents = [];
    window.__pendingCtaOpen = undefined;
    window.history.replaceState(null, '', '/');
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  test('renders SSR-safe hero and sticky DOM anchors with accessible buy-track wiring', () => {
    render(<Scene0CTA locale="en" />);

    const hero = screen.getAllByRole('link', { name: 'Open the Book Discovery Call form' })[0];
    expect(hero?.getAttribute('href')).toBe('#cta-hub');
    expect(hero?.getAttribute('data-cta-track')).toBe('buy');
    expect(hero?.getAttribute('data-scene-0-cta-variant')).toBe('hero');
    expect(document.querySelector('[data-scene-0-cta-variant="sticky"]')).toBeTruthy();
  });

  test('renders localized Vietnamese CTA text without changing the buy-track contract', () => {
    render(<Scene0CTAClient locale="vi" />);

    const hero = screen.getAllByRole('link', { name: 'Mo form dat lich tu van' })[0];
    expect(hero?.textContent).toBe('Dat lich tu van');
    expect(hero?.getAttribute('data-cta-track')).toBe('buy');
  });

  test('clicking the hero CTA focuses Buy and requests the existing CTA modal', () => {
    render(<Scene0CTAClient locale="en" />);

    fireEvent.click(screen.getAllByRole('link', { name: 'Open the Book Discovery Call form' })[0]!);

    expect(setFocusedCta).toHaveBeenCalledWith('buy');
    expect(requestCtaOpen).toHaveBeenCalledWith({
      track: 'buy',
      source: 'scene-0-hero',
      scrollIntoView: false,
    });
  });

  test('clicking the sticky CTA records the sticky source', () => {
    render(<Scene0CTAClient locale="en" />);

    fireEvent.click(document.querySelector('[data-scene-0-cta-variant="sticky"]')!);

    expect(requestCtaOpen).toHaveBeenCalledWith({
      track: 'buy',
      source: 'scene-0-sticky',
      scrollIntoView: false,
    });
  });

  test('deep-link ?action=book opens the Buy modal request after mount', async () => {
    window.history.replaceState(null, '', '/?action=book');
    render(<Scene0CTAClient locale="en" />);

    await act(async () => {
      await new Promise((resolve) => window.requestAnimationFrame(resolve));
    });

    expect(requestCtaOpen).toHaveBeenCalledWith({
      track: 'buy',
      source: 'scene-0-deeplink',
      scrollIntoView: false,
    });
  });

  test('ScrollTrigger drives crossfade progress and sticky active state', async () => {
    render(<Scene0CTAClient locale="en" />);

    await waitFor(() => expect(scrollTriggerMock.create).toHaveBeenCalled());
    expect(scrollTriggerMock.config?.scrub).toBe(0.2);
    expect(scrollTriggerMock.config?.start).toBe('bottom top+=160');

    const root = document.querySelector<HTMLElement>('[data-scene-0-cta]');
    expect(root).toBeTruthy();

    act(() => {
      scrollTriggerMock.config?.onUpdate?.({ progress: 1 });
    });

    expect(root?.style.getPropertyValue('--scene-0-cta-sticky-progress')).toBe('1.000');
    expect(root?.dataset.stickyActive).toBe('true');
    expect(window.__scene0CtaState).toMatchObject({ stickyActive: true, stickyProgress: 1 });
  });

  test('reduced motion skips ScrollTrigger and keeps the hero CTA stable', async () => {
    stubMatchMedia(true);

    render(<Scene0CTAClient locale="en" />);
    await Promise.resolve();

    expect(scrollTriggerMock.create).not.toHaveBeenCalled();
    expect(document.querySelector<HTMLElement>('[data-scene-0-cta]')?.dataset.stickyActive).toBe('false');
  });
});
