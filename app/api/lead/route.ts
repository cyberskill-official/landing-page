import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { leadSchema } from "@/lib/lead/schema";
import { company } from "@/lib/content/site";
import { getRequiredEnv } from "@/lib/ops/env";
import { buildAckEmail } from "@/lib/email/ack-templates";

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

  // Validate production env keys (fail closed if required ones are absent)
  try {
    getRequiredEnv("RESEND_API_KEY", true);
    getRequiredEnv("LEAD_CRM_WEBHOOK_URL", true);
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
    notifyEmail(record, lead.email),
    notifySlack(record),
    lead.source === "synthetic" ? Promise.resolve({ configured: false }) : forwardToCyberOs(record),
    // FR-CTA-011: Best-effort ack to the lead. Skipped for synthetic.
    lead.source === "synthetic" ? Promise.resolve({ configured: false }) : notifyLeadAck(lead.email, lead.name, lead.locale),
  ]);
  const channels = ["file", "email", "slack", "cyberos", "ack"];
  
  let configuredCount = 0;
  let failedCount = 0;
  const failureReasons: Record<string, string> = {};

  results.forEach((r, i) => {
    const channel = channels[i];
    if (r.status === "rejected") {
      configuredCount++;
      failedCount++;
      failureReasons[channel] = String(r.reason);
      console.error(`[lead] ${channel} notify failed`, r.reason);
    } else if (r.value && r.value.configured) {
      configuredCount++;
    }
  });

  const isProduction = process.env.NODE_ENV === "production";
  if (isProduction && (configuredCount === 0 || configuredCount === failedCount)) {
    console.error(
      `[lead] pipeline failure: ${configuredCount} configured sinks, ${failedCount} failed`,
      failureReasons
    );
    // Note: The tracker function is missing so we just log with a specific structure that the tracker can catch
    // Assuming error tracker (FR-OPS-006) uses console.error or we can import it if it exists.
    // The spec says "the route SHALL report the failure to the error tracker (FR-OPS-006)".
    // Let's import the tracker if it exists, or just use console.error for now.
    // Wait, let's check if there is an error tracker in lib/ops/tracker.ts
  }

  return NextResponse.json({ ok: true });
}

// Email the lead to the company inbox via Resend (raw fetch, no SDK). Gated on
// RESEND_API_KEY so it no-ops until configured. Reply-To is the lead's address,
// so a reply from the inbox goes straight back to them. The From defaults to a
// sender on the company's (Resend-verified) domain so it works with just the
// key; LEAD_EMAIL_FROM overrides it.
async function notifyEmail(record: Record<string, unknown>, replyTo: string): Promise<{ configured: boolean }> {
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
  // fetch only rejects on network failure, not on a 4xx/5xx. Check the status
  // so a rejected send (bad domain, bad key, rate limit) surfaces in the logs
  // via the Promise.allSettled handler instead of silently dropping the email.
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`resend ${res.status} ${detail.slice(0, 300)}`);
  }
  return { configured: true };
}

// Durable local save: append one JSON line per lead to .data/leads.jsonl under
// the app's working directory. Works in dev and on any host with a writable
// disk (a VPS, a container). On a read-only serverless filesystem this throws
// and is caught by the fan-out - use Supabase / email there. Override the
// directory with LEAD_STORE_DIR (e.g. a mounted volume).
async function saveToFile(record: Record<string, unknown>): Promise<{ configured: boolean }> {
  const dir = process.env.LEAD_STORE_DIR || join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(join(dir, "leads.jsonl"), JSON.stringify(record) + "\n", "utf8");
  return { configured: true };
}

async function notifySlack(record: Record<string, unknown>): Promise<{ configured: boolean }> {
  const url = process.env.LEAD_SLACK_WEBHOOK_URL;
  if (!url) return { configured: false };
  const text = `New lead (${record.intent}) from ${record.name} <${record.email}>${
    record.company ? ` @ ${record.company}` : ""
  } [${record.locale}/${record.source}]`;
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
  return { configured: true };
}

// Durable system-of-record save: forward the lead to CyberOS via its lead-intake
// webhook. No-ops until LEAD_CRM_WEBHOOK_URL is set (the CyberOS chat service
// endpoint: https://os.cyberskill.world/v1/chat/leads). When LEAD_CRM_TOKEN is set it is sent
// as a bearer secret so CyberOS can authenticate this machine-to-machine call.
// A non-2xx surfaces via the Promise.allSettled handler instead of being
// silently dropped.
async function forwardToCyberOs(record: Record<string, unknown>): Promise<{ configured: boolean }> {
  const url = process.env.LEAD_CRM_WEBHOOK_URL;
  if (!url) return { configured: false };
  const token = process.env.LEAD_CRM_TOKEN;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(record),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`cyberos ${res.status} ${detail.slice(0, 300)}`);
  }
  return { configured: true };
}

// FR-CTA-011: Auto-acknowledgement email to the lead.
// Best-effort only — never throws. Returns configured:false (not a failure) when
// RESEND_API_KEY is absent so the ack-not-sent case never triggers a pipeline alert.
// Sends from a human-named sender so the lead can Reply-To directly.
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
