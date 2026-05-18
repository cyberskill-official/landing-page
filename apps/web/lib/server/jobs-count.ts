import { fallbackJoinRoles, type AtsRole } from '@/components/cta/forms/schemas/join-schema';

export type JobsCountPayload = {
  count: number | null;
  error?: string;
  roles: AtsRole[];
};

export type AtsProvider = 'greenhouse' | 'lever' | 'workable';

let cache: { data: JobsCountPayload; expiresAt: number } | null = null;

export async function getJobsCountPayload(): Promise<JobsCountPayload> {
  if (cache && Date.now() < cache.expiresAt) {
    return cache.data;
  }

  try {
    const data = await fetchAtsRoles();
    cache = { data, expiresAt: Date.now() + 5 * 60 * 1000 };
    return data;
  } catch {
    const data = {
      count: null,
      error: 'ATS unavailable',
      roles: fallbackJoinRoles,
    };
    cache = { data, expiresAt: Date.now() + 60 * 1000 };
    return data;
  }
}

async function fetchAtsRoles(): Promise<JobsCountPayload> {
  const provider = normalizeProvider(process.env.ATS_PROVIDER);
  const baseUrl = process.env.ATS_BASE_URL ?? process.env.ATS_API_URL;
  const token = process.env.ATS_API_KEY;

  if (!baseUrl || !token) {
    return { count: fallbackJoinRoles.length, roles: fallbackJoinRoles };
  }

  const response = await fetch(atsUrl(provider, baseUrl), {
    headers: { authorization: `Bearer ${token}` },
    signal: AbortSignal.timeout(5000),
  });

  if (!response.ok) throw new Error(`ats_${response.status}`);

  const raw = await response.json();
  const roles = normalizeAts(raw, provider);
  return { count: roles.length, roles };
}

function normalizeProvider(value: string | undefined): AtsProvider {
  if (value === 'greenhouse' || value === 'lever' || value === 'workable') return value;
  return 'workable';
}

function atsUrl(provider: AtsProvider, baseUrl: string) {
  const root = baseUrl.replace(/\/$/, '');
  if (provider === 'greenhouse') return `${root}/v1/boards/cyberskill/jobs`;
  if (provider === 'lever') return `${root}/v0/postings/cyberskill?mode=json`;
  return `${root}/spi/v3/jobs?state=published`;
}

export function normalizeAts(raw: unknown, provider: AtsProvider): AtsRole[] {
  if (provider === 'greenhouse') {
    const jobs = asRecord(raw).jobs;
    return Array.isArray(jobs)
      ? jobs.map((job) => {
          const item = asRecord(job);
          const offices = Array.isArray(item.offices) ? item.offices.map(asRecord) : [];
          return {
            id: String(item.id ?? item.internal_job_id ?? item.title),
            location: String(offices[0]?.name ?? item.location ?? 'Remote'),
            title: String(item.title ?? 'Open role'),
          };
        })
      : [];
  }

  if (provider === 'lever') {
    const jobs = Array.isArray(raw) ? raw : [];
    return jobs.map((job) => {
      const item = asRecord(job);
      const categories = asRecord(item.categories);
      return {
        id: String(item.id ?? item.text),
        location: String(categories.location ?? 'Remote'),
        title: String(item.text ?? 'Open role'),
      };
    });
  }

  const jobs = asRecord(raw).jobs;
  return Array.isArray(jobs)
    ? jobs.map((job) => {
        const item = asRecord(job);
        const location = asRecord(item.location);
        return {
          id: String(item.shortcode ?? item.id ?? item.title),
          location: String(location.location_str ?? item.location ?? 'Remote'),
          title: String(item.title ?? 'Open role'),
        };
      })
    : [];
}

function asRecord(value: unknown) {
  return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

export function resetJobsCountCache() {
  cache = null;
}
