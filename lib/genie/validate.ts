import { isLocale, type Locale } from "@/lib/i18n/config";

// Pure request validation for the /api/genie chat proxy (TASK-CHAR-029). Kept
// separate from the route handler so the abuse-hardening rules - shape, role,
// per-message and total size caps, control-character stripping - are unit
// tested. The route stays a thin transport wrapper around this.

export type ChatMessage = { role: "user" | "assistant"; content: string };

export type ParseResult =
  | { ok: true; messages: ChatMessage[]; locale: Locale }
  | { ok: false; reason: string };

export const MAX_MESSAGES = 30;
export const MAX_CONTENT = 4000;
export const MAX_TOTAL = 12000;

// Drop C0/C1 control characters (keeping tab 0x09 and newline 0x0A) so a payload
// cannot smuggle terminal escapes or null bytes through the proxy, then trim.
// Done by code point (no control-char regex literal) to stay readable + safe.
export function cleanContent(s: string): string {
  let out = "";
  for (const ch of s) {
    const code = ch.codePointAt(0) ?? 0;
    const allowed = code === 0x09 || code === 0x0a;
    const isControl = code <= 0x1f || (code >= 0x7f && code <= 0x9f);
    if (isControl && !allowed) continue;
    out += ch;
  }
  return out.trim();
}

export function parseChatRequest(body: unknown): ParseResult {
  const raw = (body as { messages?: unknown })?.messages;
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > MAX_MESSAGES) {
    return { ok: false, reason: "messages must be a 1.." + MAX_MESSAGES + " array" };
  }

  const messages: ChatMessage[] = [];
  let total = 0;
  for (const m of raw) {
    const role = (m as ChatMessage)?.role;
    const content = (m as ChatMessage)?.content;
    if ((role !== "user" && role !== "assistant") || typeof content !== "string") continue;
    const c = cleanContent(content);
    if (c.length === 0 || c.length > MAX_CONTENT) continue;
    total += c.length;
    messages.push({ role, content: c });
  }

  if (messages.length === 0 || messages[0].role !== "user") {
    return { ok: false, reason: "first valid message must come from the user" };
  }
  if (total > MAX_TOTAL) {
    return { ok: false, reason: "total content exceeds " + MAX_TOTAL + " chars" };
  }

  const localeRaw = (body as { locale?: string })?.locale;
  const locale: Locale = isLocale(localeRaw) ? localeRaw : "en";
  return { ok: true, messages, locale };
}
