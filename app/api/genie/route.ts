import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/genie/persona";
import { makeAnthropicTextDecoder } from "@/lib/genie/sse";
import { parseChatRequest } from "@/lib/genie/validate";
import { getDb } from "@/lib/db";

// Serverless reverse proxy for Lumi. The ANTHROPIC_API_KEY lives only here, in
// server env; the browser calls this endpoint and never sees the key
// (research doc §D, NON-NEGOTIABLE). We validate input, rate-limit per IP, and
// stream the model's text back token-by-token.

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
// Streaming headroom on Vercel (Fluid/Node allows longer; 60s is safe for chat).
export const maxDuration = 60;

const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQ = 20;
// Best-effort, per-instance limiter. Serverless instances are ephemeral, so
// this is a guard against casual abuse, not a global quota (documented).
const buckets = new Map<string, { count: number; resetAt: number }>();

function checkLocalRate(ip: string): { limited: boolean; retryAfter: number } {
  const now = Date.now();
  // Bound memory on a long-lived instance: prune expired buckets when the map grows.
  if (buckets.size > 1000) {
    for (const [k, v] of buckets) if (now > v.resetAt) buckets.delete(k);
  }
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return { limited: false, retryAfter: 0 };
  }
  b.count += 1;
  return { limited: b.count > MAX_REQ, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
}

async function checkRate(ip: string): Promise<{ limited: boolean; retryAfter: number }> {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    return checkLocalRate(ip);
  }

  const key = `ratelimit:${ip}`;
  try {
    const res = await fetch(`${url}/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        ["INCR", key],
        ["TTL", key],
      ]),
      signal: AbortSignal.timeout(2000),
    });

    if (!res.ok) {
      throw new Error(`KV API error status ${res.status}`);
    }

    const data = (await res.json()) as Array<{ result: number }>;
    const count = data[0]?.result ?? 1;
    let ttl = data[1]?.result ?? -1;

    // If key is new (count is 1) or has no expiration (ttl is -1), set it to 300s (5m)
    if (count === 1 || ttl === -1) {
      await fetch(`${url}/expire/${key}/300`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      ttl = 300;
    }

    return {
      limited: count > MAX_REQ,
      retryAfter: ttl > 0 ? ttl : Math.ceil(WINDOW_MS / 1000),
    };
  } catch (err) {
    console.error("[genie/rate-limit] Durable rate limiter failed, failing safe to memory", err);
    return checkLocalRate(ip);
  }
}

import { getRequiredEnv } from "@/lib/ops/env";

export async function POST(req: Request) {
  let apiKey: string;
  try {
    apiKey = getRequiredEnv("ANTHROPIC_API_KEY", true);
  } catch (err: any) {
    console.error("[genie] configuration_error", err.message);
    return NextResponse.json({ error: "configuration_error", message: err.message }, { status: 500 });
  }

  if (!apiKey) {
    // No key configured: tell the client to fall back to the contact form.
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  const rate = await checkRate(ip);
  if (rate.limited) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rate.retryAfter) } },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  // Shape, role, per-message + total size caps, and control-char stripping
  // (TASK-CHAR-029) live in the unit-tested parseChatRequest.
  const parsed = parseChatRequest(body);
  if (!parsed.ok) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }
  const { messages, locale } = parsed;

  let upstream: Response;
  try {
    upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model: process.env.GENIE_MODEL ?? "claude-haiku-4-5-20251001",
        max_tokens: Number(process.env.GENIE_MAX_TOKENS ?? 600),
        temperature: 0.4,
        system: [
          { type: "text", text: buildSystemPrompt(locale), cache_control: { type: "ephemeral" } },
        ],
        messages,
        stream: true,
      }),
    });
  } catch {
    return NextResponse.json({ error: "upstream_unreachable" }, { status: 502 });
  }

  if (!upstream.ok || !upstream.body) {
    let detail: string | undefined;
    try {
      const errText = await upstream.text();
      console.error("[genie] upstream error", upstream.status, errText);
      try {
        detail = ((JSON.parse(errText) as { error?: { message?: string } })?.error?.message) ?? errText.slice(0, 300);
      } catch {
        detail = errText.slice(0, 300);
      }
    } catch {
      // ignore body read failure
    }
    return NextResponse.json({ error: "upstream", status: upstream.status, detail }, { status: 502 });
  }

  const rawBody = body as { sessionId?: string };
  const sessionId = typeof rawBody?.sessionId === "string" ? rawBody.sessionId : `anon-chat-${Math.random().toString(36).slice(2)}`;

  // Re-stream only the text deltas as plain UTF-8 so the client stays simple.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      const parse = makeAnthropicTextDecoder();
      let fullResponseText = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          for (const text of parse.push(decoder.decode(value, { stream: true }))) {
            fullResponseText += text;
            controller.enqueue(encoder.encode(text));
          }
        }
      } catch {
        // upstream interrupted; close gracefully
      } finally {
        controller.close();
        
        // Asynchronously persist the transcript to datastore (TASK-OPS-005 / TASK-CHAR-028)
        try {
          const db = getDb();
          const dbMessages = [
            ...messages.map((m) => ({
              sender: m.role === "user" ? "user" : "genie",
              text: m.content,
              ts: new Date().toISOString(),
            })),
            {
              sender: "genie",
              text: fullResponseText,
              ts: new Date().toISOString(),
            },
          ];
          await db.saveTranscript({
            sessionId,
            messages: dbMessages,
            locale: locale === "vi" ? "vi" : "en",
          });
        } catch (dbErr) {
          console.error("[genie] failed to persist transcript", dbErr);
        }
      }
    },
  });

  return new Response(stream, {
    headers: {
      "content-type": "text/plain; charset=utf-8",
      "cache-control": "no-store",
      "x-accel-buffering": "no",
    },
  });
}
