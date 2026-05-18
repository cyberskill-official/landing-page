import { expect, test, type Locator, type Page } from '@playwright/test';

const routes = ['/', '/vi', '/lite', '/work/sample', '/accessibility'] as const;
const viewports = [
  { name: 'narrow-mobile', width: 320, height: 720 },
  { name: 'mobile', width: 375, height: 667 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'wide', width: 1920, height: 1080 },
] as const;

const interactiveSelector = [
  'button:not([disabled])',
  'a[href]',
  'input:not([type="hidden"])',
  'select',
  'textarea',
  '[role="button"]',
].join(',');

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

async function visibleInteractives(scope: Page | Locator) {
  const locator = scope.locator(interactiveSelector);
  const count = await locator.count();
  const visible: Locator[] = [];

  for (let index = 0; index < count; index += 1) {
    const element = locator.nth(index);
    if (!(await element.isVisible())) continue;
    const isAuditable = await element.evaluate((node) => {
      const box = node.getBoundingClientRect();
      const label = [
        node.getAttribute('aria-label'),
        node.getAttribute('title'),
        node.textContent,
      ].join(' ');
      const hidden = node.closest('[aria-hidden="true"], [hidden], [inert]');
      const nextDevOverlay =
        label.includes('Next.js Dev Tools') ||
        label.includes('issues overlay') ||
        label.includes('issues badge');

      return (
        !hidden &&
        !nextDevOverlay &&
        box.width > 0 &&
        box.height > 0 &&
        box.right > 0 &&
        box.bottom > 0 &&
        box.left < window.innerWidth &&
        box.top < window.innerHeight
      );
    });
    if (!isAuditable) continue;
    visible.push(element);
  }

  return visible;
}

async function describeElement(element: Locator) {
  return element.evaluate((node) => {
    const tag = node.tagName.toLowerCase();
    const label =
      node.getAttribute('aria-label') ||
      node.getAttribute('data-cta-track') ||
      (node.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 80) ||
      node.getAttribute('name') ||
      node.getAttribute('id') ||
      'unnamed';
    return `${tag}: ${label}`;
  });
}

async function expectTargetSize(scope: Page | Locator, context: string) {
  const failures: string[] = [];

  for (const element of await visibleInteractives(scope)) {
    const box = await element.boundingBox();
    if (!box) continue;

    if (box.width < 44 || box.height < 44) {
      failures.push(`${await describeElement(element)} measured ${Math.round(box.width)}x${Math.round(box.height)} in ${context}`);
    }
  }

  expect(failures).toEqual([]);
}

for (const route of routes) {
  for (const viewport of viewports) {
    test(`visible controls are at least 44x44 on ${route} at ${viewport.name}`, async ({ page }) => {
      await installCapableDeviceOverride(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('main:not(.route-loading)').first()).toBeVisible();

      await expectTargetSize(page.locator('header, main, footer'), `${route} ${viewport.name}`);
    });
  }
}

test('CTA modal controls keep 44x44 targets at mobile size', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  for (const track of ['buy', 'partner', 'join'] as const) {
    await page.locator(`[data-cta-portal][data-cta-track="${track}"]`).click();
    const modal = page.locator(`[data-cta-modal="${track}"]`);
    await expect(modal).toBeVisible();
    await expectTargetSize(modal, `${track} modal mobile`);
    await modal.getByRole('button', { name: /cancel|close/i }).click();
    await expect(modal).toHaveCount(0);
  }
});
