import { NextResponse } from "next/server";
import { appendFile, mkdir } from "node:fs/promises";
import { join } from "node:path";
import { leadSchema } from "@/lib/lead/schema";
import { company } from "@/lib/content/site";

export const runtime = "nodejs";

// Lead capture. Validates server-side, drops bot submissions (honeypot),
// always logs (partial data is still valuable), and best-effort fans out to an
// email notification, a Slack ping, and a CRM webhook if configured. No secret
// ever reaches the client.
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const parsed = leadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, error: "validation", issues: parsed.error.flatten().fieldErrors },
      { status: 422 },
    );
  }

  const lead = parsed.data;

  // Honeypot tripped -> pretend success, store nothing.
  if (lead.website && lead.website.length > 0) {
    return NextResponse.json({ ok: true });
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
  };

  // Always log (server-side).
  console.info("[lead]", JSON.stringify(record));

  // Fan out best-effort. A failed sink is logged but never fails the user's
  // submission (FR-CTA-007). Every lead is durably saved: to a local JSONL file
  // (works in dev and on any server with a writable disk) and, when configured,
  // to a Supabase table; email / Slack / CRM are optional notifications.
  const results = await Promise.allSettled([
    saveToFile(record),
    saveToSupabase(record),
    notifyEmail(record, lead.email),
    notifySlack(record),
    forwardToCrm(record),
  ]);
  const channels = ["file", "supabase", "email", "slack", "crm"];
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[lead] ${channels[i]} notify failed`, r.reason);
  });

  return NextResponse.json({ ok: true });
}

// Email the lead to the company inbox via Resend (raw fetch, no SDK). Gated on
// RESEND_API_KEY so it no-ops until configured. Reply-To is the lead's address,
// so a reply from the inbox goes straight back to them. The From defaults to a
// sender on the company's (Resend-verified) domain so it works with just the
// key; LEAD_EMAIL_FROM overrides it.
async function notifyEmail(record: Record<string, unknown>, replyTo: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
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
}

// Durable local save: append one JSON line per lead to .data/leads.jsonl under
// the app's working directory. Works in dev and on any host with a writable
// disk (a VPS, a container). On a read-only serverless filesystem this throws
// and is caught by the fan-out - use Supabase / email there. Override the
// directory with LEAD_STORE_DIR (e.g. a mounted volume).
async function saveToFile(record: Record<string, unknown>): Promise<void> {
  const dir = process.env.LEAD_STORE_DIR || join(process.cwd(), ".data");
  await mkdir(dir, { recursive: true });
  await appendFile(join(dir, "leads.jsonl"), JSON.stringify(record) + "\n", "utf8");
}

// Durable cloud save: insert the lead into a Supabase table (default "leads")
// via the REST API with the service-role key (server-only). No-ops until
// SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are set, so it is safe to ship. The
// table needs columns matching the record keys (received_at, name, email,
// company, intent, message, locale, source).
async function saveToSupabase(record: Record<string, unknown>): Promise<void> {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return;
  const table = process.env.LEAD_SUPABASE_TABLE || "leads";
  const row = {
    received_at: record.receivedAt,
    name: record.name,
    email: record.email,
    company: record.company,
    intent: record.intent,
    message: record.message,
    locale: record.locale,
    source: record.source,
  };
  const res = await fetch(`${url.replace(/\/$/, "")}/rest/v1/${table}`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "application/json",
      prefer: "return=minimal",
    },
    body: JSON.stringify(row),
  });
  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`supabase ${res.status} ${detail.slice(0, 300)}`);
  }
}

async function notifySlack(record: Record<string, unknown>): Promise<void> {
  const url = process.env.LEAD_SLACK_WEBHOOK_URL;
  if (!url) return;
  const text = `New lead (${record.intent}) from ${record.name} <${record.email}>${
    record.company ? ` @ ${record.company}` : ""
  } [${record.locale}/${record.source}]`;
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ text }),
  });
}

async function forwardToCrm(record: Record<string, unknown>): Promise<void> {
  const url = process.env.LEAD_CRM_WEBHOOK_URL;
  if (!url) return;
  await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(record),
  });
}
