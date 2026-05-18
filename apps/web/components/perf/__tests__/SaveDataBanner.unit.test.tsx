/* @vitest-environment happy-dom */
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import React from 'react';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test, vi } from 'vitest';
import { SaveDataBanner } from '../SaveDataBanner';

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const componentPath = path.join(appRoot, 'components/perf/SaveDataBanner.tsx');
const gatePath = path.join(appRoot, 'components/system/CapabilityGate.tsx');

describe('FR-PERF-010 SaveDataBanner contract', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test('ships an accessible non-modal banner with the required controls', async () => {
    const source = await readFile(componentPath, 'utf8');

    expect(source).toContain('role="region"');
    expect(source).toContain('aria-live="polite"');
    expect(source).toContain('aria-expanded={expanded}');
    expect(source).toContain('switchButton.current?.focus()');
    expect(source).toContain("Your browser's Low Data mode is on");
    expect(source).toContain('Bản nhẹ dùng ít dữ liệu hơn khoảng 80%');
  });

  test('wires persistence, session dismissal, and save-data analytics in the gate', async () => {
    const source = await readFile(gatePath, 'utf8');

    expect(source).toContain('cyberskill_save_data_dismissed');
    expect(source).toContain("trackEvent('save_data_banner_shown'");
    expect(source).toContain("trackEvent('save_data_banner_switched'");
    expect(source).toContain("trackEvent('save_data_banner_stayed'");
    expect(source).toContain("setLitePref('1')");
    expect(source).toContain("setLitePref('0')");
  });

  test('renders bilingual copy, focuses switch, expands details, and dispatches actions', () => {
    const onStay = vi.fn();
    const onSwitch = vi.fn();
    vi.stubGlobal('React', React);

    render(<SaveDataBanner locale="en" onStay={onStay} onSwitch={onSwitch} />);

    expect(screen.getByRole('region', { name: 'Data-saving option' }).getAttribute('aria-live')).toBe(
      'polite',
    );
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Switch to /lite' }));

    fireEvent.click(screen.getByRole('button', { name: 'Why am I seeing this?' }));
    expect(screen.getByText(/Low Data mode is on/)).toBeTruthy();

    fireEvent.keyDown(screen.getByRole('region', { name: 'Data-saving option' }), { key: 'Tab' });
    expect(onStay).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('region', { name: 'Data-saving option' }), {
      key: 'Escape',
    });
    expect(onStay).toHaveBeenCalledTimes(2);

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onStay).toHaveBeenCalledTimes(3);

    fireEvent.click(screen.getByRole('button', { name: 'Switch to /lite' }));
    expect(onSwitch).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole('button', { name: 'Stay here' }));
    expect(onStay).toHaveBeenCalledTimes(4);

    cleanup();
    render(<SaveDataBanner locale="vi" onStay={onStay} onSwitch={onSwitch} />);
    expect(screen.getByText(/Phiên bản nhẹ hơn/)).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Chuyển sang /lite' })).toBeTruthy();
  });
});
