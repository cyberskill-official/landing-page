import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { negotiateLocale } from "@/lib/i18n/negotiate";

// Sends the active locale to the root layout (which owns <html lang>) via a
// request header, and redirects the bare "/" to a locale chosen from the
// visitor's Accept-Language header (FR-WEB-004), so every indexable page lives
// under /en or /vi and first-time visitors land in their own language.
//
// 2026-07-14: renamed from middleware.ts to proxy.ts (Next.js renamed the
// "middleware" file convention to "proxy" - same runtime, same API, just a
// different file name and exported function name). See
// https://nextjs.org/docs/messages/middleware-to-proxy
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // FR-OPS-009: Generate cryptographically secure base64 nonce for inline scripts.
  const nonce = crypto.randomUUID ? Buffer.from(crypto.randomUUID()).toString("base64") : "static-nonce-fallback";
  const cspHeader = `default-src 'self'; script-src 'self' 'nonce-${nonce}' https://www.googletagmanager.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://www.googletagmanager.com; font-src 'self'; connect-src 'self' https://*.google-analytics.com; frame-ancestors 'none'; base-uri 'self'; report-uri /api/csp-report;`;

  if (pathname === "/") {
    // An explicit switcher choice (cs-locale cookie) wins over header negotiation
    // so a returning reader is never re-routed against their selection (FR-WEB-004).
    const chosen = req.cookies.get("cs-locale")?.value;
    const target = isLocale(chosen) ? chosen : negotiateLocale(req.headers.get("accept-language"));
    const url = req.nextUrl.clone();
    url.pathname = `/${target}`;

    const headers = new Headers(req.headers);
    headers.set("x-cs-locale", target);
    headers.set("x-nonce", nonce);

    const res = NextResponse.rewrite(url, { request: { headers } });
    res.headers.set("Content-Security-Policy-Report-Only", cspHeader);
    return res;
  }

  const seg = pathname.split("/")[1];
  const locale = isLocale(seg) ? seg : defaultLocale;

  const headers = new Headers(req.headers);
  headers.set("x-cs-locale", locale);
  headers.set("x-nonce", nonce);

  const res = NextResponse.next({ request: { headers } });
  res.headers.set("Content-Security-Policy-Report-Only", cspHeader);
  return res;
}

export const config = {
  // Skip API, Next internals, and any path with a file extension.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
