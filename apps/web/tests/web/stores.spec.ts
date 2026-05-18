import { expect, test } from '@playwright/test';

test('scene navigation updates activeScene', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__stores));

  await page.click('a[href="#scene-3"]');
  await page.waitForFunction(() => window.__stores?.scene.activeScene === 3);

  expect(await page.evaluate(() => window.__stores?.scene.activeScene)).toBe(3);
});

test('CTA hover updates focusedCta', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__stores));

  await page.locator('[data-cta-portal][data-cta-track="buy"]').hover();
  await page.waitForFunction(() => window.__stores?.lumi.focusedCta === 'buy');

  expect(await page.evaluate(() => window.__stores?.lumi.focusedCta)).toBe('buy');
});

test('scrollStore receives throttled Lenis snapshots', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__lenis));

  await page.mouse.wheel(0, 800);
  await page.waitForFunction(() => (window.__stores?.scroll.velocity ?? 0) !== 0);

  expect(await page.evaluate(() => window.__stores?.scroll.direction)).toMatch(/down|up/);
});

test('debug stores overlay renders in development', async ({ page }) => {
  await page.goto('/?debug=stores');
  await page.waitForFunction(() => Boolean(window.__stores));

  await expect(page.locator('[data-stores-debug]')).toBeVisible();
});
