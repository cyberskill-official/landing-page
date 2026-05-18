import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('submit-with-errors focuses first invalid CTA field and announces errors', async ({ page }) => {
  await page.goto('/?debug=stores');
  await page.locator('[data-cta-hub]').scrollIntoViewIfNeeded();
  await page.locator('[data-cta-portal][data-cta-track="join"]').click();

  const modal = page.locator('[data-cta-modal="join"]');
  await modal.getByRole('button', { name: 'Submit application' }).click();

  const fullName = modal.getByLabel('Full name');
  await expect(fullName).toBeFocused();
  await expect(fullName).toHaveAttribute('aria-invalid', 'true');
  await expect(fullName).toHaveAttribute('aria-describedby', /join-full_name-error/);
  await expect(modal.locator('#join-full_name-error')).toContainText('Full name must be at least 2 characters.');
  await expect(modal.locator('#join-role-error')).toContainText('Choose a role of interest.');
});

test('CTA form preserves values, validates successfully, and records submit analytics', async ({ page }) => {
  await page.goto('/?debug=stores');
  await page.locator('[data-cta-hub]').scrollIntoViewIfNeeded();
  await page.locator('[data-cta-portal][data-cta-track="join"]').click();

  const modal = page.locator('[data-cta-modal="join"]');
  await modal.getByLabel('Full name').fill('Candidate Person');
  await modal.getByLabel('Email').fill('candidate@example.com');
  await modal.getByLabel('Role of interest').selectOption('r3f');
  await modal.getByLabel('GitHub / portfolio URL optional').fill('https://example.com/work');
  await modal.getByLabel('Cover note').fill('I want to own senior R3F delivery and mentor other engineers.');
  await modal.getByRole('button', { name: 'Submit application' }).click();

  await expect(modal.locator('[data-join-success]')).toContainText('Our team will be in touch within a week.');
  await expect
    .poll(() =>
      page.evaluate(() =>
        window.__cyberskillAnalyticsEvents?.some(
          (event) => event.name === 'form_submit' && event.payload.track === 'join' && event.payload.success === true,
        ),
      ),
    )
    .toBe(true);
});

test('dirty Escape close confirms before closing and CTA form modal is axe-clean', async ({ page }) => {
  await page.goto('/?debug=stores');
  await page.locator('[data-cta-hub]').scrollIntoViewIfNeeded();
  await page.locator('[data-cta-portal][data-cta-track="join"]').click();
  await page.getByLabel('Full name').fill('Candidate Person');

  const result = await new AxeBuilder({ page }).include('[data-cta-modal="join"]').withTags(['wcag2a', 'wcag2aa']).analyze();
  const seriousCritical = result.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
  expect(seriousCritical).toEqual([]);

  page.on('dialog', async (dialog) => {
    expect(dialog.message()).toContain('Discard');
    await dialog.accept();
  });
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-cta-modal="join"]')).toHaveCount(0);
});
