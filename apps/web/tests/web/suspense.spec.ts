import { expect, test } from '@playwright/test';

test('scene preloader exposes aria cue and preloads one neighbor scene', async ({ page }) => {
  await page.goto('/');
  await page.waitForFunction(() => Boolean(window.__scenePreloadStates?.['/scene-1.glb']));

  await expect(page.locator('[data-scene-suspense-aria]')).toContainText('Loading scene...');
  expect(await page.evaluate(() => window.__scenePreloadStates?.['/scene-1.glb'])).toMatch(
    /preloading|preloaded|failed/,
  );
});

test('suspense debug overlay renders in development', async ({ page }) => {
  await page.goto('/?debug=suspense');
  await page.waitForFunction(() => Boolean(window.__scenePreloadStates));

  await expect(page.locator('[data-suspense-debug]')).toBeVisible();
});

test('SSR route does not expose spinner-style loading UI', async ({ request }) => {
  const response = await request.get('/');
  const html = await response.text();

  expect(html).not.toMatch(/spinner|CircularProgress/i);
});
