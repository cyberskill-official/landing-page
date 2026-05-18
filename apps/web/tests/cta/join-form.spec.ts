import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const rolesPayload = {
  count: 2,
  roles: [
    { id: 'r3f', location: 'Remote', title: 'Senior R3F Engineer' },
    { id: 'frontend', location: 'Remote', title: 'Senior Frontend Engineer' },
  ],
};

test('join form loads ATS roles, posts to /api/lead, shows privacy notice, and confirms', async ({ page }) => {
  let postedBody: Record<string, unknown> | null = null;

  await page.route('**/api/jobs-count', async (route) => {
    await route.fulfill({ body: JSON.stringify(rolesPayload), contentType: 'application/json', status: 200 });
  });
  await page.route('**/api/lead', async (route) => {
    postedBody = JSON.parse(route.request().postData() ?? '{}') as Record<string, unknown>;
    await route.fulfill({ body: JSON.stringify({ ok: true, lead_id: 'join-test-lead' }), contentType: 'application/json', status: 200 });
  });

  await page.goto('/?debug=stores');
  await expect(page.getByRole('link', { name: "We're hiring 2 - see open roles" })).toHaveAttribute('href', '/work?role=open');
  await page.locator('[data-cta-hub]').scrollIntoViewIfNeeded();
  await page.locator('[data-cta-portal][data-cta-track="join"]').click();

  const modal = page.locator('[data-cta-modal="join"]');
  await expect(modal).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.currentAnim)).toBe('mouth_smile');
  await expect(modal.getByRole('combobox', { name: 'Role of interest' })).toContainText('Senior R3F Engineer - Remote');

  await modal.getByLabel('Full name').fill('Candidate Person');
  await modal.getByLabel('Email').fill('candidate@example.com');
  await modal.getByLabel('Role of interest').selectOption('r3f');
  await modal.getByLabel('GitHub / portfolio URL optional').fill('https://example.com/work');
  await modal.getByLabel('Cover note').fill('I want to own senior R3F delivery and mentor other engineers.');
  await expect(modal).toContainText("We'll store your application for 12 months");

  const axe = await new AxeBuilder({ page }).include('[data-cta-modal="join"]').withTags(['wcag2a', 'wcag2aa']).analyze();
  expect(axe.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical')).toEqual([]);

  await modal.getByRole('button', { name: 'Submit application' }).click();

  await expect(modal.locator('[data-join-success]')).toContainText('Our team will be in touch within a week.');
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.currentAnim)).toBe('wave_goodbye');
  expect(postedBody).toMatchObject({
    contact_email: 'candidate@example.com',
    contact_name: 'Candidate Person',
    portfolio_url: 'https://example.com/work',
    role_id: 'r3f',
    track: 'join',
  });
});

test('join form falls back gracefully on ATS failure and stays mobile-fit', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 800 });
  await page.route('**/api/jobs-count', async (route) => {
    await route.fulfill({ body: JSON.stringify({ count: null, error: 'ATS unavailable', roles: [] }), contentType: 'application/json', status: 200 });
  });

  await page.goto('/');
  await expect(page.getByRole('link', { name: "We're growing - get in touch" })).toBeVisible();
  await page.locator('[data-cta-hub]').scrollIntoViewIfNeeded();
  await page.locator('[data-cta-portal][data-cta-track="join"]').click();
  const modal = page.locator('[data-cta-modal="join"]');
  await expect(modal.getByLabel('Role of interest')).toContainText('Senior Frontend Engineer');
  const box = await modal.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(375);
});
