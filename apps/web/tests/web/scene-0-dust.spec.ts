import { expect, test } from '@playwright/test';

test('Scene 0 dust publishes debug count and draw-call state', async ({ page }) => {
  await page.goto('/?debug=dust');

  await expect(page.locator('#ScrollRig-canvas canvas')).toBeVisible({ timeout: 3_000 });
  await expect.poll(() => page.evaluate(() => window.__scene0DustState?.count)).toBe(200);
  await expect.poll(() => page.evaluate(() => window.__scene0DustState?.token)).toBe('--glow-genie-soft');

  const drawCalls = await page.evaluate(() => window.__scene0DustState?.drawCalls ?? 0);
  expect(drawCalls).toBeGreaterThanOrEqual(1);
  expect(drawCalls).toBeLessThanOrEqual(3);
});

test('Scene 0 dust drops to 50 particles on low-memory devices', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'deviceMemory', {
      configurable: true,
      get: () => 2,
    });
  });

  await page.goto('/?debug=dust');

  await expect.poll(() => page.evaluate(() => window.__scene0DustState?.count)).toBe(50);
});

test('Scene 0 dust stays disabled under reduced motion', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();

  await page.goto('/?debug=dust');
  await expect(page.locator('#ScrollRig-canvas canvas')).toHaveCount(0);
  expect(await page.evaluate(() => window.__scene0DustState)).toBeUndefined();
  await context.close();
});

declare global {
  interface Window {
    __scene0DustState?: {
      count: number;
      drawCalls: number;
      token: string;
    };
  }
}
