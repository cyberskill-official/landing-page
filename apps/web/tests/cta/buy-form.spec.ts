import { expect, test } from '@playwright/test';

test('buy flow lazy-loads, validates, shows Calendly, posts to /api/lead, and confirms', async ({ page }) => {
  let postedBody: Record<string, unknown> | null = null;
  await page.route('**/api/lead', async (route) => {
    postedBody = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
    await route.fulfill({
      body: JSON.stringify({ ok: true, lead_id: 'test-buy-lead' }),
      contentType: 'application/json',
      status: 200,
    });
  });

  await page.goto('/?debug=stores');
  await page.locator('[data-cta-hub]').scrollIntoViewIfNeeded();
  await page.locator('[data-cta-portal][data-cta-track="buy"]').click();

  const modal = page.locator('[data-cta-modal="buy"]');
  await expect(modal.locator('[data-buy-step-panel="help-type"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.emissiveBoost)).toBe(0.3);

  await modal.getByRole('button', { name: 'Next', exact: true }).click();
  await expect(page.getByText('Choose the kind of help you need.')).toBeVisible();

  await modal.getByRole('button', { name: 'AI / RAG integration' }).click();
  await modal.getByRole('button', { name: 'Next', exact: true }).click();

  await expect(modal.locator('[data-buy-step-panel="about-you"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.emissiveBoost)).toBe(0.6);

  await modal.getByLabel('Full name').fill('Buyer Person');
  await modal.getByLabel('Company name').fill('Acme Studio');
  await modal.getByLabel('Role').fill('CTO');
  await modal.getByLabel('Work email').fill('buyer@example.com');
  await modal.getByLabel('Time zone').fill('Asia/Ho_Chi_Minh');
  await modal.getByLabel('Brief project description').fill('We need an AI-assisted WebGL launch experience.');

  await modal.getByRole('button', { name: 'Continue' }).click();
  await expect(modal.locator('[data-buy-step-panel="pick-time"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.currentAnim)).toBe('summon');
  await expect(page.locator('[data-calendly-embed]')).toBeVisible();
  await expect(page.getByRole('link', { name: 'info@cyberskill.world' })).toHaveAttribute('href', 'mailto:info@cyberskill.world');

  await modal.getByRole('button', { name: 'Back' }).click();
  await expect(modal.getByLabel('Full name')).toHaveValue('Buyer Person');
  await modal.getByRole('button', { name: 'Continue' }).click();

  await page.evaluate(() => {
    window.postMessage(
      {
        event: 'calendly.event_scheduled',
        payload: { event: { uri: 'https://api.calendly.com/scheduled_events/test-buy-slot' } },
      },
      '*',
    );
  });
  await expect(page.locator('[data-scheduled-slot]')).toContainText('Calendly slot received');

  const submit = modal.getByRole('button', { name: 'Schedule call' });
  await submit.scrollIntoViewIfNeeded();
  await submit.click();

  await expect(modal.locator('[data-buy-step-panel="confirm"]')).toContainText('Booked.');
  expect(postedBody).toMatchObject({
    budget_range: 'tbd',
    consent: true,
    contact_email: 'buyer@example.com',
    contact_name: 'Buyer Person',
    scheduledSlot: 'https://api.calendly.com/scheduled_events/test-buy-slot',
    step1: 'ai-rag',
    track: 'buy',
  });
});
