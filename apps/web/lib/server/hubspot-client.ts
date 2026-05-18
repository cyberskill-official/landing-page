import type { LeadPayload } from '@/lib/forms/schemas/lead-schema';
import type { LeadMetadata } from '@/lib/server/hubspot-stage-router';
import { UpstreamLeadError } from '@/lib/server/lead-errors';
import { stableLeadId } from '@/lib/server/lead-observability';

const hubspotBaseUrl = 'https://api.hubapi.com/crm/v3/objects';

type HubspotResponse = {
  id?: string;
};

function toContactProperties(payload: Extract<LeadPayload, { track: 'buy' | 'partner' }>) {
  return {
    company: payload.track === 'partner' ? payload.agency_name : undefined,
    country: payload.country,
    email: payload.contact_email,
    firstname: payload.contact_name,
    hs_lead_status: payload.track === 'partner' ? 'PARTNER_INBOUND' : 'NEW',
    lifecyclestage: 'lead',
  };
}

function metadataProperties(metadata: LeadMetadata) {
  return Object.fromEntries(
    Object.entries({
      cyberskill_locale: metadata.locale,
      cyberskill_referrer: metadata.referrer,
      cyberskill_scene_id: metadata.scene_id,
      cyberskill_timestamp: metadata.timestamp,
      cyberskill_user_agent_redacted: metadata.user_agent_redacted,
      cyberskill_utm_campaign: metadata.utm_campaign,
      cyberskill_utm_content: metadata.utm_content,
      cyberskill_utm_medium: metadata.utm_medium,
      cyberskill_utm_source: metadata.utm_source,
      cyberskill_utm_term: metadata.utm_term,
    }).filter(([, value]) => value),
  );
}

function toDealProperties({
  contactId,
  metadata,
  payload,
  pipeline,
  stage,
}: {
  contactId: string;
  metadata: LeadMetadata;
  payload: Extract<LeadPayload, { track: 'buy' | 'partner' }>;
  pipeline: string;
  stage: string;
}) {
  const dealName = payload.track === 'partner' ? `${payload.agency_name} partner inbound` : `${payload.contact_name} discovery inquiry`;

  return {
    contact_id: contactId,
    dealname: dealName,
    dealstage: stage,
    description: payload.track === 'partner' ? payload.brief : payload.use_case,
    pipeline,
    ...metadataProperties(metadata),
  };
}

async function postHubspot(path: string, body: unknown) {
  const token = process.env.HUBSPOT_API_KEY;
  if (!token) return null;

  const response = await fetch(`${hubspotBaseUrl}${path}`, {
    body: JSON.stringify(body),
    headers: {
      authorization: `Bearer ${token}`,
      'content-type': 'application/json',
    },
    method: 'POST',
  });

  if (!response.ok) {
    throw new UpstreamLeadError('hubspot_upstream', response.status);
  }

  return (await response.json()) as HubspotResponse;
}

export async function hubspotCreateContact(payload: Extract<LeadPayload, { track: 'buy' | 'partner' }>) {
  const localId = stableLeadId('hubspot-contact', payload);
  const response = await postHubspot('/contacts', {
    properties: toContactProperties(payload),
  });
  return response?.id ?? localId;
}

export async function hubspotCreateDeal(
  contactId: string,
  route: { metadata: LeadMetadata; pipeline: string; stage: string },
  payload: Extract<LeadPayload, { track: 'buy' | 'partner' }>,
) {
  const localId = stableLeadId(`hubspot-deal-${route.stage}`, payload);
  const response = await postHubspot('/deals', {
    properties: toDealProperties({
      contactId,
      metadata: route.metadata,
      payload,
      pipeline: route.pipeline,
      stage: route.stage,
    }),
  });
  return response?.id ?? localId;
}
