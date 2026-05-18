/** @vitest-environment happy-dom */
import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { PartnerForm } from '../PartnerForm';
import { partnerSchema } from '../schemas/partner-schema';

vi.mock('@/lib/analytics', () => ({
  trackEvent: vi.fn(),
}));

describe('FR-CTA-003 PartnerForm', () => {
  afterEach(() => {
    cleanup();
    sessionStorage.clear();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('starts at agency identity step and validates step 1 before advancing', async () => {
    render(<PartnerForm onClose={() => undefined} />);

    expect(screen.getByRole('heading', { name: 'Partner with us' })).toBeTruthy();
    expect(screen.getByLabelText('Agency name')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByText('Agency name must be at least 2 characters.');
    expect(screen.getByLabelText('Agency name').getAttribute('aria-invalid')).toBe('true');
  });

  test('persists a draft to sessionStorage', async () => {
    render(<PartnerForm onClose={() => undefined} />);

    fireEvent.change(screen.getByLabelText('Agency name'), { target: { value: 'Acme Studio' } });
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'VN' } });

    await waitFor(() => {
      const draft = JSON.parse(sessionStorage.getItem('cyberskill_form_draft_partner') ?? '{}') as {
        data?: { agency_name?: string; country?: string };
      };
      expect(draft.data?.agency_name).toBe('Acme Studio');
      expect(draft.data?.country).toBe('VN');
    });
  });

  test('schema enforces partner payload shape', () => {
    const result = partnerSchema.safeParse({
      agency_name: 'Acme Studio',
      brief: 'We need React and R3F delivery help for a museum exhibit launch with senior delivery support.',
      contact_email: 'alex@acme.example',
      contact_name: 'Alex Tran',
      country: 'VN',
      monthly_capacity: 80,
    });

    expect(result.success).toBe(true);
  });

  test('submits validated partner data to /api/lead', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({ ok: true, lead_id: 'partner-test' }), { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    render(<PartnerForm onClose={() => undefined} />);
    fireEvent.change(screen.getByLabelText('Agency name'), { target: { value: 'Acme Studio' } });
    fireEvent.change(screen.getByLabelText('Country'), { target: { value: 'VN' } });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByText('Engagement scope');
    fireEvent.change(screen.getByLabelText('Monthly capacity needed'), { target: { value: '80' } });
    fireEvent.change(screen.getByLabelText("Brief - what's the work?"), {
      target: { value: 'We need React and R3F delivery help for a museum exhibit launch with senior delivery support.' },
    });
    fireEvent.click(screen.getByRole('button', { name: 'Next' }));

    await screen.findByText('Contact details');
    fireEvent.change(screen.getByLabelText('Contact email'), { target: { value: 'alex@acme.example' } });
    fireEvent.change(screen.getByLabelText('Contact name'), { target: { value: 'Alex Tran' } });
    fireEvent.click(screen.getByRole('button', { name: 'Submit' }));

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { locale?: string; scene_id?: string; track?: string };
    expect(fetchMock.mock.calls[0]?.[0]).toBe('/api/lead');
    expect(body).toMatchObject({ locale: 'en', scene_id: 'scene-6', track: 'partner' });
    await screen.findByText('Our partner-success lead will respond in 24h.');
  });
});
