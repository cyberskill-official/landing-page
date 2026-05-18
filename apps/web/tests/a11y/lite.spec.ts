import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const panelTitles = [
  'What if your will became real?',
  'Saigon, 2020.',
  'From sketch to system.',
  'How we turn will into real.',
  'Ten people. One craft.',
  'From Sài Gòn to your time zone.',
  'What do you want to make real?',
] as const;

function seriousOrCritical(violations: { impact?: string | null }[]) {
  return violations.filter((violation) => violation.impact === 'serious' || violation.impact === 'critical');
}

async function expectNoSeriousOrCriticalAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag22a', 'wcag22aa'])
    .analyze();

  expect(seriousOrCritical(results.violations)).toEqual([]);
}

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

test('/lite renders all seven storyboard panels without visual-runtime markers', async ({ page, request }) => {
  const response = await request.get('/lite');
  const html = await response.text();

  expect(response.status()).toBe(200);
  expect(html).not.toMatch(/<canvas|three|react-three|gsap|lenis/i);

  await page.goto('/lite');
  await expect(page.getByRole('heading', { level: 1, name: /read-only mode/i })).toBeVisible();

  for (const title of panelTitles) {
    await expect(page.getByRole('heading', { level: 2, name: title })).toBeVisible();
  }

  await expect(page.locator('[data-storyboard-panel]')).toHaveCount(7);
});

test('prefers-reduced-motion shows inline storyboard and keeps canvas unmounted', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await installCapableDeviceOverride(page);
  await page.addInitScript(() => {
    localStorage.setItem('cyberskill_lite_pref', '0');
  });

  await page.goto('/');
  await page.waitForTimeout(3_000);

  expect(await page.locator('canvas').count()).toBe(0);
  await expect(page.locator('.lite-inline')).toBeVisible();
  await expect(page.locator('.lite-inline [data-storyboard-panel]')).toHaveCount(7);

  const renderedTitles = await page.locator('.lite-inline h2').allTextContents();
  expect(renderedTitles).toEqual([...panelTitles]);

  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toBeVisible();

  await context.close();
});

test('reduced-motion CSS swap works without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();

  await page.goto('/');

  await expect(page.locator('.lite-inline')).toBeVisible();
  await expect(page.locator('.lite-inline [data-storyboard-panel]')).toHaveCount(7);
  expect(await page.locator('canvas').count()).toBe(0);

  await context.close();
});

test('skip and back links persist and clear the lite preference', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Skip 3D entirely' }).click();
  await page.waitForURL('**/lite');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBe('1');
  await expect(page.locator('[data-storyboard-panel]')).toHaveCount(7);

  await page.goto('/');
  await page.waitForURL('**/lite');

  await page.locator('.lite-panel [data-clear-lite-pref]').first().click();
  await page.waitForURL('**/');
  await expect.poll(() => page.evaluate(() => localStorage.getItem('cyberskill_lite_pref'))).toBeNull();
});

test('lite CTA targets reflow at mobile widths', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/lite');

  const ctas = page.locator('.lite-cta');
  await expect(ctas).toHaveCount(7);

  for (let i = 0; i < await ctas.count(); i += 1) {
    const box = await ctas.nth(i).boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }

  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/lite');
  const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  expect(scrollWidth).toBeLessThanOrEqual(320);
});

test('lite and reduced-motion pages have no serious or critical axe violations', async ({ browser, page }) => {
  await page.goto('/lite');
  await expectNoSeriousOrCriticalAxeViolations(page);

  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const reducedPage = await context.newPage();
  await installCapableDeviceOverride(reducedPage);
  await reducedPage.addInitScript(() => {
    localStorage.setItem('cyberskill_lite_pref', '0');
  });
  await reducedPage.goto('/');
  await expectNoSeriousOrCriticalAxeViolations(reducedPage);
  await context.close();
});
