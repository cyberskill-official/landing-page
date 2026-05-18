import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import {
  applyAxeExclusions,
  BEST_PRACTICE_TAGS,
  blockingViolations,
  loadAxeExclusions,
  validateAxeExclusions,
  WCAG_TAGS,
  type AxeViolation,
} from './axe-config';

const routes = ['/', '/lite', '/work/sample', '/accessibility', '/vi', '/vi/lite', '/vi/work/sample', '/vi/accessibility'] as const;
const viewports = [
  { name: 'mobile', width: 375, height: 667 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'wide', width: 1920, height: 1080 },
] as const;

type A11yRouteReport = {
  bestPracticeViolations: AxeViolation[];
  blockingViolations: AxeViolation[];
  route: string;
  violations: AxeViolation[];
  viewport: string;
};

const report: A11yRouteReport[] = [];
const exclusions = loadAxeExclusions();

test.describe.configure({ mode: 'serial' });

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

test.beforeAll(() => {
  validateAxeExclusions(exclusions, new Date('2026-05-17T00:00:00Z'));
});

for (const route of routes) {
  for (const viewport of viewports) {
    test(`axe WCAG 2.2 AA has no serious or critical violations on ${route} at ${viewport.name}`, async ({ page }) => {
      await installCapableDeviceOverride(page);
      await page.setViewportSize({ width: viewport.width, height: viewport.height });
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expect(page.locator('main:not(.route-loading)').first()).toBeVisible();

      const wcagBuilder = applyAxeExclusions(
        new AxeBuilder({ page }).withTags([...WCAG_TAGS]),
        exclusions,
        route,
      );
      const wcagResult = await wcagBuilder.analyze();

      const bestPracticeBuilder = applyAxeExclusions(
        new AxeBuilder({ page }).withTags([...BEST_PRACTICE_TAGS]),
        exclusions,
        route,
      );
      const bestPracticeResult = await bestPracticeBuilder.analyze();
      const blocking = blockingViolations(wcagResult.violations as AxeViolation[]);

      report.push({
        bestPracticeViolations: bestPracticeResult.violations as AxeViolation[],
        blockingViolations: blocking,
        route,
        violations: wcagResult.violations as AxeViolation[],
        viewport: viewport.name,
      });

      expect(blocking, `${route} ${viewport.name} serious/critical axe violations`).toEqual([]);
    });
  }
}

test('keyboard-only skip-story flow reaches the CTA hub', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  await page.keyboard.press('Tab');
  await expect(page.locator(':focus')).toHaveAttribute('data-skip-story-pill', 'true');

  await page.keyboard.press('Enter');
  await page.waitForURL('**/#cta-hub');
  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('cta-hub');
});

test('interactive controls expose accessible names matching visible labels', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  await expect(page.getByRole('link', { name: 'Skip to call to action' })).toBeVisible();
  await expect(page.getByRole('button', { name: /muted|audio on/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Skip 3D entirely' })).toBeVisible();
});

test.afterAll(async () => {
  const reportPath = process.env.A11Y_REPORT_PATH ?? path.join('test-results', 'a11y-report.json');
  await mkdir(path.dirname(reportPath), { recursive: true });
  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
});
