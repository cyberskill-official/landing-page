import { expect, test } from '@playwright/test';

test('focus ring is visible on the first keyboard target', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');

  const styles = await page.evaluate(() => {
    const element = document.activeElement as HTMLElement;
    const style = getComputedStyle(element);
    return {
      outlineColor: style.outlineColor,
      outlineOffset: style.outlineOffset,
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });

  expect(styles.outlineWidth).toBe('2px');
  expect(styles.outlineStyle).toBe('solid');
  expect(styles.outlineOffset).toBe('2px');
});
