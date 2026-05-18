import { afterEach, describe, expect, test, vi } from 'vitest';
import { normalizeAts, resetJobsCountCache } from '@/lib/server/jobs-count';
import { GET } from '../route';

describe('FR-CTA-004 /api/jobs-count route', () => {
  afterEach(() => {
    resetJobsCountCache();
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  test('returns local fallback roles when ATS env is not configured', async () => {
    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.count).toBe(3);
    expect(json.roles[0]).toHaveProperty('id');
  });

  test('normalizes Workable payloads', () => {
    expect(
      normalizeAts(
        {
          jobs: [
            {
              location: { location_str: 'Remote' },
              shortcode: 'r3f',
              title: 'Senior R3F Engineer',
            },
          ],
        },
        'workable',
      ),
    ).toEqual([{ id: 'r3f', location: 'Remote', title: 'Senior R3F Engineer' }]);
  });

  test('caches ATS responses for repeated calls', async () => {
    vi.stubEnv('ATS_API_KEY', 'ats-token');
    vi.stubEnv('ATS_API_URL', 'https://ats.example.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          jobs: [{ location: { location_str: 'Remote' }, shortcode: 'front', title: 'Frontend Engineer' }],
        }),
        { status: 200 },
      ),
    );

    await GET();
    await GET();

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  test('returns soft fallback when ATS fails', async () => {
    vi.stubEnv('ATS_API_KEY', 'ats-token');
    vi.stubEnv('ATS_API_URL', 'https://ats.example.test');
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 503 }));

    const response = await GET();
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toMatchObject({ count: null, error: 'ATS unavailable' });
    expect(json.roles.length).toBeGreaterThan(0);
  });
});
