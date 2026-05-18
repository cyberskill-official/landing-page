import { expect, test } from '@playwright/test';

test('keyboard-only flow reaches scene anchors without mouse input', async ({ page }) => {
  await page.goto('/');

  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('data-skip-story-pill', 'true');

  const nextButton = page.locator('[data-next-scene-button]').first();
  for (let index = 0; index < 10; index += 1) {
    if (await nextButton.evaluate((element) => document.activeElement === element)) break;
    await page.keyboard.press('Tab');
  }

  await expect(nextButton).toBeFocused();
  await page.keyboard.press('Enter');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('scene-3');
});
