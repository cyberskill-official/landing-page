import { expect, test } from '@playwright/test';

test('Lenis singleton instantiates on the cinematic route without velocity overrides', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__lenis));

  const options = await page.evaluate(() => window.__lenisOptions);
  const proxyRegistrations = await page.evaluate(() => window.__scrollTriggerProxyRegistrations);

  expect(options?.wheelMultiplier).toBe(1);
  expect(options?.touchMultiplier).toBe(1);
  expect(options?.infinite).toBe(false);
  expect(options?.orientation).toBe('vertical');
  expect(proxyRegistrations).toBe(1);
});

test('reduced-motion prevents Lenis instantiation', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();

  await page.goto('/');
  await page.waitForTimeout(500);
  expect(await page.evaluate(() => Boolean(window.__lenis))).toBe(false);

  await context.close();
});

test('/lite bypasses Lenis and keeps native scroll', async ({ page }) => {
  await page.goto('/lite');
  await page.waitForTimeout(500);

  expect(await page.evaluate(() => Boolean(window.__lenis))).toBe(false);
});

test('keyboard PageDown scrolls the document', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__lenis));
  await page.locator('body').click();
  await page.keyboard.press('PageDown');
  await page.waitForTimeout(600);

  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('anchor links route through smooth scrolling', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__lenis));

  const before = await page.evaluate(() => window.scrollY);
  await page.click('a[href="#scene-3"]');
  await page.waitForTimeout(800);
  const after = await page.evaluate(() => window.scrollY);

  expect(after - before).toBeGreaterThan(100);
});

test('debug scroll overlay renders only when requested', async ({ page }) => {
  await page.goto('/?debug=scroll');
  await page.waitForFunction(() => Boolean(window.__lenis));

  await expect(page.locator('[data-scroll-debug]')).toBeVisible();
});
