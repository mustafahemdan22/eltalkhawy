import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { i18n } from '@/i18n-config';
import { match as matchLocale } from '@formatjs/intl-localematcher';
import Negotiator from 'negotiator';

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => { negotiatorHeaders[key] = value; });
  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  return matchLocale(languages, i18n.locales, i18n.defaultLocale);
}

const excludedPrefixes = ['/_next/', '/api/', '/_static/', '/_vercel', '/icon', '/favicon'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip non-page routes
  if (excludedPrefixes.some((p) => pathname.startsWith(p))) return;

  // Redirect root to detected locale
  if (!i18n.locales.some((loc) => pathname.startsWith(`/${loc}/`) || pathname === `/${loc}`)) {
    const locale = getLocale(request);
    const url = new URL(`/${locale}${pathname}${request.nextUrl.search}`, request.url);
    return NextResponse.redirect(url);
  }
}

export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
