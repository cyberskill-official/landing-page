import type { LeadPayload } from '@/lib/forms/schemas/lead-schema';

function leadCountry(payload: LeadPayload) {
  return 'country' in payload ? payload.country : 'n/a';
}

function leadLabel(payload: LeadPayload) {
  if (payload.track === 'partner') return payload.agency_name;
  if (payload.track === 'join') return payload.role_id;
  return payload.budget_range;
}

export async function slackNotifyLead(payload: LeadPayload, leadId: string) {
  const webhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (!webhookUrl) return { sent: false };

  const response = await fetch(webhookUrl, {
    body: JSON.stringify({
      text: `\u{1F195} Lead inbound - track: ${payload.track} | country: ${leadCountry(payload)} | ref: ${leadLabel(payload)} | id: ${leadId}`,
    }),
    headers: { 'content-type': 'application/json' },
    method: 'POST',
  });

  return { sent: response.ok };
}

export async function notifyLeadRoutingAlert(message: string) {
  const results = {
    email: false,
    slack: false,
  };

  const slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  if (slackWebhookUrl) {
    const response = await fetch(slackWebhookUrl, {
      body: JSON.stringify({ text: `Lead routing alert - ${message}` }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });
    results.slack = response.ok;
  }

  const emailWebhookUrl = process.env.LEAD_ALERT_EMAIL_WEBHOOK_URL;
  if (emailWebhookUrl) {
    const response = await fetch(emailWebhookUrl, {
      body: JSON.stringify({
        subject: 'CyberSkill lead routing alert',
        text: message,
        to: process.env.LEAD_ALERT_EMAIL_TO ?? 'accessibility@cyberskill.world',
      }),
      headers: { 'content-type': 'application/json' },
      method: 'POST',
    });
    results.email = response.ok;
  }

  return results;
}
