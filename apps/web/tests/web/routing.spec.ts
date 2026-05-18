import { expect, test } from '@playwright/test';

const canonicalRoutes = [
  { path: '/', canonical: 'https://cyberskill.world/' },
  { path: '/lite', canonical: 'https://cyberskill.world/' },
  { path: '/accessibility', canonical: 'https://cyberskill.world/accessibility' },
  { path: '/work/sample', canonical: 'https://cyberskill.world/work/sample' },
];

function withoutTrailingSlash(url: string) {
  return url === 'https://cyberskill.world/' ? 'https://cyberskill.world' : url;
}

function expectCanonical(html: string, canonical: string) {
  const normalized = withoutTrailingSlash(canonical);
  expect(html).toMatch(new RegExp(`rel="canonical" href="${normalized}/?"`));
}

for (const route of canonicalRoutes) {
  test(`${route.path} returns 200 with canonical metadata`, async ({ request }) => {
    const response = await request.get(route.path);
    const html = await response.text();

    expect(response.status()).toBe(200);
    expectCanonical(html, route.canonical);
  });
}

test('/lite publishes locale-prefixed hreflang', async ({ request }) => {
  const response = await request.get('/lite');
  const html = await response.text();

  expect(response.status()).toBe(200);
  expect(html).toMatch(/rel="alternate" hrefLang="x-default" href="https:\/\/cyberskill\.world\/lite\/?"/);
  expect(html).toMatch(/rel="alternate" hrefLang="vi" href="https:\/\/cyberskill\.world\/vi\/lite\/?"/);
});

test('/work/unknown returns friendly 404', async ({ page }) => {
  const response = await page.goto('/work/this-slug-does-not-exist');

  expect([200, 404]).toContain(response?.status());
  await expect(page.getByRole('heading', { name: /case study not found/i })).toBeVisible();
  expect(await page.locator('meta[name="robots"]').first().getAttribute('content')).toContain('noindex');
});

test('query-param Vietnamese rendering is available on public routes', async ({ page }) => {
  await page.goto('/accessibility?lang=vi');
  await expect(page.getByRole('heading', { name: /kha nang tiep can/i })).toBeVisible();

  await page.goto('/work/sample?lang=vi');
  await expect(page.getByRole('heading', { name: /tang toc he thong thiet ke/i })).toBeVisible();
});

test('sitemap.xml lists static and work routes', async ({ request }) => {
  const response = await request.get('/sitemap.xml');
  const xml = await response.text();

  expect(response.status()).toBe(200);
  expect(xml).toContain('<loc>https://cyberskill.world/</loc>');
  expect(xml).toContain('<loc>https://cyberskill.world/lite</loc>');
  expect(xml).toContain('<loc>https://cyberskill.world/accessibility</loc>');
  expect(xml).toContain('<loc>https://cyberskill.world/work/sample</loc>');
});

test('robots.txt blocks API indexing', async ({ request }) => {
  const response = await request.get('/robots.txt');
  const text = await response.text();

  expect(response.status()).toBe(200);
  expect(text).toContain('Allow: /');
  expect(text).toContain('Disallow: /api');
});
