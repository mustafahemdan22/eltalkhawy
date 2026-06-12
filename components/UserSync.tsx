'use client';

import { useEffect, useRef } from 'react';
import { useUser } from '@clerk/nextjs';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';

/**
 * Ensures the authenticated Clerk user has a corresponding record in
 * the Convex `users` table.
 *
 * Calls the secure `ensureUser` mutation which derives identity from
 * `ctx.auth` server-side — no sensitive data is sent from the client.
 *
 * This acts as a reliable fallback in case the Clerk webhook is delayed
 * or misconfigured. It is safe to call repeatedly (idempotent upsert).
 */
export default function UserSync() {
  const { isLoaded, isSignedIn } = useUser();
  const ensureUser = useMutation(api.users.ensureUser);
  const hasSynced = useRef(false);

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return;
    if (hasSynced.current) return;

    hasSynced.current = true;
    ensureUser().catch((err) => {
      // Reset so it retries on next render cycle
      hasSynced.current = false;
      console.error('UserSync: failed to ensure user', err);
    });
  }, [isLoaded, isSignedIn, ensureUser]);

  return null;
}
