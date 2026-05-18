import { expect, test, type APIResponse } from '@playwright/test';

const partnerPayload = {
  agency_name: 'Acme Studio',
  brief: 'We need a senior R3F delivery partner for a retained client and want a reliable overflow team.',
  consent: true,
  contact_email: 'partner@example.com',
  contact_name: 'Partner Person',
  country: 'VN',
  monthly_capacity: 4,
  track: 'partner',
};

test('lead API accepts a live partner payload within the latency budget', async ({ request }) => {
  const started = Date.now();
  const response = await request.post('/api/lead', {
    data: {
      ...partnerPayload,
      idempotency_key: `partner-${Date.now()}`,
    },
    headers: {
      origin: 'http://127.0.0.1:3000',
      'user-agent': 'Mozilla/5.0 Playwright',
      'x-forwarded-for': '203.0.113.101',
    },
  });
  const elapsed = Date.now() - started;
  const json = await response.json();

  expect(response.status()).toBe(200);
  expect(json).toMatchObject({ ok: true });
  expect(json.lead_id).toMatch(/^hubspot-deal-partner-pipeline-/);
  expect(elapsed).toBeLessThan(1500);
});

test('lead API enforces validation, CORS, honeypot, and live rate limits', async ({ request }) => {
  const invalid = await request.post('/api/lead', {
    data: { track: 'partner', contact_email: 'bad' },
    headers: {
      origin: 'http://127.0.0.1:3000',
      'user-agent': 'Mozilla/5.0 Playwright',
      'x-forwarded-for': '203.0.113.102',
    },
  });
  expect(invalid.status()).toBe(400);
  await expect(invalid.json()).resolves.toMatchObject({ ok: false });

  const crossOrigin = await request.post('/api/lead', {
    data: partnerPayload,
    headers: {
      origin: 'https://evil.example',
      'user-agent': 'Mozilla/5.0 Playwright',
      'x-forwarded-for': '203.0.113.103',
    },
  });
  expect(crossOrigin.status()).toBe(403);

  const honeypot = await request.post('/api/lead', {
    data: { ...partnerPayload, hp_email: 'bot@example.com' },
    headers: {
      origin: 'http://127.0.0.1:3000',
      'user-agent': 'Mozilla/5.0 Playwright',
      'x-forwarded-for': '203.0.113.104',
    },
  });
  await expect(honeypot.json()).resolves.toEqual({ ok: true, lead_id: 'drop' });

  const rateLimitIp = `198.51.${Math.floor(Date.now() / 1000) % 250}.${Date.now() % 250}`;
  let limited: APIResponse | undefined;
  for (let index = 0; index < 12; index += 1) {
    const response = await request.post('/api/lead', {
      data: {
        ...partnerPayload,
        contact_email: `rate-${Date.now()}-${index}@example.com`,
      },
      headers: {
        origin: 'http://127.0.0.1:3000',
        'user-agent': 'Mozilla/5.0 Playwright',
        'x-forwarded-for': rateLimitIp,
      },
    });
    if (response.status() === 429) {
      limited = response;
      break;
    }
  }

  expect(limited, 'live rate limiter should challenge repeated submissions from one IP').toBeTruthy();
  expect(limited.headers()['retry-after']).toBeTruthy();
});
