import { expect, test } from '@playwright/test';

test('canvas shadow mirrors expose one semantic scene description per narrative scene', async ({ page }) => {
  await page.goto('/');

  const mirrors = page.locator('[data-scene-shadow-mirror]');
  await expect(mirrors).toHaveCount(8);

  for (let index = 0; index < 8; index += 1) {
    const mirror = mirrors.nth(index);
    await expect(mirror).toHaveAttribute('role', 'img');
    await expect(mirror).toHaveAttribute('tabindex', '0');
    await expect(mirror.locator('[aria-atomic="true"]')).toContainText(`Scene ${index + 1} of 8:`);
  }

  await expect.poll(() => page.locator('canvas:not([aria-hidden="true"])').count()).toBe(0);
});

test('lite route renders shadow mirror content visibly', async ({ page }) => {
  await page.goto('/lite');

  await expect(page.locator('[data-scene-shadow-mirror="0"]')).toHaveClass(/scene-shadow-mirror--visible/);
  await expect(page.getByText("Scene 1 of 8: Whisper an idea. I'll show you the rest.")).toBeVisible();
});
