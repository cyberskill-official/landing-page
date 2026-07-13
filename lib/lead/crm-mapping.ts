import type { LeadInput } from "./schema";

/**
 * FR-CTA-006 §1.2: CRM Field-mapping table.
 * Defines how each Next.js form field maps to a CRM property,
 * along with default owner and status metadata.
 */
export const CRM_FIELD_MAPPING = {
  name: "contact_name",
  email: "contact_email",
  company: "organization_name",
  intent: "lead_intent",
  message: "description",
  locale: "preferred_locale",
  source: "lead_source",
  utm_source: "campaign_source",
  utm_medium: "campaign_medium",
  utm_campaign: "campaign_name",
  utm_term: "campaign_term",
  utm_content: "campaign_content",
  transcript: "chat_transcript",
  // Defaults
  defaultOwner: "CyberSkill Sales Team",
  defaultLeadStatus: "New",
} as const;

export function mapLeadToCrm(lead: LeadInput) {
  return {
    [CRM_FIELD_MAPPING.name]: lead.name,
    [CRM_FIELD_MAPPING.email]: lead.email,
    [CRM_FIELD_MAPPING.company]: lead.company || "",
    [CRM_FIELD_MAPPING.intent]: lead.intent,
    [CRM_FIELD_MAPPING.message]: lead.message || "",
    [CRM_FIELD_MAPPING.locale]: lead.locale,
    [CRM_FIELD_MAPPING.source]: lead.source || "web_form",
    [CRM_FIELD_MAPPING.utm_source]: lead.utm_source || "",
    [CRM_FIELD_MAPPING.utm_medium]: lead.utm_medium || "",
    [CRM_FIELD_MAPPING.utm_campaign]: lead.utm_campaign || "",
    [CRM_FIELD_MAPPING.utm_term]: lead.utm_term || "",
    [CRM_FIELD_MAPPING.utm_content]: lead.utm_content || "",
    [CRM_FIELD_MAPPING.transcript]: lead.transcript
      ? lead.transcript.map((msg) => `[${msg.sender}]: ${msg.text}`).join("\n")
      : "",
    owner: CRM_FIELD_MAPPING.defaultOwner,
    status: CRM_FIELD_MAPPING.defaultLeadStatus,
  };
}
export type CrmMappedPayload = ReturnType<typeof mapLeadToCrm>;
