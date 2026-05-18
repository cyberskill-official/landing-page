import { expect, test, type Page } from '@playwright/test';

async function overrideCapabilities(
  page: Page,
  override: { deviceMemory?: number; saveData?: boolean; webgl2?: boolean },
) {
  await page.addInitScript((value) => {
    (window as typeof window & { __cyberskillCapabilityOverride?: typeof value })
      .__cyberskillCapabilityOverride = value;
  }, override);
}

test('WebGL2-disabled browser redirects to /lite within 500ms', async ({ page }) => {
  await overrideCapabilities(page, { webgl2: false });

  await page.goto('/');
  await page.waitForURL('**/lite', { timeout: 1_500 });
  const redirectMs = Number(
    await page.evaluate(() => sessionStorage.getItem('cyberskill_lite_redirect_ms')),
  );

  expect(redirectMs).toBeLessThanOrEqual(500);
});

test('saveData shows non-modal banner with default focus on Switch', async ({ page }) => {
  await overrideCapabilities(page, { saveData: true, webgl2: true });
  await page.goto('/');

  const banner = page.locator('[data-save-data-banner]');
  await expect(banner).toBeVisible();
  await expect(banner).toHaveAttribute('aria-live', 'polite');
  await expect(page.locator(':focus')).toHaveText('Switch to /lite');

  await page.mouse.wheel(0, 600);
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(0);
});

test('saveData banner closes on Escape and Stay persists dismissal', async ({ page }) => {
  await overrideCapabilities(page, { saveData: true, webgl2: true });
  await page.goto('/');

  await expect(page.locator('[data-save-data-banner]')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('[data-save-data-banner]')).toHaveCount(0);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBe('0');

  await page.reload();
  await expect(page.locator('[data-save-data-banner]')).toHaveCount(0);
});

test('saveData switch persists /lite preference and redirects future / visits', async ({ page }) => {
  await overrideCapabilities(page, { saveData: true, webgl2: true });
  await page.goto('/');

  await page.getByRole('button', { name: 'Switch to /lite' }).click();
  await page.waitForURL('**/lite');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBe('1');

  await page.goto('/');
  await page.waitForURL('**/lite', { timeout: 1_500 });
});

test('deviceMemory below 4 sets lowMemoryMode in scene store', async ({ page }) => {
  await overrideCapabilities(page, { deviceMemory: 2, webgl2: true });
  await page.goto('/');
  await page.waitForFunction(() => window.__stores?.scene.lowMemoryMode === true);

  expect(await page.evaluate(() => window.__stores?.scene.lowMemoryMode)).toBe(true);
});

test('Vietnamese saveData banner uses lang query text', async ({ page }) => {
  await overrideCapabilities(page, { saveData: true, webgl2: true });
  await page.goto('/?lang=vi');

  await expect(page.locator('[data-save-data-banner]')).toContainText('Phiên bản nhẹ hơn');
});

test('accessibility reset link clears lite preference without redirecting away', async ({ page }) => {
  await page.goto('/accessibility');
  await page.evaluate(() => localStorage.setItem('cyberskill_lite_pref', '1'));

  await page.locator('[data-lite-pref-reset]').click();

  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBeNull();
  await expect(page.locator('[data-lite-pref-reset-status]')).toContainText('Preference reset.');
});

test('debug capability overlay renders detected values in development', async ({ page }) => {
  await overrideCapabilities(page, { deviceMemory: 8, saveData: false, webgl2: true });
  await page.goto('/?debug=capability');

  await expect(page.locator('[data-capability-debug]')).toContainText('webgl2: true');
});

test('SSR HTML for / remains cinematic before client capability redirect', async ({ request }) => {
  const response = await request.get('/');
  const html = await response.text();

  expect(response.status()).toBe(200);
  expect(html).toContain('What if your will became real?');
  expect(response.url()).toBe('http://127.0.0.1:3000/');
});
