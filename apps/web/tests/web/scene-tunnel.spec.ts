import { expect, test } from '@playwright/test';

test('single canvas element survives a full scroll pass', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__lenis));

  for (let index = 0; index < 5; index += 1) {
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(150);
  }

  await expect(page.locator('canvas')).toHaveCount(1);
});

test('no WebGL context lost event fires during scroll', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(document.querySelector('canvas')));
  await page.evaluate(() => {
    window.__contextLost = false;
    document
      .querySelector('canvas')
      ?.addEventListener('webglcontextlost', () => {
        window.__contextLost = true;
      });
  });

  for (let index = 0; index < 8; index += 1) {
    await page.keyboard.press('PageDown');
    await page.waitForTimeout(100);
  }

  expect(await page.evaluate(() => window.__contextLost)).toBe(false);
});
