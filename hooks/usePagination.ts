'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback, useTransition } from 'react';

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.floor(parsed);
}

export interface UsePaginationOptions {
  defaultPage?: number;
  defaultLimit?: number;
  scrollToTop?: boolean;
}

/**
 * Reusable Next.js App Router client hook that syncs pagination state to URL search parameters.
 * Automatically handles page & limit state, URL updates, and transition pending states.
 */
export function usePagination(options?: UsePaginationOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const defaultPage = options?.defaultPage ?? 1;
  const defaultLimit = options?.defaultLimit ?? 12;
  const scrollToTop = options?.scrollToTop ?? true;

  const page = parsePositiveInt(searchParams.get('page'), defaultPage);
  const limit = parsePositiveInt(searchParams.get('limit'), defaultLimit);

  const updateParams = useCallback(
    (
      updates: Record<string, string | number | null>,
      method: 'push' | 'replace' = 'push',
      shouldScroll = scrollToTop
    ) => {
      const params = new URLSearchParams(searchParams.toString());

      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === undefined || value === '') {
          params.delete(key);
        } else {
          params.set(key, String(value));
        }
      });

      const query = params.toString();
      const nextUrl = query ? `${pathname}?${query}` : pathname;

      startTransition(() => {
        router[method](nextUrl, { scroll: shouldScroll });
      });
    },
    [searchParams, pathname, router, scrollToTop]
  );

  const setPage = useCallback(
    (newPage: number) => {
      updateParams({ page: Math.max(1, newPage) });
    },
    [updateParams]
  );

  const setLimit = useCallback(
    (newLimit: number) => {
      updateParams({ page: 1, limit: Math.max(1, newLimit) }); // Reset to page 1 on limit change
    },
    [updateParams]
  );

  const replacePagination = useCallback(
    (newPage: number, newLimit: number) => {
      updateParams(
        {
          page: Math.max(1, newPage),
          limit: Math.max(1, newLimit),
        },
        'replace',
        false
      );
    },
    [updateParams]
  );

  return {
    page,
    limit,
    setPage,
    setLimit,
    replacePagination,
    isPending,
  };
}
export type UsePaginationReturn = ReturnType<typeof usePagination>;
