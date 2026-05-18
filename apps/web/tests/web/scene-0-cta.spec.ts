import { expect, test } from '@playwright/test';

test('Scene 0 CTA is in SSR HTML and opens the Buy modal', async ({ page, request }) => {
  const response = await request.get('/');
  const html = await response.text();
  expect(html).toContain('data-scene-0-cta');
  expect(html).toContain('Book a Discovery Call');

  await page.goto('/?debug=stores');
  const heroCta = page.locator('[data-scene-0-cta-variant="hero"]');
  await expect(heroCta).toBeVisible();

  const box = await heroCta.boundingBox();
  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(box?.width).toBeGreaterThanOrEqual(44);

  await heroCta.focus();
  await expect(heroCta).toHaveCSS('outline-width', '2px');

  await heroCta.click();
  await expect(page.locator('[data-cta-modal="buy"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.focusedCta)).toBe('buy');
  await expect
    .poll(() => page.evaluate(() => window.__ctaOpenEvents?.at(-1)?.source))
    .toBe('scene-0-hero');
});

test('Scene 0 CTA crossfades to the sticky variant after scrolling', async ({ page }) => {
  await page.goto('/');

  const sticky = page.locator('[data-scene-0-cta-variant="sticky"]');
  await expect(sticky).toHaveCSS('opacity', '0');

  await page.evaluate(() => window.scrollTo(0, window.innerHeight + 240));
  await expect.poll(async () => Number(await sticky.evaluate((node) => getComputedStyle(node).opacity))).toBeGreaterThan(0.8);
  await expect.poll(() => page.evaluate(() => window.__scene0CtaState?.stickyActive)).toBe(true);

  const stickyZ = await sticky.evaluate((node) => Number(getComputedStyle(node).zIndex));
  const controlsZ = await page.locator('.a11y-control-strip').evaluate((node) => Number(getComputedStyle(node).zIndex));
  expect(controlsZ).toBeGreaterThan(stickyZ);
});

test('Scene 0 CTA keeps 44x44 target size at mobile width', async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
  const page = await context.newPage();

  await page.goto('/');
  const heroCta = page.locator('[data-scene-0-cta-variant="hero"]');
  const box = await heroCta.boundingBox();

  expect(box?.height).toBeGreaterThanOrEqual(44);
  expect(box?.width).toBeGreaterThanOrEqual(44);
  await context.close();
});

test('Scene 0 CTA does not render on /lite', async ({ page }) => {
  await page.goto('/lite');
  await expect(page.locator('[data-scene-0-cta]')).toHaveCount(0);
});

test('Scene 0 ?action=book deep-link opens the Buy modal', async ({ page }) => {
  await page.goto('/?action=book&debug=stores');

  await expect(page.locator('[data-cta-modal="buy"]')).toBeVisible();
  await expect.poll(() => page.evaluate(() => window.__stores?.lumi.focusedCta)).toBe('buy');
  await expect
    .poll(() => page.evaluate(() => window.__ctaOpenEvents?.at(-1)?.source))
    .toBe('scene-0-deeplink');
});

declare global {
  interface Window {
    __ctaOpenEvents?: Array<{ source: string }>;
    __scene0CtaState?: { stickyActive: boolean };
    __stores?: {
      lumi: {
        focusedCta: string | null;
      };
    };
  }
}
