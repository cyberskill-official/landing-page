import { expect, test, type Page } from '@playwright/test';

async function installCapableDeviceOverride(page: Page) {
  await page.addInitScript(() => {
    (window as typeof window & {
      __cyberskillCapabilityOverride?: { webgl2: boolean; saveData: boolean; deviceMemory: number };
    }).__cyberskillCapabilityOverride = {
      webgl2: true,
      saveData: false,
      deviceMemory: 8,
    };
  });
}

test('Scene 0 h1 and caption are present in SSR HTML without canvas', async ({ request }) => {
  const response = await request.get('/');
  const html = await response.text();

  expect(response.status()).toBe(200);
  expect(html).toContain('<h1 id="scene-0-title">What if your will became real?</h1>');
  expect(html).toContain("Whisper an idea. I&#x27;ll show you the rest.");
  expect(html).not.toContain('<canvas');
});

test('Scene 0 canvas mounts within 3s and exposes an accessible canvas label', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  await page.waitForSelector('canvas[aria-label="Lumi the golden genie waving hello"]', {
    timeout: 3_000,
  });
  await expect(page.locator('canvas')).toHaveAttribute('role', 'img');
});

test('Scene 0 sets Lumi animation from fly_in to idle', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  await page.waitForFunction(() => window.__scene0HeroState?.currentAnim === 'idle', {
    timeout: 3_500,
  });
  expect(await page.evaluate(() => window.__scene0HeroState?.sequence)).toEqual([
    'fly_in',
    'idle',
  ]);
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.currentAnim)).toBe('idle');
});

test('reduced motion keeps Scene 0 static and canvas-free', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await installCapableDeviceOverride(page);

  await page.goto('/');

  await expect(page.locator('#scene-0-title')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-lumi-static]')).toBeVisible();
  await context.close();
});
