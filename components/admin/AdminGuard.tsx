'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@clerk/nextjs';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import { ShieldOff, LogIn, Home, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type GuardState = 'loading' | 'unauthenticated' | 'not-admin' | 'ok';

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const { isLoaded, isSignedIn } = useUser();
  const router = useRouter();
  const { locale, dict } = useLocale();
  const isAdmin = useQuery(api.users.isAdmin);
  const [delayed, setDelayed] = useState(false);

  // Small grace period so we don't flash the wrong state on fast networks.
  useEffect(() => {
    const t = setTimeout(() => setDelayed(true), 350);
    return () => clearTimeout(t);
  }, []);

  const state: GuardState = !isLoaded || isAdmin === undefined
    ? 'loading'
    : !isSignedIn
      ? 'unauthenticated'
      : !isAdmin
        ? 'not-admin'
        : 'ok';

  if (state === 'ok') return <>{children}</>;

  const isLoading = state === 'loading' && !delayed;
  const title =
    state === 'loading'
      ? dict.admin.guard.checking
      : state === 'unauthenticated'
        ? dict.admin.guard.notSignedIn
        : dict.admin.guard.notAdmin;

  return (
    <main
      className={cn(
        'min-h-[80vh] flex items-center justify-center px-4',
        'bg-[var(--bg-base)] text-[var(--text-primary)]',
      )}
    >
      <div
        className={cn(
          'w-full max-w-md rounded-card border border-[var(--border-subtle)]',
          'bg-[var(--bg-surface)] p-8 text-center shadow-card',
        )}
        role="status"
        aria-live="polite"
      >
        <div
          className={cn(
            'mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full',
            isLoading
              ? 'bg-[var(--gold-subtle)]/40 border border-[var(--gold-border)]/40'
              : 'bg-[var(--error)]/10 border border-[var(--error)]/30',
          )}
        >
          {isLoading ? (
            <Loader2 className="h-6 w-6 text-[var(--gold)] animate-spin" aria-hidden />
          ) : (
            <ShieldOff className="h-6 w-6 text-[var(--error)]" aria-hidden />
          )}
        </div>
        <h1 className="font-display text-xl font-bold text-[var(--text-primary)]">
          {dict.admin.guard.title}
        </h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)] leading-relaxed">{title}</p>

        {!isLoading && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {state === 'unauthenticated' && (
              <button
                type="button"
                onClick={() => router.push(`/${locale}/sign-in`)}
                className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-button text-sm font-semibold bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] shadow-gold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
              >
                <LogIn className="h-4 w-4" aria-hidden />
                {dict.admin.guard.goToSignIn}
              </button>
            )}
            <button
              type="button"
              onClick={() => router.push(`/${locale}`)}
              className="inline-flex items-center justify-center gap-2 h-11 px-6 rounded-button text-sm font-semibold border border-[var(--border-default)] text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
            >
              <Home className="h-4 w-4" aria-hidden />
              {dict.admin.guard.goToHome}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
