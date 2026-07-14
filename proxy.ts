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

  // FR-OPS-009 / FR-OPS-015: Generate cryptographically secure base64 nonce for inline scripts.
  const nonce = crypto.randomUUID ? Buffer.from(crypto.randomUUID()).toString("base64") : "static-nonce-fallback";
  
  const isProduction = process.env.VERCEL_ENV === "production" || process.env.VITEST_FORCE_PROD === "true";
  const cspHeaderKey = isProduction ? "Content-Security-Policy" : "Content-Security-Policy-Report-Only";
  // Always 'unsafe-inline', never a nonce here: per spec a nonce-source in the
  // list makes browsers ignore 'unsafe-inline' entirely, and Chrome does not
  // apply nonces to style ATTRIBUTES anyway (only to <style>/<link> tags) -
  // confirmed live on production, where every JS-driven inline style write
  // (LumiHotspot.tsx's per-frame el.style.transform, and similar in
  // BlackHole.tsx/LumiMagic.tsx) was being blocked outright. Those values are
  // computed fresh every animation frame, so hashing them is not viable.
  // style-src XSS risk is materially lower than script-src (no code
  // execution), so trading it for 'unsafe-inline' while keeping script-src
  // strict is the standard mitigation here.
  const styleSrc = `'self' 'unsafe-inline'`;

  // img-src needs `blob:` and script-src needs `'wasm-unsafe-eval'` for the
  // Lumi mascot's embedded glTF (components/canvas/GltfLumi.tsx): the loader
  // decodes bufferView images via URL.createObjectURL() (a blob: URL) and
  // decompresses the mesh through a WebAssembly module (drei's useGLTF /
  // Draco path), both of which the strict CSP blocked once it went from
  // report-only to enforcing in production - the model's base-color texture
  // failed closed to the glTF default (white), and on some loads the WASM
  // compile failure kept the mesh from rendering at all.
  // connect-src also needs `blob:`: three.js's texture path here loads the
  // same blob: URL via fetch(), not an <img> element, so img-src alone
  // doesn't cover it - Chrome's own console confirmed this in production:
  // "Connecting to 'blob:...' violates ... connect-src" / "Fetch API cannot
  // load blob:... Refused to connect". Without this, the texture still 404s
  // even with img-src fixed.
  // https://vercel.live on script-src: the Vercel Live Feedback/Toolbar
  // widget (_next-live/feedback/feedback.js) loads on production, not just
  // previews, and was hitting the same "script-src-elem falls back to
  // script-src" block seen live in the console. If the toolbar still can't
  // open a live connection after this (it uses a websocket back to Vercel),
  // that's connect-src, not script-src - not added here since nothing in the
  // captured console output pointed at connect-src being the blocker for it.
  const cspHeader = `default-src 'self'; script-src 'self' 'nonce-${nonce}' 'wasm-unsafe-eval' https://www.googletagmanager.com https://vercel.live; style-src ${styleSrc}; img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com; font-src 'self'; connect-src 'self' blob: https://*.google-analytics.com https://*.analytics.google.com; frame-ancestors 'none'; base-uri 'self'; report-uri /api/csp-report;`;

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
    res.headers.set(cspHeaderKey, cspHeader);
    return res;
  }

  const seg = pathname.split("/")[1];
  const locale = isLocale(seg) ? seg : defaultLocale;

  const headers = new Headers(req.headers);
  headers.set("x-cs-locale", locale);
  headers.set("x-nonce", nonce);

  const res = NextResponse.next({ request: { headers } });
  res.headers.set(cspHeaderKey, cspHeader);
  return res;
}

export const config = {
  // Skip API, Next internals, and any path with a file extension.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
