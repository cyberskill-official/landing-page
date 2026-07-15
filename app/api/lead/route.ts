import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { leadSchema, type LeadInput } from "@/lib/lead/schema";
import { company } from "@/lib/content/site";
import { getRequiredEnv } from "@/lib/ops/env";
import { buildAckEmail } from "@/lib/email/ack-templates";
import { mapLeadToCrm } from "@/lib/lead/crm-mapping";
import { getDb } from "@/lib/db";

export const runtime = "nodejs";

// Lead capture. Validates server-side, drops bot submissions (honeypot),
// always logs (partial data is still valuable), and best-effort fans out to a
// durable local file, an email notification to the company inbox, a Slack ping,
// and the CyberOS lead-intake webhook if configured. No secret reaches the client.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  // Honeypot tripped -> pretend success, store nothing (FR-CTA-013 §1.4).
  // Checked on raw body since Zod schema enforces max length 0 and would reject with 400.
  const rawWebsite = (body as any)?.website;
  if (rawWebsite && typeof rawWebsite === "string" && rawWebsite.length > 0) {
    return NextResponse.json({ ok: true });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation_error", message: "Invalid lead payload", issues: parsed.error.flatten().fieldErrors },
      { status: 400 },
    );
  }

  const lead = parsed.data;

  // 1.2 Cap check for teardown requests
  if (lead.source === "teardown") {
    const db = getDb();
    const count = await db.getTeardownCountThisWeek();
    const cap = parseInt(process.env.TEARDOWN_WEEKLY_CAP || "3", 10);
    if (count >= cap) {
      return NextResponse.json(
        { ok: false, error: "cap_exceeded", message: "Weekly teardown cap exceeded" },
        { status: 429 }
      );
    }
  }

  // Production fail-closed: email sink (Resend) is required.
  // CRM/CyberOS webhook is optional — forwardToCyberOs no-ops when unset
  // (operator may run Resend-only until FR-BIZ-002 / CyberOS intake is live).
  try {
    getRequiredEnv("RESEND_API_KEY", true);
  } catch (err: any) {
    console.error("[lead] configuration_error", err.message);
    return NextResponse.json(
      { ok: false, error: "configuration_error", message: err.message },
      { status: 500 }
    );
  }

  const record = {
    receivedAt: new Date().toISOString(),
    name: lead.name,
    email: lead.email,
    company: lead.company || null,
    intent: lead.intent,
    message: lead.message || null,
    locale: lead.locale,
    source: lead.source || "unknown",
    url: lead.url || null,
    // FR-OPS-011: UTM params forwarded to CRM if present
    utm: lead.utm_source || lead.utm_medium || lead.utm_campaign || lead.utm_term || lead.utm_content
      ? {
          utm_source: lead.utm_source || undefined,
          utm_medium: lead.utm_medium || undefined,
          utm_campaign: lead.utm_campaign || undefined,
          utm_term: lead.utm_term || undefined,
          utm_content: lead.utm_content || undefined,
        }
      : undefined,
  };

  // Always log (server-side).
  console.info("[lead]", JSON.stringify(record));

  // Fan out best-effort. A failed sink is logged but never fails the user's
  // submission (FR-CTA-007). Every lead is saved durably: to a local JSONL file
  // (works in dev and on any server with a writable disk) and, when configured,
  // to CyberOS via its lead-intake webhook - the system of record. Email and
  // Slack are the human notifications.
  const results = await Promise.allSettled([
    saveToFile(record),
    notifyEmail(record, lead.email, lead),
    notifySlack(record, lead),
    lead.source === "synthetic" ? Promise.resolve({ configured: false }) : forwardToCyberOs(record, lead),
    // FR-CTA-011: Best-effort ack to the lead. Skipped for synthetic.
    lead.source === "synthetic" ? Promise.resolve({ configured: false }) : notifyLeadAck(lead.email, lead.name, lead.locale),
    // FR-OPS-005: Save to datastore
    saveToDb(lead),
  ]);
  const channels = ["file", "email", "slack", "cyberos", "ack", "db"];
  
  let configuredCount = 0;
  let failedCount = 0;
  const failureReasons: Record<string, string> = {};

  results.forEach((r, i) => {
    const channel = channels[i];
    if (r.status === "rejected") {
      if (channel !== "ack") {
        configuredCount++;
        failedCount++;
      }
      failureReasons[channel] = String(r.reason);
      console.error(`[lead] ${channel} notify failed`, r.reason);
    } else if (r.value && r.value.configured) {
      if (channel !== "ack") {
        configuredCount++;
      }
    }
  });

  const isProduction = process.env.NODE_ENV === "production" || process.env.VITEST_FORCE_PROD === "true";
  if (isProduction && (configuredCount === 0 || configuredCount === failedCount)) {
    console.error(
      `[lead] pipeline failure: ${configuredCount} configured sinks, ${failedCount} failed`,
      failureReasons
    );
  }

  return NextResponse.json({ ok: true });
}

// Email the lead to the company inbox via Resend (raw fetch, no SDK). Gated on
// RESEND_API_KEY so it no-ops until configured.
async function notifyEmail(record: Record<string, unknown>, replyTo: string, lead: LeadInput): Promise<{ configured: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { configured: false };
  const domain = company.email.split("@")[1];
  const from = process.env.LEAD_EMAIL_FROM || `CyberSkill Leads <leads@${domain}>`;
  const lines = [
    `Name: ${record.name}`,
    `Email: ${record.email}`,
    `Company: ${record.company ?? "-"}`,
    `Intent: ${record.intent}`,
    `Locale/Source: ${record.locale}/${record.source}`,
    `Received: ${record.receivedAt}`,
    "",
    `Message:`,
    `${record.message ?? "(none)"}`,
  ];

  // FR-CHAR-027: Append transcript if present
  if (lead.transcript && lead.transcript.length > 0) {
    lines.push("", "--- Chat Transcript ---");
    lead.transcript.forEach((msg) => {
      lines.push(`[${msg.sender}]: ${msg.text}`);
    });
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
    body: JSON.stringify({
      from,
      to: [company.email],
      reply_to: replyTo,
      subject: `New lead: ${record.name} (${record.intent})`,
      text: lines.join("\n"),
    }),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`resend ${res.status} ${detail.slice(0, 300)}`);
  }
  return { configured: true };
}

// Durable local save: append one JSON line per lead to .data/leads.jsonl
async function saveToFile(record: Record<string, unknown>): Promise<{ configured: boolean }> {
  const dir = process.env.LEAD_STORE_DIR || join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(join(dir, "leads.jsonl"), JSON.stringify(record) + "\n", "utf8");
  return { configured: true };
}

async function notifySlack(record: Record<string, unknown>, lead: LeadInput): Promise<{ configured: boolean }> {
  const url = process.env.LEAD_SLACK_WEBHOOK_URL;
  if (!url) return { configured: false };
  let text = `New lead (${record.intent}) from ${record.name} <${record.email}>${
    record.company ? ` @ ${record.company}` : ""
  } [${record.locale}/${record.source}]`;

  // FR-CHAR-027: Append transcript if present
  if (lead.transcript && lead.transcript.length > 0) {
    const transcriptText = lead.transcript.map((msg) => `• *${msg.sender}*: ${msg.text}`).join("\n");
    text += `\n\n*Chat Transcript:*\n${transcriptText}`;
  }

  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return { configured: true };
}

// Durable system-of-record save: forward the lead to CyberOS via its lead-intake webhook.
async function forwardToCyberOs(record: Record<string, unknown>, lead: LeadInput): Promise<{ configured: boolean }> {
  const url = process.env.LEAD_CRM_WEBHOOK_URL;
  if (!url) return { configured: false };
  const token = process.env.LEAD_CRM_TOKEN;

  // FR-CTA-006: Map lead payload before forwarding to the CRM webhook
  const mapped = mapLeadToCrm(lead);

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(mapped),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`cyberos ${res.status} ${detail.slice(0, 300)}`);
  }
  return { configured: true };
}

// FR-CTA-011: Auto-acknowledgement email to the lead.
async function notifyLeadAck(
  toEmail: string,
  name: string,
  locale: string,
): Promise<{ configured: boolean }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { configured: false };

  const safeLocale = locale === "vi" ? "vi" : "en";
  const bookingUrl = process.env.LEAD_BOOKING_URL || undefined;
  const { subject, text } = buildAckEmail({ name, locale: safeLocale, bookingUrl });

  const domain = company.email.split("@")[1];
  const from = process.env.LEAD_ACK_FROM || `${company.phoneContact} at ${company.shortName} <${company.phoneContact.toLowerCase().replace(/[^a-z]/g, "")}@${domain}>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from,
        to: [toEmail],
        reply_to: company.email,
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      console.warn(`[lead:ack] resend ${res.status} ${detail.slice(0, 200)}`);
      return { configured: true }; // configured but non-fatal failure
    }
    return { configured: true };
  } catch (err) {
    console.warn("[lead:ack] failed to send ack email", err);
    return { configured: true }; // configured but non-fatal failure
  }
}

async function saveToDb(lead: LeadInput): Promise<{ configured: boolean }> {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    try {
      const db = getDb();
      const sessionId = lead.sessionId || `anon-${Math.random().toString(36).slice(2)}`;
      await db.saveLead({
        sessionId,
        email: lead.email,
        name: lead.name,
        locale: lead.locale,
        source: lead.source || "unknown",
        intent: lead.intent,
        utmSource: lead.utm_source,
        utmMedium: lead.utm_medium,
        utmCampaign: lead.utm_campaign,
      });
    } catch {
      // ignore
    }
    return { configured: false };
  }

  try {
    const db = getDb();
    const sessionId = lead.sessionId || `anon-${Math.random().toString(36).slice(2)}`;
    await db.saveLead({
      sessionId,
      email: lead.email,
      name: lead.name,
      locale: lead.locale,
      source: lead.source || "unknown",
      intent: lead.intent,
      utmSource: lead.utm_source,
      utmMedium: lead.utm_medium,
      utmCampaign: lead.utm_campaign,
    });
    return { configured: true };
  } catch (err) {
    console.error("[lead] datastore save failed", err);
    throw err;
  }
}
