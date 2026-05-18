import { expect, test } from '@playwright/test';

test('CTA forms reuse saved contact details with explicit consent', async ({ page }) => {
  await page.route('**/api/lead', async (route) => {
    await route.fulfill({
      body: JSON.stringify({ ok: true, lead_id: 'prefill-lead' }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.goto('/?debug=stores');
  await page.locator('[data-cta-hub]').scrollIntoViewIfNeeded();
  await page.locator('[data-cta-portal][data-cta-track="buy"]').click();

  const buy = page.locator('[data-cta-modal="buy"]');
  await buy.getByRole('button', { name: 'AI / RAG integration' }).click();
  await buy.getByRole('button', { name: 'Next', exact: true }).click();
  await buy.getByLabel('Full name').fill('Buyer Person');
  await buy.getByLabel('Company name').fill('Acme Studio');
  await buy.getByLabel('Role').fill('CTO');
  await buy.getByLabel('Work email').fill('buyer@example.com');
  await buy.getByLabel('Time zone').fill('Asia/Ho_Chi_Minh');
  await buy.getByLabel('Brief project description').fill('We need a reusable product launch system.');
  await buy.getByRole('button', { name: 'Continue' }).click();
  await page.evaluate(() => {
    window.postMessage(
      {
        event: 'calendly.event_scheduled',
        payload: { event: { uri: 'https://api.calendly.com/scheduled_events/prefill-test' } },
      },
      '*',
    );
  });
  await buy.getByRole('button', { name: 'Schedule call' }).click();
  await expect(buy.locator('[data-buy-step-panel="confirm"]')).toContainText('Booked.');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_form_prefill'))).toContain('buyer@example.com');
  await buy.getByRole('button', { name: 'Close' }).click();

  await page.locator('[data-cta-portal][data-cta-track="partner"]').click();
  const partner = page.locator('[data-cta-modal="partner"]');
  await expect(partner.getByRole('region', { name: 'Prefill notice' })).toContainText('We saved your details from your last visit.');
  await partner.getByRole('button', { name: 'Use them' }).click();
  await expect(partner.getByLabel('Agency name')).toHaveValue('Acme Studio');

  await partner.getByLabel('Country').selectOption('VN');
  await partner.getByRole('button', { name: 'Next' }).click();
  await partner.getByLabel('Monthly capacity needed').fill('80');
  await partner.getByLabel("Brief - what's the work?").fill('We need senior React and R3F delivery support for a launch.');
  await partner.getByRole('button', { name: 'Next' }).click();
  await expect(partner.getByLabel('Contact email')).toHaveValue('buyer@example.com');
  await expect(partner.getByLabel('Contact name')).toHaveValue('Buyer Person');
});

test('accessibility privacy section clears saved form details on this device', async ({ page }) => {
  await page.goto('/accessibility');
  await page.evaluate(() => {
    localStorage.setItem(
      'cyberskill_form_prefill',
      JSON.stringify({ contact_email: 'clear@example.com', expires_at: Date.now() + 60_000 }),
    );
  });

  await page.getByRole('button', { name: 'Clear saved form details' }).click();

  await expect(page.locator('[data-form-prefill-clear-status]')).toContainText('Saved form details cleared on this device.');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_form_prefill'))).toBeNull();
});
