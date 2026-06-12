'use client';

import { useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Silently redirects admin users to /admin after sign-in.
 * Placed in the root layout so it runs on every page.
 *
 * Behaviour:
 *  • Waits for Clerk + Convex to both be loaded
 *  • If the user is admin AND on a non-admin page → redirect to /:locale/admin
 *  • Never redirects admins already on /admin
 *  • Never redirects on sign-in/sign-up pages (avoids loops)
 *  • Only fires once per session (ref flag)
 */
export default function AdminRedirect() {
  const { isLoaded, isSignedIn } = useUser();
  const isAdmin = useQuery(
    api.users.isAdmin,
    isSignedIn ? undefined : 'skip',
  );
  const router = useRouter();
  const pathname = usePathname();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (!isLoaded || isAdmin === undefined) return;
    if (hasRedirected.current) return;
    if (!isSignedIn || !isAdmin) return;

    // Don't redirect if already on an admin page
    if (pathname.includes('/admin')) return;

    // Don't redirect on auth pages (avoid loops)
    if (pathname.includes('/sign-in') || pathname.includes('/sign-up')) return;

    // Extract locale prefix from the current path
    const localeMatch = pathname.match(/^\/(en|ar)/);
    const locale = localeMatch ? localeMatch[1] : 'en';

    hasRedirected.current = true;
    router.push(`/${locale}/admin`);
  }, [isLoaded, isSignedIn, isAdmin, pathname, router]);

  return null;
}
