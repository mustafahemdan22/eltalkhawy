import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

const isAdminRoute = createRouteMatcher(['/(.*)/admin/(.*)']);
const isCheckoutRoute = createRouteMatcher(['/(.*)/checkout']);


// Global rate limit store (use Redis in production)
declare global {
  var checkoutRateLimit: Map<string, number[]> | undefined;
}

export default clerkMiddleware(async (auth, req) => {
  const { userId, redirectToSignIn, sessionClaims } = await auth();
  const url = req.nextUrl;
  const locale = url.pathname.split('/')[1] || 'en';

  // Rate limiting for checkout (using in-memory map for simplicity; use Redis in production)
  if (isCheckoutRoute(req)) {
    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
    const now = Date.now();
    const key = `checkout:${ip}`;
    
    if (!global.checkoutRateLimit) global.checkoutRateLimit = new Map();
    const limit = global.checkoutRateLimit;
    
    const requests = limit.get(key) || [];
    const recent = requests.filter(t => now - t < 60_000);
    
    if (recent.length >= 10) {
      return new NextResponse(JSON.stringify({ error: 'Too many requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json', 'Retry-After': '60' },
      });
    }
    
    recent.push(now);
    limit.set(key, recent);
  }

  // Admin route protection
  if (isAdminRoute(req)) {
    if (!userId) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }
    
    // Check admin role via Clerk session claims (publicMetadata)
    const role = (sessionClaims?.publicMetadata as { role?: string })?.role;
    if (role !== 'admin') {
      return NextResponse.redirect(new URL(`/${locale}`, req.url));
    }
  }

  // Redirect root to default locale
  if (url.pathname === '/') {
    return NextResponse.redirect(new URL(`/en`, req.url));
  }

  // Security headers
  const res = NextResponse.next();
  res.headers.set('X-Content-Type-Options', 'nosniff');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      // Clerk JS SDK + Cloudflare Turnstile CAPTCHA (required for email sign-in/sign-up)
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://clerk.pstmrk.it https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
      "worker-src 'self' blob:",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      // Clerk CDN (provider logos + user avatars), Cloudinary (product images),
      // Google user content (Google OAuth avatars), Apple CDN (Apple logo), Unsplash
      "img-src 'self' data: blob: https://img.clerk.com https://*.clerk.com https://*.clerk.accounts.dev https://lh3.googleusercontent.com https://appleid.cdn-apple.com https://res.cloudinary.com https://images.unsplash.com",
      "connect-src 'self' https://*.convex.cloud https://*.clerk.accounts.dev https://*.clerk.com https://clerk.pstmrk.it wss://*.convex.cloud",
      // Clerk auth iframes + Cloudflare Turnstile widget iframe
      "frame-src https://*.clerk.accounts.dev https://*.clerk.com https://challenges.cloudflare.com",
      "form-action 'self'",
      "base-uri 'self'",
    ].join('; ')
  );

  return res;
});

export const config = {
  matcher: [
    '/((?!.*\\..*|_next|convex|api/convex).*)',
    '/',
    '/(api|trpc)(.*)',
  ],
};