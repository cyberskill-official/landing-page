import { NextResponse } from "next/server";
import { leadSchema } from "@/lib/lead/schema";

export const runtime = "nodejs";

// Lead capture. Validates server-side, drops bot submissions (honeypot),
// always logs (partial data is still valuable), and best-effort fans out to a
// Slack ping and a CRM webhook if configured. No secret ever reaches the client.
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

  await Promise.allSettled([
    notifySlack(record),
    forwardToCrm(record),
  ]);

  return NextResponse.json({ ok: true });
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
