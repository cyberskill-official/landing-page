/* @vitest-environment happy-dom */

import React from 'react';
import { act, cleanup, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { Scene0Hero } from '../Scene0Hero';
import { Scene0HeroClient } from '../Scene0Hero.client';

const setCurrentAnimMock = vi.fn();
const trackEventMock = vi.fn();
const dynamicScene0Control = vi.hoisted(() => ({ callReadyOnRender: false }));

vi.mock('next/dynamic', () => ({
  default: () =>
    function DynamicScene0Canvas({ onReady }: { onReady?: () => void }) {
      if (dynamicScene0Control.callReadyOnRender) onReady?.();
      return <span data-dynamic-scene-0-canvas />;
    },
}));

vi.mock('@/lib/analytics', () => ({
  trackEvent: (...args: unknown[]) => trackEventMock(...args),
}));

vi.mock('@/lib/dynamic-three', () => ({
  SceneTunnel: ({ children, id }: { children: React.ReactNode; id: string }) => (
    <div data-scene-tunnel={id}>{children}</div>
  ),
}));

vi.mock('@/lib/stores', () => ({
  setCurrentAnim: (animation: string) => setCurrentAnimMock(animation),
}));

vi.mock('../Scene0CTA', () => ({
  Scene0CTA: () => <a href="#cta-hub" data-scene-0-cta>Book a Discovery Call</a>,
}));

const links = [
  { href: '#cta-hub', label: 'Book', ctaTrack: 'buy' as const },
  { href: '#scene-3', label: 'Capabilities' },
];

function stubMatchMedia(matches: boolean) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    value: vi.fn().mockReturnValue({
      addEventListener: vi.fn(),
      matches,
      removeEventListener: vi.fn(),
    }),
  });
}

function installCanvasDom() {
  const root = document.createElement('div');
  root.id = 'ScrollRig-canvas';
  root.appendChild(document.createElement('canvas'));
  document.body.appendChild(root);
}

describe('Scene0HeroClient', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.stubGlobal('React', React);
    dynamicScene0Control.callReadyOnRender = false;
    setCurrentAnimMock.mockClear();
    trackEventMock.mockClear();
  });

  afterEach(() => {
    cleanup();
    document.body.innerHTML = '';
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  test('renders SSR-equivalent copy and runs fly_in to idle after canvas appears', async () => {
    stubMatchMedia(false);
    installCanvasDom();
    dynamicScene0Control.callReadyOnRender = true;

    render(
      <Scene0HeroClient
        caption="Whisper an idea. I'll show you the rest."
        deck="Senior software from Vietnam."
        links={links}
        locale="en"
        title="What if your will became real?"
      />,
    );

    expect(screen.getByRole('heading', { name: 'What if your will became real?' })).toBeTruthy();
    expect(screen.getByText("Whisper an idea. I'll show you the rest.")).toBeTruthy();
    expect(screen.getByText('Book').getAttribute('data-cta-track')).toBe('buy');
    expect(screen.getByText('Senior software from Vietnam.')).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });

    expect(setCurrentAnimMock).toHaveBeenCalledWith('fly_in');
    expect(trackEventMock).toHaveBeenCalledWith('scene_enter', { scene_id: 'scene-0' });
    expect(window.__scene0HeroState?.sequence).toEqual(['fly_in']);

    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });

    expect(setCurrentAnimMock).toHaveBeenCalledWith('idle');
    expect(
      (window.__scene0HeroState as { sequence?: Array<'fly_in' | 'idle'> } | undefined)?.sequence,
    ).toEqual(['fly_in', 'idle']);
  });

  test('server wrapper passes canonical copy into the client component', async () => {
    stubMatchMedia(false);
    installCanvasDom();

    render(<Scene0Hero deck="Deck" links={links} locale="en" />);

    expect(screen.getByRole('heading', { name: 'What if your will became real?' })).toBeTruthy();
    expect(screen.getByText("Whisper an idea. I'll show you the rest.")).toBeTruthy();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });

    expect(setCurrentAnimMock).toHaveBeenCalledWith('fly_in');
  });

  test('polls until the persistent canvas exists and keeps idle fallback state idempotent', async () => {
    stubMatchMedia(false);

    render(
      <Scene0HeroClient
        caption="Caption"
        deck="Deck"
        links={links}
        locale="en"
        title="Title"
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });
    expect(setCurrentAnimMock).not.toHaveBeenCalled();

    installCanvasDom();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });
    expect(setCurrentAnimMock).toHaveBeenCalledWith('fly_in');

    window.__scene0HeroState = undefined;
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000);
    });
    const restoredState = window.__scene0HeroState as
      | { sequence?: Array<'fly_in' | 'idle'> }
      | undefined;
    expect(restoredState?.sequence).toEqual(['fly_in', 'idle']);
  });

  test('skips the tunnel and renders the static image under reduced motion', async () => {
    stubMatchMedia(true);

    render(
      <Scene0HeroClient
        caption="Caption"
        deck="Deck"
        links={links}
        locale="vi"
        title="Neu y chi cua ban thanh hien thuc?"
      />,
    );

    await act(async () => {
      await vi.advanceTimersByTimeAsync(20);
    });

    expect(document.querySelector('[data-scene-tunnel]')).toBeNull();
    expect(screen.getByLabelText('Lien ket chinh')).toBeTruthy();
    expect(document.querySelector('[data-lumi-static]')).toBeTruthy();
    expect(setCurrentAnimMock).not.toHaveBeenCalled();
  });
});
