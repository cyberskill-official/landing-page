import type { LeadPayload } from '@/lib/forms/schemas/lead-schema';
import { UpstreamLeadError } from '@/lib/server/lead-errors';
import { stableLeadId } from '@/lib/server/lead-observability';

export async function atsCreateCandidate(payload: Extract<LeadPayload, { track: 'join' }>) {
  const endpoint = process.env.ATS_API_URL;
  const token = process.env.ATS_API_KEY;
  const localId = stableLeadId('ats-candidate', payload);

  if (!endpoint || !token) return localId;

  const response = await fetch(endpoint, {
    body: JSON.stringify({
      cover_note: payload.cover_note,
      email: payload.contact_email,
      name: payload.contact_name,
      portfolio_url: payload.portfolio_url,
      role_id: payload.role_id,
    }),
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new UpstreamLeadError('ats_upstream', response.status);
  }

  const data = (await response.json().catch(() => ({}))) as { id?: string; candidate_id?: string };
  return data.id ?? data.candidate_id ?? localId;
}
