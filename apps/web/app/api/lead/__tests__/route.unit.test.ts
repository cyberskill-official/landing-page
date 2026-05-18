import { afterEach, describe, expect, test, vi } from 'vitest';
import { leadCapturedExceptions, leadRetryQueue, leadStructuredLogs, resetLeadObservabilityState } from '@/lib/server/lead-observability';
import { resetLeadRateLimitState } from '@/lib/server/rate-limit';
import { OPTIONS, POST } from '../route';

function makeRequest(body: unknown, headers: Record<string, string> = {}) {
  return new Request('http://127.0.0.1:3000/api/lead', {
    body: JSON.stringify(body),
    headers: {
      'content-type': 'application/json',
      origin: 'http://127.0.0.1:3000',
      'user-agent': 'Mozilla/5.0 vitest',
      'x-forwarded-for': '203.0.113.10',
      ...headers,
    },
    method: 'POST',
  });
}

const buyPayload = {
  budget_range: 'tbd',
  consent: true,
  contact_email: 'buyer@example.com',
  contact_name: 'Buyer Person',
  track: 'buy',
  use_case: 'We need an immersive WebGL product configurator for a launch.',
} as const;

const partnerPayload = {
  agency_name: 'Acme Studio',
  brief: 'We need a senior R3F delivery partner for a retained client and want a reliable overflow team.',
  consent: true,
  contact_email: 'partner@example.com',
  contact_name: 'Partner Person',
  country: 'VN',
  monthly_capacity: 4,
  track: 'partner',
} as const;

const joinPayload = {
  consent: true,
  contact_email: 'candidate@example.com',
  contact_name: 'Candidate Person',
  portfolio_url: 'https://example.com/work',
  role_id: 'r3f',
  track: 'join',
} as const;

describe('FR-CTA-006 /api/lead route', () => {
  afterEach(() => {
    resetLeadObservabilityState();
    resetLeadRateLimitState();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test('returns 200 on a valid buy payload in local mode', async () => {
    const response = await POST(makeRequest(buyPayload));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({ ok: true });
    expect(json.lead_id).toMatch(/^hubspot-deal-inbound-discovery-/);
  });

  test('returns structured 400 errors on schema failure and missing consent', async () => {
    const missing = await POST(makeRequest({ contact_email: 'bad' }));
    const missingJson = await missing.json();

    expect(missing.status).toBe(400);
    expect(missingJson.ok).toBe(false);
    expect(missingJson.errors).toBeDefined();

    const noConsent = await POST(
      makeRequest({
        ...buyPayload,
        consent: false,
      }),
    );
    const noConsentJson = await noConsent.json();

    expect(noConsent.status).toBe(400);
    expect(noConsentJson.errors.consent).toContain('Required to process your data');
  });

  test('rate-limits after 5 requests per minute and returns Retry-After', async () => {
    for (let index = 0; index < 5; index += 1) {
      await POST(makeRequest({ ...buyPayload, contact_email: `buyer-${index}@example.com` }, { 'x-forwarded-for': '198.51.100.7' }));
    }

    const limited = await POST(makeRequest(buyPayload, { 'x-forwarded-for': '198.51.100.7' }));
    const json = await limited.json();

    expect(limited.status).toBe(429);
    expect(limited.headers.get('retry-after')).toBe('60');
    expect(json.challenge.provider).toBe('turnstile');
  });

  test('honeypot submissions return silent 200 and skip upstream calls', async () => {
    vi.stubEnv('HUBSPOT_API_KEY', 'test-token');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ id: 'unexpected' }), { status: 200 }));

    const response = await POST(makeRequest({ ...buyPayload, hp_email: 'bot@example.com' }));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ ok: true, lead_id: 'drop' });
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test('rejects cross-origin POST and preflight requests', async () => {
    const post = await POST(makeRequest(buyPayload, { origin: 'https://evil.example' }));
    const options = await OPTIONS(
      new Request('http://127.0.0.1:3000/api/lead', {
        headers: { origin: 'https://evil.example' },
        method: 'OPTIONS',
      }),
    );

    expect(post.status).toBe(403);
    expect(options.status).toBe(403);
  });

  test('routes buy and partner leads to HubSpot contact and deal APIs', async () => {
    vi.stubEnv('HUBSPOT_API_KEY', 'test-token');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(async (input) => {
      const url = String(input);
      return new Response(JSON.stringify({ id: url.endsWith('/contacts') ? 'contact-1' : 'deal-1' }), { status: 200 });
    });

    const buy = await POST(makeRequest(buyPayload));
    const partner = await POST(makeRequest(partnerPayload, { 'x-forwarded-for': '203.0.113.11' }));

    await expect(buy.json()).resolves.toMatchObject({ lead_id: 'deal-1', ok: true });
    await expect(partner.json()).resolves.toMatchObject({ lead_id: 'deal-1', ok: true });
    expect(fetchSpy).toHaveBeenCalledTimes(4);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toContain('/contacts');
    expect(String(fetchSpy.mock.calls[1]?.[0])).toContain('/deals');
  });

  test('routes join leads to the ATS API when configured', async () => {
    vi.stubEnv('ATS_API_KEY', 'ats-token');
    vi.stubEnv('ATS_API_URL', 'https://ats.example.test/candidates');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ candidate_id: 'candidate-1' }), { status: 200 }));

    const response = await POST(makeRequest(joinPayload));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({ lead_id: 'candidate-1', ok: true });
    expect(String(fetchSpy.mock.calls[0]?.[0])).toBe('https://ats.example.test/candidates');
  });

  test('queues retry and captures exceptions on upstream 5xx', async () => {
    vi.stubEnv('HUBSPOT_API_KEY', 'test-token');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(JSON.stringify({ error: 'outage' }), { status: 503 }));

    const response = await POST(makeRequest(buyPayload));
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.lead_id).toMatch(/^pending-/);
    expect(leadRetryQueue).toHaveLength(1);
    expect(leadCapturedExceptions).toHaveLength(1);
  });

  test('sends Slack notification on success without making Slack failures user-facing', async () => {
    vi.stubEnv('SLACK_WEBHOOK_URL', 'https://hooks.slack.example.test/lead');
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }));

    const response = await POST(makeRequest(partnerPayload));

    expect(response.status).toBe(200);
    expect(String(fetchSpy.mock.calls[0]?.[0])).toBe('https://hooks.slack.example.test/lead');
    expect(String(fetchSpy.mock.calls[0]?.[1]?.body)).toContain('track: partner');
  });

  test('writes anonymized logs without raw IP or raw email', async () => {
    await POST(makeRequest(partnerPayload, { 'x-forwarded-for': '192.0.2.44' }));
    const logBlob = JSON.stringify(leadStructuredLogs);

    expect(leadStructuredLogs[0]).toMatchObject({ kind: 'lead_success', success: true, track: 'partner' });
    expect(logBlob).not.toContain('192.0.2.44');
    expect(logBlob).not.toContain('partner@example.com');
    expect(logBlob).toContain('sha256:');
  });
});
