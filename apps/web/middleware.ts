import { NextResponse, type NextRequest } from 'next/server';
import {
  buildLocalePath,
  localeFromAcceptLanguage,
  localeFromPathname,
  localeHeaderName,
  stripLocalePrefix,
} from './lib/i18n';

export function middleware(request: NextRequest) {
  const url = request.nextUrl.clone();
  const pathnameLocale = localeFromPathname(url.pathname);
  const headers = new Headers(request.headers);
  headers.set(localeHeaderName, pathnameLocale);

  if (url.pathname === '/') {
    const preferred = localeFromAcceptLanguage(request.headers.get('accept-language'));
    if (preferred === 'vi') {
      return NextResponse.redirect(new URL(buildLocalePath('/', 'vi'), request.url));
    }
  }

  if (pathnameLocale === 'vi') {
    url.pathname = stripLocalePrefix(url.pathname);
    url.searchParams.set('lang', 'vi');
    return NextResponse.rewrite(url, { request: { headers } });
  }

  return NextResponse.next({ request: { headers } });
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};

