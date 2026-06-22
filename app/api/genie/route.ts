import { NextResponse } from "next/server";
import { buildSystemPrompt } from "@/lib/genie/persona";
import { isLocale } from "@/lib/i18n/config";

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

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const b = buckets.get(ip);
  if (!b || now > b.resetAt) {
    buckets.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  b.count += 1;
  return b.count > MAX_REQ;
}

type InMsg = { role: "user" | "assistant"; content: string };

export async function POST(req: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    // No key configured: tell the client to fall back to the contact form.
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "anon";
  if (rateLimited(ip)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad_json" }, { status: 400 });
  }

  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > 30) {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const messages: InMsg[] = [];
  for (const m of raw) {
    const role = (m as InMsg)?.role;
    const content = (m as InMsg)?.content;
    if ((role === "user" || role === "assistant") && typeof content === "string" && content.length <= 4000) {
      messages.push({ role, content: content.trim() });
    }
  }
  if (messages.length === 0 || messages[0].role !== "user") {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  const localeRaw = (body as { locale?: string })?.locale;
  const locale = isLocale(localeRaw) ? localeRaw : "en";

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
    return NextResponse.json({ error: "upstream", status: upstream.status }, { status: 502 });
  }

  // Re-stream only the text deltas as plain UTF-8 so the client stays simple.
  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.body!.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      let buffer = "";
      try {
        for (;;) {
          const { done, value } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith("data:")) continue;
            const data = trimmed.slice(5).trim();
            if (!data || data === "[DONE]") continue;
            try {
              const evt = JSON.parse(data) as {
                type?: string;
                delta?: { type?: string; text?: string };
              };
              if (evt.type === "content_block_delta" && evt.delta?.type === "text_delta" && evt.delta.text) {
                controller.enqueue(encoder.encode(evt.delta.text));
              }
            } catch {
              // keepalive ping or partial frame; ignore
            }
          }
        }
      } catch {
        // upstream interrupted; close gracefully
      } finally {
        controller.close();
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
