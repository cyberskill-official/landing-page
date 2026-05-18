import { createHmac } from 'node:crypto';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

const { revalidatePath, revalidateTag } = await import('next/cache');
const {
  POST,
} = await import('../route');
const { resetRevalidateRateLimitForTests } = await import('@/lib/sanity/revalidate-rate-limit');
const { pathsForSanityPayload } = await import('@/lib/sanity/revalidate-paths');

const SECRET = 'test-secret';
const ADMIN_TOKEN = 'admin-token';

function signedRequest(body: Record<string, unknown>, ip = '1.2.3.4') {
  const raw = JSON.stringify(body);
  const signature = createHmac('sha256', SECRET).update(raw).digest('hex');
  return new Request('http://localhost:3000/api/revalidate', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'sanity-webhook-signature': signature,
      'x-forwarded-for': ip,
    },
    body: raw,
  });
}

describe('/api/revalidate', () => {
  beforeEach(() => {
    process.env.SANITY_WEBHOOK_SECRET = SECRET;
    process.env.REVALIDATE_ADMIN_TOKEN = ADMIN_TOKEN;
    vi.spyOn(console, 'info').mockImplementation(() => undefined);
    vi.clearAllMocks();
    resetRevalidateRateLimitForTests();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test('maps case studies to home, work list, detail path, and tag revalidation', async () => {
    const response = await POST(signedRequest({
      _id: 'abc',
      _type: 'case_study',
      slug: { current: 'test' },
      i18n_locale: 'en',
    }));

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      revalidated: true,
      paths: ['/', '/work', '/work/test'],
      tags: ['cms:case_study'],
    });
    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/work/test');
    expect(revalidateTag).toHaveBeenCalledWith('cms:case_study');
  });

  test('adds Vietnamese variants for vi locale payloads', () => {
    expect(pathsForSanityPayload({
      _type: 'case_study',
      slug: { current: 'test' },
      i18n_locale: 'vi',
    })).toEqual(['/', '/work', '/work/test', '/vi', '/vi/work', '/vi/work/test']);
  });

  test('rejects invalid signatures with 401', async () => {
    const response = await POST(new Request('http://localhost:3000/api/revalidate', {
      method: 'POST',
      headers: {
        'sanity-webhook-signature': 'bad',
        'x-forwarded-for': '1.2.3.4',
      },
      body: JSON.stringify({ _type: 'case_study' }),
    }));

    await expect(response.json()).resolves.toMatchObject({ ok: false, error: 'invalid_signature' });
    expect(response.status).toBe(401);
  });

  test('manual mode requires a bearer admin token', async () => {
    const response = await POST(new Request('http://localhost:3000/api/revalidate?path=/', {
      method: 'POST',
      headers: { 'x-forwarded-for': '1.2.3.4' },
    }));

    expect(response.status).toBe(401);
  });

  test('manual mode revalidates a validated path', async () => {
    const response = await POST(new Request('http://localhost:3000/api/revalidate?path=/work/sample', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${ADMIN_TOKEN}`,
        'x-forwarded-for': '1.2.3.4',
      },
    }));

    await expect(response.json()).resolves.toMatchObject({
      ok: true,
      revalidated: true,
      paths: ['/work/sample'],
    });
    expect(response.status).toBe(200);
    expect(revalidatePath).toHaveBeenCalledWith('/work/sample');
  });

  test('manual mode refuses api routes and traversal paths', async () => {
    const response = await POST(new Request('http://localhost:3000/api/revalidate?path=/api/health', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${ADMIN_TOKEN}`,
        'x-forwarded-for': '1.2.3.4',
      },
    }));

    expect(response.status).toBe(400);
  });

  test('unknown document types fall back to the homepage', async () => {
    const response = await POST(signedRequest({ _id: 'x', _type: 'unknown' }));
    const body = await response.json();

    expect(body.paths).toEqual(['/']);
    expect(revalidatePath).toHaveBeenCalledWith('/');
  });

  test('rate limits after 60 requests per minute per client', async () => {
    for (let index = 0; index < 60; index += 1) {
      await POST(signedRequest({ _type: 'case_study', slug: { current: `case-${index}` } }));
    }

    const response = await POST(signedRequest({ _type: 'case_study', slug: { current: 'case-60' } }));
    await expect(response.json()).resolves.toMatchObject({ ok: false, error: 'rate_limit' });
    expect(response.status).toBe(429);
  });

  test('logs anonymized payload details without authorization or secret values', async () => {
    const info = vi.mocked(console.info);

    await POST(new Request('http://localhost:3000/api/revalidate?path=/work/sample', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${ADMIN_TOKEN}`,
        'x-forwarded-for': '1.2.3.4',
      },
    }));

    expect(info).toHaveBeenCalled();
    const serialized = info.mock.calls.map((call) => call.join(' ')).join('\n');
    expect(serialized).not.toContain(ADMIN_TOKEN);
    expect(serialized).not.toContain('authorization');
  });
});
