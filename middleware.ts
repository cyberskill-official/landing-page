import { NextResponse, type NextRequest } from "next/server";
import { defaultLocale, isLocale } from "@/lib/i18n/config";

// Sends the active locale to the root layout (which owns <html lang>) via a
// request header, and redirects the bare "/" to the default locale so every
// indexable page lives under /en or /vi.
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/") {
    const url = req.nextUrl.clone();
    url.pathname = `/${defaultLocale}`;
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
