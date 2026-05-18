import { describe, expect, test, vi } from 'vitest';
import {
  createLeadMetadata,
  extractUtmFromHeaders,
  routeLead,
  stageConfigFromEnv,
  type LeadMetadata,
} from '../hubspot-stage-router';

const metadata: LeadMetadata = {
  locale: 'en',
  scene_id: 'scene-6',
  timestamp: '2026-05-18T00:00:00.000Z',
  user_agent_redacted: 'Mozilla/5.0',
};

describe('hubspot-stage-router', () => {
  test('routes buy leads to the configured inbound discovery HubSpot stage', () => {
    const result = routeLead('buy', metadata);

    expect(result).toMatchObject({
      destination: 'hubspot',
      pipeline: 'default',
      stage: 'inbound-discovery',
      track: 'buy',
    });
  });

  test('routes partner leads to the configured partner HubSpot pipeline', () => {
    const result = routeLead('partner', metadata, {
      buyPipeline: 'sales',
      buyStage: 'qualified',
      partnerPipeline: 'bd',
      partnerStage: 'partner-qualified',
    });

    expect(result).toMatchObject({
      destination: 'hubspot',
      pipeline: 'bd',
      stage: 'partner-qualified',
      track: 'partner',
    });
  });

  test('routes join leads to ATS and does not expose a HubSpot stage', () => {
    const result = routeLead('join', metadata);

    expect(result).toMatchObject({ destination: 'ats', track: 'join' });
    expect('stage' in result).toBe(false);
  });

  test('stage names and pipelines are driven by environment config', () => {
    expect(
      stageConfigFromEnv({
        HUBSPOT_PIPELINE_BUY: 'sales-pipeline-v2',
        HUBSPOT_PIPELINE_PARTNER: 'partner-pipeline-v2',
        HUBSPOT_STAGE_BUY: 'sales-discovery-v2',
        HUBSPOT_STAGE_PARTNER: 'partner-discovery-v2',
      }),
    ).toEqual({
      buyPipeline: 'sales-pipeline-v2',
      buyStage: 'sales-discovery-v2',
      partnerPipeline: 'partner-pipeline-v2',
      partnerStage: 'partner-discovery-v2',
    });
  });

  test('extracts UTM values from referrer and cookie with referrer taking precedence', () => {
    const headers = new Headers({
      cookie: `cyberskill_utm=${encodeURIComponent('utm_source=newsletter&utm_medium=email&utm_campaign=q2')}`,
      referer: 'https://cyberskill.world/?utm_source=linkedin&utm_content=scene-card&utm_term=ai',
    });

    expect(extractUtmFromHeaders(headers)).toMatchObject({
      referrer: 'https://cyberskill.world/?utm_source=linkedin&utm_content=scene-card&utm_term=ai',
      utm_campaign: 'q2',
      utm_content: 'scene-card',
      utm_medium: 'email',
      utm_source: 'linkedin',
      utm_term: 'ai',
    });
  });

  test('creates metadata with scene, locale, timestamp, redacted user agent, and direct fallback', () => {
    const payload = {
      budget_range: 'tbd',
      consent: true,
      contact_email: 'buyer@example.com',
      contact_name: 'Buyer Person',
      locale: 'vi',
      scene_id: 'scene-4',
      track: 'buy',
      use_case: 'We need a cinematic R3F launch experience with conversion forms.',
    } as const;

    expect(
      createLeadMetadata({
        headers: new Headers(),
        now: new Date('2026-05-18T01:02:03.000Z'),
        payload,
        requestUrl: 'https://cyberskill.world/api/lead',
        userAgentRedacted: 'Mozilla/5.0',
      }),
    ).toEqual({
      locale: 'vi',
      scene_id: 'scene-4',
      timestamp: '2026-05-18T01:02:03.000Z',
      user_agent_redacted: 'Mozilla/5.0',
      utm_source: 'direct',
    });
  });

  test('alerts on an unexpected track instead of silently routing', () => {
    const onAlert = vi.fn();
    const result = routeLead('support', metadata, stageConfigFromEnv({}), onAlert);

    expect(result).toMatchObject({
      alert: {
        code: 'unexpected_track',
        track: 'support',
      },
      destination: 'alert',
    });
    expect(onAlert).toHaveBeenCalledWith(expect.objectContaining({ code: 'unexpected_track' }));
  });
});
