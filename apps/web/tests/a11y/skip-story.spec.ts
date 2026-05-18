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

async function installScrollIntoViewProbe(page: Page) {
  await page.addInitScript(() => {
    const original = Element.prototype.scrollIntoView;
    Element.prototype.scrollIntoView = function scrollIntoViewProbe(arg?: boolean | ScrollIntoViewOptions) {
      (window as typeof window & {
        __lastScrollIntoView?: { behavior?: ScrollBehavior; id?: string };
      }).__lastScrollIntoView = {
        behavior: typeof arg === 'object' ? arg.behavior : undefined,
        id: this instanceof HTMLElement ? this.id : undefined,
      };
      original.call(this, arg);
    };
  });
}

async function skipStoryEvents(page: Page) {
  return page.evaluate(() => window.__cyberskillAnalyticsEvents?.filter((event) => event.name === 'skip_story_used') ?? []);
}

test('skip-story pill is first focusable and targets the CTA hub', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  const pill = page.locator('[data-skip-story-pill]');
  await expect(pill).toBeVisible();
  await expect(pill).toHaveAttribute('href', '#cta-hub');
  await expect(pill).toHaveAttribute('aria-label', 'Skip to call to action');

  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('data-skip-story-pill', 'true');

  await page.keyboard.press('Enter');
  await page.waitForURL('**/#cta-hub');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('cta-hub');
  await expect(page.locator('[data-skip-story-status]')).toContainText('Skipping to call to action');
});

test('space key and pointer activation fire analytics with breakpoint', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  await page.keyboard.press('Tab');
  await page.keyboard.press(' ');
  await expect.poll(() => skipStoryEvents(page)).toContainEqual(
    expect.objectContaining({
      name: 'skip_story_used',
      payload: expect.objectContaining({ breakpoint: 'desktop' }),
    }),
  );

  await page.locator('[data-skip-story-pill]').click();
  await expect.poll(async () => (await skipStoryEvents(page)).length).toBe(2);
});

test('reduced-motion activation uses instant scroll behavior', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();
  await installCapableDeviceOverride(page);
  await installScrollIntoViewProbe(page);

  await page.goto('/');
  await page.locator('[data-skip-story-pill]').click();

  await expect.poll(() => page.evaluate(() => window.__lastScrollIntoView)).toEqual({
    behavior: 'auto',
    id: 'cta-hub',
  });

  await context.close();
});

test('skip-story pill remains visible and at least 44px across breakpoints', async ({ page }) => {
  await installCapableDeviceOverride(page);

  for (const width of [320, 768, 1280, 1920]) {
    await page.setViewportSize({ width, height: 720 });
    await page.goto('/');
    const pill = page.locator('[data-skip-story-pill]');
    await expect(pill).toBeVisible();

    const box = await pill.boundingBox();
    expect(box?.width).toBeGreaterThanOrEqual(44);
    expect(box?.height).toBeGreaterThanOrEqual(44);

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await expect(pill).toBeVisible();
  }
});

test('skip-story works on /lite as a native same-page jump target', async ({ page }) => {
  await page.goto('/lite');
  await page.locator('[data-skip-story-pill]').click();
  await page.waitForURL('**/lite#cta-hub');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('cta-hub');
});
