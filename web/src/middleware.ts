import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';

import { locales, defaultLocale } from './i18n';
const APP_URLS = ['admin', 'search', 'auth', 'chat'];

export function middleware(request: NextRequest) {
  // if the request url is /admin, /search, just redirect to /en/admin, /en/search
  // extract url without prefix from request.url, like https://example.com/admin/abc -> /admin/abc
  const parts = request.url.split('/');
  if (parts.length < 3) 
    return NextResponse.next();


  const handleI18nRouting = createMiddleware({
    locales,
    defaultLocale
  });

  const response = handleI18nRouting(request);
  response.headers.set('x-default-locale', defaultLocale);

  const base_url = parts.slice(0, 3).join('/');
  const relative_url = parts.slice(3).join('/');
  if (APP_URLS.some((url) => relative_url.startsWith(url))) {
    // if the referer url contains locale info, use it, otherwise use accept-language header
    // TODO from stored cookie or user profile
    const requestHeaders = new Headers(request.headers);
    var locale = requestHeaders.get('referer')?.split('/')[3] || '';
    if (!locales.includes(locale)) {
      locale = request.headers.get('accept-language')?.split(',')[0] || '';
    }
    locale = locale || defaultLocale;
    requestHeaders.set('locale', locale);    
      
    const newUrl = `${base_url}/${locale}/${relative_url}`;
    NextResponse.redirect(newUrl);
  }

  return response;
}

export const config = {
  // Skip all paths that should not be internationalized.
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)']
};
