import { expect, test } from '@playwright/test';

test('CTA hub renders exactly three DOM portals, opens lazy shells, and records analytics', async ({ page }) => {
  await page.goto('/?debug=stores');

  const hub = page.locator('[data-cta-hub]');
  await expect(hub).toBeVisible();
  await hub.scrollIntoViewIfNeeded();

  const portals = page.locator('[data-cta-portal]');
  await expect(portals).toHaveCount(3);
  await expect(page.locator('canvas [data-cta-portal]')).toHaveCount(0);

  const partner = page.locator('[data-cta-portal][data-cta-track="partner"]');
  const box = await partner.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);
  await expect(partner).toHaveAttribute('aria-describedby', /cta-desc-partner/);

  await partner.focus();
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.focusedCta)).toBe('partner');
  await expect(partner).toHaveAttribute('aria-current', 'page');

  await partner.click();
  await expect(page.locator('[data-cta-modal="partner"]')).toBeVisible();
  await expect(page.locator('[data-cta-modal="partner"]')).toContainText('Partner with us');
  await expect.poll(() =>
    page.evaluate(() => window.__cyberskillAnalyticsEvents?.some((event) => event.name === 'cta_click' && event.payload.cta_id === 'partner')),
  ).toBe(true);
});

test('track deep link scrolls to hub and focuses the requested portal', async ({ page }) => {
  await page.goto('/?track=join&debug=stores');

  const join = page.locator('[data-cta-portal][data-cta-track="join"]');
  await expect(join).toBeFocused();
  await expect(join).toHaveAttribute('aria-current', 'page');
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.focusedCta)).toBe('join');
});
