import { expect, test } from '@playwright/test';

test('SSR headline is present and the canvas mounts after navigation', async ({ page, request }) => {
  const response = await request.get('/');
  const html = await response.text();

  expect(html).toContain('What if your will became real?');
  expect(html).not.toMatch(/<canvas|three\.module|react-three/i);

  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible({ timeout: 500 });
  await expect(page.locator('canvas')).toBeVisible({ timeout: 3_000 });
});

test('prefers-reduced-motion keeps the canvas unmounted', async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  const page = await context.newPage();

  await page.goto('/');
  await expect(page.locator('h1')).toBeVisible();
  await page.waitForTimeout(1_000);
  expect(await page.locator('canvas').count()).toBe(0);

  await context.close();
});

test('/lite stays pure DOM', async ({ page, request }) => {
  const response = await request.get('/lite');
  const html = await response.text();

  expect(response.ok()).toBe(true);
  expect(html).not.toMatch(/<canvas|three\.module|react-three/i);

  await page.goto('/lite');
  await expect(page.locator('h1')).toContainText('read-only mode');
  await page.waitForTimeout(1_000);
  expect(await page.locator('canvas').count()).toBe(0);
});
