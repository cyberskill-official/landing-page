import { expect, test } from '@playwright/test';

test('SSR HTML contains the loading fallback and no Three/R3F script names', async ({ request }) => {
  const response = await request.get('/');
  const html = await response.text();

  expect(html).toContain('Loading 3D scene');
  expect(html).not.toMatch(/<canvas\b/i);

  const scriptSrcs = [...html.matchAll(/<script[^>]+src="([^"]+)"/g)].map((match) => match[1] ?? '');
  for (const src of scriptSrcs) {
    expect(src).not.toMatch(/three|r3f|scroll-rig/i);
  }
});
