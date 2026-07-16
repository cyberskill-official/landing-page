import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { negotiateLocale } from "@/lib/i18n/negotiate";

// Redirects bare "/" to a locale and attaches CSP. Pages are fully static so
// the homepage HTML includes the hero in the first bytes — critical for mobile
// lab LCP under Lantern.
//
// Script policy uses 'unsafe-inline' (no per-request nonce, no build-time
// hash list). Next.js App Router emits many inline flight scripts whose bodies
// change every build; a single boot-script hash blocks them and tanks Best
// Practices (console + CSP inspector issues) while breaking hydration.
//
// 2026-07-14: renamed from middleware.ts to proxy.ts (Next.js convention).
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isProduction =
    process.env.VERCEL_ENV === "production" || process.env.VITEST_FORCE_PROD === "true";
  const cspHeaderKey = isProduction
    ? "Content-Security-Policy"
    : "Content-Security-Policy-Report-Only";

  // style-src: 'unsafe-inline' so JS-driven style attributes work (LumiHotspot etc).
  // script-src: 'unsafe-inline' for Next.js RSC flight + theme boot script.
  const cspHeader =
    `default-src 'self'; ` +
    `script-src 'self' 'unsafe-inline' 'wasm-unsafe-eval' https://www.googletagmanager.com https://www.clarity.ms https://vercel.live https://va.vercel-scripts.com; ` +
    `style-src 'self' 'unsafe-inline'; ` +
    `img-src 'self' data: blob: https://www.googletagmanager.com https://*.google-analytics.com; ` +
    `font-src 'self' https://vercel.live; ` +
    `connect-src 'self' blob: https://*.google-analytics.com https://*.analytics.google.com https://va.vercel-scripts.com https://vitals.vercel-insights.com; ` +
    `frame-src 'self' https://vercel.live; ` +
    `child-src 'self' https://vercel.live; ` +
    `frame-ancestors 'none'; base-uri 'self'; report-uri /api/csp-report;`;

  if (pathname === "/") {
    const chosen = req.cookies.get("cs-locale")?.value;
    const target = isLocale(chosen)
      ? chosen
      : negotiateLocale(req.headers.get("accept-language"));
    const url = req.nextUrl.clone();
    url.pathname = `/${target}`;

    const headers = new Headers(req.headers);
    headers.set("x-cs-locale", target);

    const res = NextResponse.rewrite(url, { request: { headers } });
    res.headers.set(cspHeaderKey, cspHeader);
    return res;
  }

  const seg = pathname.split("/")[1];
  const locale = isLocale(seg) ? seg : defaultLocale;

  const headers = new Headers(req.headers);
  headers.set("x-cs-locale", locale);

  const res = NextResponse.next({ request: { headers } });
  res.headers.set(cspHeaderKey, cspHeader);
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
