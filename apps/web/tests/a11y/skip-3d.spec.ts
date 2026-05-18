import { expect, test, type Browser, type Page } from '@playwright/test';

const baseURL = 'http://127.0.0.1:3000';

type AnalyticsEvent = {
  name: string;
  payload: Record<string, unknown>;
} | null;

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

async function analyticsEvent(page: Page, name: string, source: string) {
  return page.evaluate(
    ({ expectedName, expectedSource }) =>
      window.__cyberskillAnalyticsEvents?.findLast(
        (event) => event.name === expectedName && event.payload?.source === expectedSource,
      ) as AnalyticsEvent,
    { expectedName: name, expectedSource: source },
  );
}

async function newContextPage(browser: Browser, options: Parameters<Browser['newContext']>[0] = {}) {
  const context = await browser.newContext({ baseURL, ...options });
  const page = await context.newPage();
  return { context, page };
}

test('clicking Skip 3D persists lite mode, navigates, announces, and shows the one-time toast', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  const toggle = page.getByRole('button', { name: 'Skip 3D entirely' });
  await toggle.click();

  await expect(page.locator('[data-skip-3d-status]')).toContainText('Switching to lite mode');
  await page.waitForURL('**/lite');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBe('1');
  await expect(page.locator('[data-lite-mode-toast]')).toContainText("You're now in lite mode.");
  await expect.poll(() => analyticsEvent(page, 'lite_mode_toggled', 'click')).toMatchObject({
    name: 'lite_mode_toggled',
    payload: { from: 'cinematic', to: 'lite', source: 'click' },
  });
});

test('keyboard activation uses keyboard analytics source and preserves 44px target size', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const toggle = page.locator('[data-skip-3d]');
  const box = await toggle.boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);

  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('data-skip-3d', 'true');

  const focusStyle = await toggle.evaluate((element) => {
    const style = window.getComputedStyle(element);
    return { color: style.outlineColor, width: style.outlineWidth };
  });
  expect(focusStyle).toEqual({ color: 'rgb(232, 181, 35)', width: '2px' });

  await page.keyboard.press('Space');
  await page.waitForURL('**/lite');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBe('1');
  await expect.poll(() => analyticsEvent(page, 'lite_mode_toggled', 'keyboard')).toMatchObject({
    name: 'lite_mode_toggled',
    payload: { from: 'cinematic', to: 'lite', source: 'keyboard' },
  });
});

test('subsequent visits to / auto-redirect while /lite itself does not loop', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.addInitScript(() => {
    localStorage.setItem('cyberskill_lite_pref', '1');
  });

  await page.goto('/');
  await page.waitForURL('**/lite');
  await expect.poll(() => analyticsEvent(page, 'lite_mode_toggled', 'auto_redirect')).toMatchObject({
    name: 'lite_mode_toggled',
    payload: { from: 'cinematic', to: 'lite', source: 'auto_redirect' },
  });

  await page.goto('/lite');
  await page.waitForTimeout(500);
  await expect(page).toHaveURL(/\/lite$/);
});

test('Back to cinematic clears lite preference, announces, and stores a session override', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/lite');
  await page.evaluate(() => localStorage.setItem('cyberskill_lite_pref', '1'));

  const announcement = await page.evaluate(() => {
    const link = document.querySelector<HTMLElement>('.lite-panel [data-clear-lite-pref]');
    const status = link?.parentElement?.querySelector<HTMLElement>('[data-back-cinematic-status]');
    link?.click();
    return status?.textContent ?? '';
  });

  expect(announcement).toBe('Switching to cinematic mode');
  await page.waitForURL('**/');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBeNull();
  await expect.poll(() => page.evaluate(() => sessionStorage.getItem('cyberskill_cinematic_override'))).toBe('1');
  await expect.poll(() => analyticsEvent(page, 'lite_mode_toggled', 'click')).toMatchObject({
    name: 'lite_mode_toggled',
    payload: { from: 'lite', to: 'cinematic', source: 'click' },
  });
});

test('OS reduced-motion auto-sets lite mode on first visit unless cinematic is explicitly chosen', async ({ browser }) => {
  const reduced = await newContextPage(browser, { reducedMotion: 'reduce' });
  await installCapableDeviceOverride(reduced.page);
  await reduced.page.goto('/');
  await reduced.page.waitForURL('**/lite');
  await expect.poll(() => reduced.page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBe('1');
  await expect.poll(() => analyticsEvent(reduced.page, 'lite_mode_toggled', 'auto_redirect')).toMatchObject({
    name: 'lite_mode_toggled',
    payload: { from: 'cinematic', to: 'lite', source: 'auto_redirect' },
  });
  await reduced.context.close();

  const explicit = await newContextPage(browser, { reducedMotion: 'reduce' });
  await installCapableDeviceOverride(explicit.page);
  await explicit.page.addInitScript(() => {
    localStorage.setItem('cyberskill_lite_pref', '0');
  });
  await explicit.page.goto('/');
  await expect(explicit.page).toHaveURL(/\/$/);
  await expect(explicit.page.locator('.lite-inline')).toBeVisible();
  await explicit.context.close();
});

test('no-JS fallback link reaches /lite', async ({ browser }) => {
  const { context, page } = await newContextPage(browser, { javaScriptEnabled: false });

  await page.goto('/');
  await page.locator('.skip-3d-noscript').click();
  await expect(page).toHaveURL(/\/lite$/);

  await context.close();
});
