/** @vitest-environment happy-dom */
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { HiringBadge } from '@/components/footer/HiringBadge';
import { JoinForm } from '../JoinForm';
import { joinSchema } from '../schemas/join-schema';

const rolesPayload = {
  count: 1,
  roles: [{ id: 'eng', location: 'Remote', title: 'Senior Engineer' }],
};

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('FR-CTA-004 JoinForm', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('loads roles from /api/jobs-count on mount', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify(rolesPayload), { status: 200 })));

    render(<JoinForm onClose={() => undefined} />);

    await screen.findByText('Senior Engineer - Remote');
    expect(fetch).toHaveBeenCalledWith('/api/jobs-count');
  });

  test('schema accepts optional portfolio and cover note', () => {
    const result = joinSchema.safeParse({
      email: 'candidate@example.com',
      full_name: 'Candidate Person',
      portfolio_url: '',
      role_id: 'eng',
    });

    expect(result.success).toBe(true);
  });

  test('posts to /api/lead with track join on submit', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      if (String(input) === '/api/jobs-count') {
        return Promise.resolve(new Response(JSON.stringify(rolesPayload), { status: 200 }));
      }
      return Promise.resolve(new Response(JSON.stringify({ ok: true, lead_id: 'join-test' }), { status: 200 }));
    });
    vi.stubGlobal('fetch', fetchMock);

    render(<JoinForm onClose={() => undefined} />);
    await screen.findByText('Senior Engineer - Remote');

    fireEvent.change(screen.getByLabelText('Full name'), { target: { value: 'Candidate Person' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'candidate@example.com' } });
    fireEvent.change(screen.getByLabelText('Role of interest'), { target: { value: 'eng' } });
    fireEvent.change(screen.getByLabelText('GitHub / portfolio URL optional'), { target: { value: 'https://example.com/work' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit application' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith('/api/lead', expect.any(Object)));
    const submitCall = fetchMock.mock.calls.find((call) => call[0] === '/api/lead');
    const body = JSON.parse(String(submitCall?.[1]?.body)) as { locale?: string; role_id?: string; scene_id?: string; track?: string };
    expect(body).toMatchObject({ locale: 'en', role_id: 'eng', scene_id: 'scene-6', track: 'join' });
    await screen.findByText('Our team will be in touch within a week.');
  });
});

describe('FR-CTA-004 HiringBadge', () => {
  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('renders active, zero, and fallback states', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ count: 3, roles: [] }), { status: 200 })));
    render(<HiringBadge />);
    await screen.findByText("We're hiring 3 - see open roles");

    cleanup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ count: 0, roles: [] }), { status: 200 })));
    render(<HiringBadge />);
    await screen.findByText("We're not hiring right now - leave us your details");

    cleanup();
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ count: null, error: 'x', roles: [] }), { status: 200 })));
    render(<HiringBadge />);
    await screen.findByText("We're growing - get in touch");
  });
});
