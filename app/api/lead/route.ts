import { NextResponse } from "next/server";
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

  // Always log (server-side). In production, replace with a DB write.
  console.info("[lead]", JSON.stringify(record));

  // Fan out best-effort. A failed notification is logged but never fails the
  // user's submission (FR-CTA-007).
  const results = await Promise.allSettled([
    notifyEmail(record, lead.email),
    notifySlack(record),
    forwardToCrm(record),
  ]);
  const channels = ["email", "slack", "crm"];
  results.forEach((r, i) => {
    if (r.status === "rejected") console.error(`[lead] ${channels[i]} notify failed`, r.reason);
  });

  return NextResponse.json({ ok: true });
}

// Email the lead to the company inbox via Resend (raw fetch, no SDK). Gated on
// RESEND_API_KEY so it no-ops until configured. Reply-To is the lead's address,
// so a reply from the inbox goes straight back to them. The From address must be
// on a Resend-verified domain (set LEAD_EMAIL_FROM, e.g. "CyberSkill
// <leads@cyberskill.world>"); falls back to Resend's onboarding sender.
async function notifyEmail(record: Record<string, unknown>, replyTo: string): Promise<void> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return;
  const from = process.env.LEAD_EMAIL_FROM || "CyberSkill Leads <onboarding@resend.dev>";
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
  await fetch("https://api.resend.com/emails", {
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
