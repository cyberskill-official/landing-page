import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

async function installCapableDeviceOverride(page: Page, deviceMemory = 8) {
  await page.addInitScript((memory) => {
    (window as typeof window & {
      __cyberskillCapabilityOverride?: { webgl2: boolean; saveData: boolean; deviceMemory: number };
    }).__cyberskillCapabilityOverride = {
      webgl2: true,
      saveData: false,
      deviceMemory: memory,
    };
  }, deviceMemory);
}

async function installAudioContextProbe(page: Page) {
  await page.addInitScript(() => {
    class FakeAudioContext {
      state: AudioContextState = 'suspended';

      resume() {
        (window as typeof window & { __audioResumeCount?: number }).__audioResumeCount =
          ((window as typeof window & { __audioResumeCount?: number }).__audioResumeCount ?? 0) + 1;
        this.state = 'running';
        return Promise.resolve();
      }
    }

    (window as typeof window & {
      AudioContext: typeof AudioContext;
      __audioContextConstructed?: number;
    }).AudioContext = class extends FakeAudioContext {
      constructor() {
        super();
        (window as typeof window & { __audioContextConstructed?: number }).__audioContextConstructed =
          ((window as typeof window & { __audioContextConstructed?: number }).__audioContextConstructed ?? 0) + 1;
      }
    } as typeof AudioContext;
  });
}

async function analyticsEvent(page: Page, name: string, source: string) {
  return page.evaluate(
    ({ expectedName, expectedSource }) =>
      window.__cyberskillAnalyticsEvents?.findLast(
        (event) => event.name === expectedName && event.payload.source === expectedSource,
      ) ?? null,
    { expectedName: name, expectedSource: source },
  );
}

test('mute toggle defaults to muted and does not auto-unmute on page interaction', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  const toggle = page.locator('[data-mute-toggle]');
  await expect(toggle).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(toggle).toContainText('Muted');

  await page.mouse.wheel(0, 900);
  await page.locator('body').click({ position: { x: 12, y: 220 } });
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
});

test('mute toggle persists across reload and announces state changes', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await installAudioContextProbe(page);
  await page.goto('/');

  const toggle = page.locator('[data-mute-toggle]');
  await toggle.click();

  await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  await expect(toggle).toContainText('Audio on');
  await expect(page.locator('[data-mute-toggle-status]')).toContainText('Audio enabled');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_mute_pref'))).toBe('off');
  await expect.poll(() => analyticsEvent(page, 'mute_toggled', 'click')).toMatchObject({
    name: 'mute_toggled',
    payload: { source: 'click' },
  });
  await expect.poll(() => page.evaluate(() => window.__audioContextConstructed)).toBe(1);
  await expect.poll(() => page.evaluate(() => window.__audioResumeCount)).toBe(1);

  await page.reload();
  await expect(toggle).toHaveAttribute('aria-pressed', 'false');

  await toggle.focus();
  await page.keyboard.press('Space');
  await expect(toggle).toHaveAttribute('aria-pressed', 'true');
  await expect(page.locator('[data-mute-toggle-status]')).toContainText('Audio muted');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_mute_pref'))).toBe('on');
  await expect.poll(() => analyticsEvent(page, 'mute_toggled', 'keyboard')).toMatchObject({
    name: 'mute_toggled',
    payload: { source: 'keyboard' },
  });
});

test('mute preference mirrors across tabs via storage event', async ({ browser }) => {
  const context = await browser.newContext();
  const pageOne = await context.newPage();
  const pageTwo = await context.newPage();
  await installCapableDeviceOverride(pageOne);
  await installCapableDeviceOverride(pageTwo);

  await pageOne.goto('/');
  await pageTwo.goto('/');

  await pageOne.locator('[data-mute-toggle]').click();
  await expect(pageTwo.locator('[data-mute-toggle]')).toHaveAttribute('aria-pressed', 'false');

  await pageTwo.locator('[data-mute-toggle]').click();
  await expect(pageOne.locator('[data-mute-toggle]')).toHaveAttribute('aria-pressed', 'true');

  await context.close();
});

test('mute toggle target size and low-memory hiding', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.setViewportSize({ width: 320, height: 720 });
  await page.goto('/');

  const box = await page.locator('[data-mute-toggle]').boundingBox();
  expect(box?.width).toBeGreaterThanOrEqual(44);
  expect(box?.height).toBeGreaterThanOrEqual(44);

  const lowMemoryPage = await page.context().newPage();
  await installCapableDeviceOverride(lowMemoryPage, 2);
  await lowMemoryPage.goto('/');
  await expect(lowMemoryPage.locator('[data-mute-toggle]')).toHaveCount(0);
  await lowMemoryPage.close();
});

test('a11y control strip has no serious or critical axe violations', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  const results = await new AxeBuilder({ page })
    .include('.a11y-control-strip')
    .withTags(['wcag2a', 'wcag2aa', 'wcag22a', 'wcag22aa'])
    .analyze();

  expect(results.violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical'))
    .toEqual([]);
});
