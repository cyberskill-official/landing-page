import { NextResponse } from "next/server";
import crypto from "node:crypto";
import { company } from "@/lib/content/site";
import { buildConfirmEmail } from "@/lib/email/subscribe-templates";

export const runtime = "nodejs";

const SIGNING_SECRET = process.env.SUBSCRIBE_SIGNING_SECRET || process.env.RESEND_API_KEY || "default_secret";

function generateToken(email: string): string {
  const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  const payload = `${email}:${expiresAt}`;
  const hmac = crypto.createHmac("sha256", SIGNING_SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${hmac}`).toString("base64url");
}

function verifyToken(token: string): { email: string; valid: boolean } {
  try {
    const decoded = Buffer.from(token, "base64url").toString("utf8");
    const parts = decoded.split(":");
    if (parts.length !== 3) return { email: "", valid: false };
    const [email, expiresAtStr, signature] = parts;
    const expiresAt = parseInt(expiresAtStr, 10);
    if (isNaN(expiresAt) || expiresAt < Date.now()) {
      return { email, valid: false };
    }
    const expectedPayload = `${email}:${expiresAtStr}`;
    const expectedHmac = crypto.createHmac("sha256", SIGNING_SECRET).update(expectedPayload).digest("hex");
    const valid = crypto.timingSafeEqual(
      Buffer.from(signature, "hex"),
      Buffer.from(expectedHmac, "hex")
    );
    return { email, valid };
  } catch {
    return { email: "", valid: false };
  }
}

// GET: Token confirmation / unsubscribe endpoint
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");
  const action = searchParams.get("action");
  const email = searchParams.get("email");

  const headers = { "Content-Type": "text/html; charset=utf-8" };

  // Handle unsubscribe
  if (action === "unsubscribe" && email) {
    const key = process.env.RESEND_API_KEY;
    const audienceId = process.env.RESEND_AUDIENCE_ID;

    if (key && audienceId) {
      try {
        // Find or update contact in audience to unsubscribed.
        // For Resend, we can call PUT /api/resend.com/contacts or delete contact.
        // Let's call DELETE or update status.
        await fetch(`https://api.resend.com/audiences/${audienceId}/contacts/${encodeURIComponent(email)}`, {
          method: "DELETE",
          headers: { Authorization: `Bearer ${key}` },
        });
      } catch (err) {
        console.error("[subscribe] unsubscribe error", err);
      }
    }

    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Unsubscribed — CyberSkill</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; background: #45210E; color: #FDF4E1; text-align: center; padding: 3rem 1rem; }
            .card { max-width: 400px; margin: 0 auto; background: #552B16; border: 1px solid #EAA042; padding: 2rem; border-radius: 8px; }
            h1 { color: #EAA042; margin-top: 0; }
            a { color: #EAA042; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Unsubscribed</h1>
            <p>You have been successfully removed from our newsletter audience.</p>
            <p><a href="/">Go to Home</a></p>
          </div>
        </body>
      </html>`,
      { headers }
    );
  }

  // Handle double opt-in confirmation token
  if (!token) {
    return new Response("Missing token", { status: 400 });
  }

  const { email: verifiedEmail, valid } = verifyToken(token);
  if (!valid || !verifiedEmail) {
    return new Response(
      `<!DOCTYPE html>
      <html>
        <head>
          <title>Invalid or Expired Token — CyberSkill</title>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <style>
            body { font-family: system-ui, sans-serif; background: #45210E; color: #FDF4E1; text-align: center; padding: 3rem 1rem; }
            .card { max-width: 400px; margin: 0 auto; background: #552B16; border: 1px solid #EA3C3C; padding: 2rem; border-radius: 8px; }
            h1 { color: #EA3C3C; margin-top: 0; }
            a { color: #EAA042; text-decoration: none; font-weight: bold; }
          </style>
        </head>
        <body>
          <div class="card">
            <h1>Verification Failed</h1>
            <p>The confirmation link has expired (24-hour limit) or is invalid.</p>
            <p><a href="/">Try subscribing again</a></p>
          </div>
        </body>
      </html>`,
      { status: 400, headers }
    );
  }

  const key = process.env.RESEND_API_KEY;
  const audienceId = process.env.RESEND_AUDIENCE_ID;

  if (key && audienceId) {
    try {
      const res = await fetch(`https://api.resend.com/audiences/${audienceId}/contacts`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${key}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: verifiedEmail,
          unsubscribed: false,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        console.error("[subscribe] failed adding to Resend contact list", res.status, errText);
      }
    } catch (err) {
      console.error("[subscribe] API connection error", err);
    }
  } else {
    console.log(`[subscribe] [NO-OP] Confirmed subscription for: ${verifiedEmail}`);
  }

  return new Response(
    `<!DOCTYPE html>
    <html>
      <head>
        <title>Subscription Confirmed — CyberSkill</title>
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <style>
          body { font-family: system-ui, sans-serif; background: #45210E; color: #FDF4E1; text-align: center; padding: 3rem 1rem; }
          .card { max-width: 400px; margin: 0 auto; background: #552B16; border: 1px solid #EAA042; padding: 2rem; border-radius: 8px; }
          h1 { color: #EAA042; margin-top: 0; }
          a { color: #EAA042; text-decoration: none; font-weight: bold; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Subscription Confirmed!</h1>
          <p>Thank you for confirming. You are now subscribed to the CyberSkill newsletter.</p>
          <p>Remember our promise: one high-quality email a month, nothing more.</p>
          <p><a href="/">Return to site</a></p>
        </div>
      </body>
    </html>`,
    { headers }
  );
}

// POST: Ingest newsletter signups and dispatch confirmation mailer
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "bad_json" }, { status: 400 });
  }

  const { email, locale, website } = (body as any) || {};

  // Honeypot triggered -> fake success
  if (website && typeof website === "string" && website.length > 0) {
    return NextResponse.json({ ok: true });
  }

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return NextResponse.json({ ok: false, error: "invalid_email" }, { status: 400 });
  }

  const validLocale = locale === "vi" ? "vi" : "en";

  const key = process.env.RESEND_API_KEY;
  if (!key) {
    console.log(`[subscribe] [NO-OP] Ingested subscription query for ${email} without API key configured.`);
    return NextResponse.json({ ok: true, note: "provider_env_missing_noop" });
  }

  const token = generateToken(email);
  const origin = new URL(req.url).origin;
  const confirmUrl = `${origin}/api/subscribe?token=${token}`;
  const unsubscribeUrl = `${origin}/api/subscribe?action=unsubscribe&email=${encodeURIComponent(email)}`;

  const mailData = buildConfirmEmail(validLocale, { confirmUrl, unsubscribeUrl });
  const domain = company.email.split("@")[1];
  const from = process.env.LEAD_EMAIL_FROM || `CyberSkill Newsletter <newsletter@${domain}>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [email],
        subject: mailData.subject,
        text: mailData.text,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("[subscribe] Resend dispatch failed", res.status, errText);
      return NextResponse.json({ ok: false, error: "dispatch_failed" }, { status: 500 });
    }
  } catch (err: any) {
    console.error("[subscribe] Connection error", err);
    return NextResponse.json({ ok: false, error: "network_error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
