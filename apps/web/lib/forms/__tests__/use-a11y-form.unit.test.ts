/* @vitest-environment happy-dom */

import React from 'react';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import PartnerForm from '@/components/cta/forms/PartnerForm';
import { resolveValidationMessage } from '../validation-messages';
import { partnerSchema } from '../schemas/cta-schemas';

describe('FR-CTA-005 a11y form validation', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn(() => Promise.resolve(new Response(null, { status: 202 }))));
    Object.defineProperty(window.navigator, 'sendBeacon', {
      configurable: true,
      value: vi.fn(() => true),
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  test('zod schema rejects invalid partner values with validation keys', () => {
    const parsed = partnerSchema.safeParse({
      agencyName: 'A',
      email: 'not-an-email',
      country: 'Vietnam',
      monthlyCapacity: 0,
      brief: 'short',
    });

    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      expect(parsed.error.issues.map((issue) => issue.message)).toEqual(
        expect.arrayContaining([
          'validation:agency_required',
          'validation:email',
          'validation:country_code',
          'validation:capacity_required',
          'validation:brief_required',
        ]),
      );
    }
  });

  test('empty submit focuses first invalid field and announces visible step errors', async () => {
    document.documentElement.lang = 'en';
    render(React.createElement(PartnerForm, { onClose: vi.fn() }));

    fireEvent.submit(screen.getByTestId('cta-form-partner'));

    const agency = screen.getByLabelText('Agency name') as HTMLInputElement;
    await waitFor(() => expect(document.activeElement).toBe(agency));
    expect(agency.getAttribute('aria-invalid')).toBe('true');
    expect(agency.getAttribute('aria-describedby')).toContain('partner-agency_name-error');
    expect(screen.getByText('Agency name must be at least 2 characters.')).toBeTruthy();
    expect(screen.getByText('Choose a country.')).toBeTruthy();
  });

  test('values are preserved after validation errors and localized message helpers resolve', async () => {
    document.documentElement.lang = 'vi';
    render(React.createElement(PartnerForm, { onClose: vi.fn() }));

    const agency = screen.getByLabelText('Agency name') as HTMLInputElement;
    fireEvent.change(agency, { target: { value: 'A' } });
    fireEvent.submit(screen.getByTestId('cta-form-partner'));

    await waitFor(() => expect(agency.value).toBe('A'));
    expect(screen.getByText('Agency name must be at least 2 characters.')).toBeTruthy();
    expect(resolveValidationMessage('validation:email', 'vi')).toBe('Nhập email hợp lệ.');
  });

  test('dirty Escape close asks for confirmation', async () => {
    const onClose = vi.fn();
    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(React.createElement(PartnerForm, { onClose }));

    fireEvent.change(screen.getByLabelText('Agency name'), { target: { value: 'CyberSkill Partners' } });
    await waitFor(() => expect(screen.getByTestId('cta-form-partner').getAttribute('data-dirty')).toBe('true'));
    fireEvent.keyDown(document, { key: 'Escape' });

    expect(confirm).toHaveBeenCalledWith('Discard draft?');
    expect(onClose).toHaveBeenCalledOnce();
    confirm.mockRestore();
  });
});
