import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

async function openPartner(page: import('@playwright/test').Page) {
  await page.goto('/?debug=stores');
  await page.locator('[data-cta-hub]').scrollIntoViewIfNeeded();
  await page.locator('[data-cta-portal][data-cta-track="partner"]').click();
  const modal = page.locator('[data-cta-modal="partner"]');
  await expect(modal).toBeVisible();
  return modal;
}

test('partner form validates, persists draft, posts to /api/lead, and confirms success', async ({ page }) => {
  let postedBody: Record<string, unknown> | null = null;
  await page.route('**/api/lead', async (route) => {
    postedBody = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
    await route.fulfill({
      body: JSON.stringify({ ok: true, lead_id: 'partner-test-lead' }),
      contentType: 'application/json',
      status: 200,
    });
  });

  let modal = await openPartner(page);
  await expect(modal.locator('[data-partner-step-panel="1"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.currentAnim)).toBe('mouth_smile');

  await modal.getByRole('button', { name: 'Next' }).click();
  await expect(modal.getByText('Agency name must be at least 2 characters.')).toBeVisible();

  await modal.getByLabel('Agency name').fill('Acme Studio');
  await modal.getByLabel('Country').selectOption('VN');
  await modal.getByLabel('How did you hear about us? optional').fill('Referral');
  await modal.getByRole('button', { name: 'Next' }).click();

  await expect(modal.locator('[data-partner-step-panel="2"]')).toBeVisible();
  await expect(modal.locator('[data-step-meter]')).toHaveAttribute('aria-label', 'Step 2 of 3');
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.currentAnim)).toBe('summon');
  await modal.getByLabel('Monthly capacity needed').fill('80');
  await modal.getByLabel("Brief - what's the work?").fill('We need React and R3F delivery help for a museum exhibit launch with senior delivery support.');

  await page.reload();
  modal = await openPartner(page);
  await expect(modal.locator('[data-partner-step-panel="2"]')).toBeVisible();
  await expect(modal.getByLabel('Monthly capacity needed')).toHaveValue('80');

  await modal.getByRole('button', { name: 'Next' }).click();
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.currentAnim)).toBe('idle');
  await modal.getByLabel('Contact email').fill('alex@acme.example');
  await modal.getByLabel('Contact name').fill('Alex Tran');

  const axe = await new AxeBuilder({ page }).include('[data-cta-modal="partner"]').withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(axe.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);

  await modal.getByRole('button', { name: 'Submit' }).click();
  await expect(modal.locator('[data-partner-step-panel="4"]')).toContainText('Our partner-success lead will respond in 24h.');
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.currentAnim)).toBe('wave_goodbye');
  expect(postedBody).toMatchObject({
    agency_name: 'Acme Studio',
    contact_email: 'alex@acme.example',
    contact_name: 'Alex Tran',
    country: 'VN',
    locale: 'en',
    monthly_capacity: 80,
    scene_id: 'scene-6',
    track: 'partner',
  });
});

test('partner form surfaces rate-limit state on mobile', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.route('**/api/lead', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ error: 'rate_limit', ok: false }),
      contentType: 'application/json',
      headers: { 'Retry-After': '60' },
      status: 429,
    });
  });

  const modal = await openPartner(page);
  await modal.getByLabel('Agency name').fill('Acme Studio');
  await modal.getByLabel('Country').selectOption('VN');
  await modal.getByRole('button', { name: 'Next' }).click();
  await modal.getByLabel('Monthly capacity needed').fill('80');
  await modal.getByLabel("Brief - what's the work?").fill('We need React and R3F delivery help for a museum exhibit launch with senior delivery support.');
  await modal.getByRole('button', { name: 'Next' }).click();
  await modal.getByLabel('Contact email').fill('alex@acme.example');
  await modal.getByLabel('Contact name').fill('Alex Tran');
  await modal.getByRole('button', { name: 'Submit' }).click();

  await expect(modal.getByRole('alert')).toContainText('Hold up - too many submits. Wait 60 seconds.');
  const box = await modal.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(375);
});

test('partner form auto-retries 5xx responses and exposes manual retry', async ({ page }) => {
  let attempts = 0;
  await page.route('**/api/lead', async (route) => {
    attempts += 1;
    await route.fulfill({
      body: JSON.stringify(attempts < 4 ? { error: 'upstream', ok: false } : { ok: true, lead_id: 'partner-retry-lead' }),
      contentType: 'application/json',
      status: attempts < 4 ? 503 : 200,
    });
  });

  const modal = await openPartner(page);
  await modal.getByLabel('Agency name').fill('Acme Studio');
  await modal.getByLabel('Country').selectOption('VN');
  await modal.getByRole('button', { name: 'Next' }).click();
  await modal.getByLabel('Monthly capacity needed').fill('80');
  await modal.getByLabel("Brief - what's the work?").fill('We need React and R3F delivery help for a museum exhibit launch with senior delivery support.');
  await modal.getByRole('button', { name: 'Next' }).click();
  await modal.getByLabel('Contact email').fill('alex@acme.example');
  await modal.getByLabel('Contact name').fill('Alex Tran');

  await modal.getByRole('button', { name: 'Submit' }).click();
  await expect(modal.getByRole('alert')).toContainText(/Network error\. Retrying in [12] seconds/);
  await expect(modal.getByRole('button', { name: 'Retry now' })).toBeVisible({ timeout: 8_000 });
  expect(attempts).toBe(3);

  await modal.getByRole('button', { name: 'Retry now' }).click();
  await expect(modal.locator('[data-partner-step-panel="4"]')).toContainText('Our partner-success lead will respond in 24h.');
  expect(attempts).toBe(4);
});
