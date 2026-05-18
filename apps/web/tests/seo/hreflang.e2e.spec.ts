import { expect, test } from '@playwright/test';

const routes = [
  '/',
  '/work',
  '/work/sample',
  '/capabilities',
  '/team',
  '/careers',
  '/accessibility',
  '/lite',
  '/vi',
  '/vi/work',
  '/vi/work/sample',
  '/vi/capabilities',
  '/vi/team',
  '/vi/careers',
  '/vi/accessibility',
  '/vi/lite',
] as const;

for (const route of routes) {
  test(`hreflang alternates on ${route}`, async ({ request }) => {
    const response = await request.get(route);
    const html = await response.text();

    expect(response.status()).toBeLessThan(400);
    expect(html).toContain('hrefLang="en"');
    expect(html).toContain('hrefLang="vi"');
    expect(html).toContain('hrefLang="x-default"');
    expect(html).toMatch(/href="https:\/\/cyberskill\.world\//);
  });
}

test('hreflang is absent on api routes', async ({ request }) => {
  const response = await request.get('/api/health');
  const body = await response.text();

  expect(response.status()).toBe(200);
  expect(body).not.toContain('hreflang');
  expect(body).not.toContain('hrefLang');
});

