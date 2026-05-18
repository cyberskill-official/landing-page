import { expect, test } from '@playwright/test';

test('public accessibility statement exposes WCAG coverage, contact, review date, and known issues', async ({ page }) => {
  await page.goto('/accessibility');

  await expect(page.getByRole('heading', { name: 'Accessibility statement', level: 1 })).toBeVisible();
  await expect(page.getByText('WCAG 2.2 Level AA, with selected AAA enhancements')).toBeVisible();
  await expect(page.getByRole('link', { name: 'accessibility@cyberskill.world' })).toHaveAttribute(
    'href',
    'mailto:accessibility@cyberskill.world',
  );
  await expect(page.getByText('Last reviewed: May 18, 2026.')).toBeVisible();
  await expect(page.getByRole('table', { name: 'WCAG 2.2 criteria conformance coverage' })).toBeVisible();
  await expect(page.locator('.criteria-table tbody tr')).toHaveCount(57);
  await expect(page.getByText('Manual VoiceOver and NVDA review is pending')).toBeVisible();
});

test('Vietnamese accessibility statement renders through locale middleware', async ({ page }) => {
  await page.goto('/vi/accessibility');

  await expect(page.getByRole('heading', { name: 'Tuyen bo kha nang tiep can', level: 1 })).toBeVisible();
  await expect(page.getByText('Bang doi chieu tieu chi WCAG 2.2')).toBeVisible();
  await expect(page.getByText('Lan xem lai gan nhat: 18/05/2026.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'accessibility@cyberskill.world' })).toBeVisible();
});
