import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";
import { negotiateLocale } from "@/lib/i18n/negotiate";

// Sends the active locale to the root layout (which owns <html lang>) via a
// request header, and redirects the bare "/" to a locale chosen from the
// visitor's Accept-Language header (FR-WEB-004), so every indexable page lives
// under /en or /vi and first-time visitors land in their own language.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    // An explicit switcher choice (cs-locale cookie) wins over header negotiation
    // so a returning reader is never re-routed against their selection (FR-WEB-004).
    const chosen = req.cookies.get("cs-locale")?.value;
    const target = isLocale(chosen) ? chosen : negotiateLocale(req.headers.get("accept-language"));
    const url = req.nextUrl.clone();
    url.pathname = `/${target}`;
    return NextResponse.redirect(url);
  }

  const seg = pathname.split("/")[1];
  const locale = isLocale(seg) ? seg : defaultLocale;

  const headers = new Headers(req.headers);
  headers.set("x-cs-locale", locale);
  return NextResponse.next({ request: { headers } });
}

export const config = {
  // Skip API, Next internals, and any path with a file extension.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
