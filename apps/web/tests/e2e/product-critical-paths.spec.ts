import { expect, test, type Page } from '@playwright/test';

const publicRoutes = [
  '/',
  '/vi',
  '/lite',
  '/vi/lite',
  '/work',
  '/vi/work',
  '/work/sample',
  '/vi/work/sample',
  '/capabilities',
  '/vi/capabilities',
  '/team',
  '/vi/team',
  '/careers',
  '/vi/careers',
  '/accessibility',
  '/vi/accessibility',
] as const;

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

for (const route of publicRoutes) {
  test(`public route ${route} renders reachable content`, async ({ page, request }) => {
    await installCapableDeviceOverride(page);
    const response = await request.get(route);
    expect(response.status(), `${route} response`).toBeLessThan(400);

    await page.goto(route);
    await expect(page.locator('main').first()).toBeVisible();
    await expect(page.locator('h1').first()).toBeVisible();
  });
}

test('home critical path exposes value proposition, route links, and no client analytics SDKs in SSR HTML', async ({ page, request }) => {
  await installCapableDeviceOverride(page);
  const response = await request.get('/');
  const html = await response.text();

  expect(html).toContain('What if your will became real?');
  expect(html).not.toMatch(/googletagmanager|gtag\(|plausible\.io\/js|data-domain=/i);

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'What if your will became real?' })).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore capabilities/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Sample work/i })).toBeVisible();
  await expect(page.getByLabel('Primary links').getByRole('link', { name: 'Accessibility' })).toBeVisible();
});

test('language switcher moves from English home to Vietnamese route', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Change language' }).click();
  await page.getByRole('button', { name: 'VI - Tieng Viet' }).click();

  await page.waitForURL('**/vi');
  await expect(page.locator('html')).toHaveAttribute('lang', 'vi');
  await expect(page.locator('h1').first()).toContainText('Neu y chi');
});

test('skip 3D and return-to-cinematic route are operable', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  await page.getByRole('button', { name: 'Skip 3D entirely' }).click();
  await page.waitForURL('**/lite');
  await expect(page.getByRole('heading', { name: /read-only mode/i })).toBeVisible();

  await page.getByRole('link', { name: /Back to full experience|Back to cinematic/i }).first().click();
  await page.waitForURL('**/');
  await expect(page.getByRole('heading', { name: 'What if your will became real?' })).toBeVisible();
});

test('skip story jumps to CTA hub and records a diagnostic analytics event', async ({ page }) => {
  await installCapableDeviceOverride(page);
  await page.goto('/');

  await page.getByRole('link', { name: 'Skip to call to action' }).click();
  await page.waitForURL('**/#cta-hub');

  await expect.poll(() => page.evaluate(() => document.activeElement?.id)).toBe('cta-hub');
  await expect.poll(() =>
    page.evaluate(() => window.__cyberskillAnalyticsEvents?.some((event) => event.name === 'skip_story_used')),
  ).toBe(true);
});

test('analytics API accepts valid events, rejects invalid events, and stays cookieless', async ({ request }) => {
  const headers = {
    'x-forwarded-for': `203.0.113.${Math.floor(Math.random() * 200) + 1}`,
  };
  const valid = await request.post('/api/analytics', {
    headers,
    data: {
      dedupe_id: `e2e-${Date.now()}`,
      event_name: 'scene_enter',
      properties: {
        email: 'should-not-forward@example.com',
        scene_id: 'scene-0',
      },
      referrer: 'https://google.com/search?q=private',
      url: 'https://cyberskill.world/',
    },
  });

  expect(valid.status()).toBe(202);
  expect(valid.headers()['set-cookie']).toBeUndefined();

  const invalid = await request.post('/api/analytics', {
    headers,
    data: {
      event_name: 'unknown_event',
      url: 'https://cyberskill.world/',
    },
  });
  expect(invalid.status()).toBe(400);
});

test('health endpoint reports ok status for launch probes', async ({ request }) => {
  const response = await request.get('/api/health');
  const body = await response.json() as { status: string; ts: string; uptime: number };

  expect(response.status()).toBe(200);
  expect(body.status).toBe('ok');
  expect(Date.parse(body.ts)).not.toBeNaN();
  expect(typeof body.uptime).toBe('number');
});
