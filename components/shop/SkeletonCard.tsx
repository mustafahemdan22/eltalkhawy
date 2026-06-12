'use client';

import { cn } from '@/lib/utils';

export default function SkeletonCard() {
  return (
    <div
      className={cn(
        'flex flex-col rounded-card overflow-hidden',
        'bg-[var(--bg-surface)] border border-[var(--border-subtle)]',
        'relative before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-[var(--bg-surface-raised)]/10 before:to-transparent',
      )}
    >
      <div className="relative aspect-product bg-surface-raised" />
      <div className="flex flex-col p-4 sm:p-5 gap-3.5 flex-1">
        <div className="space-y-1.5 min-h-[2.5rem]">
          <div className="h-3.5 bg-surface-raised rounded w-5/6" />
          <div className="h-3.5 bg-surface-raised rounded w-2/3" />
        </div>
        <div className="flex gap-1.5">
          <div className="h-7 bg-surface-raised rounded-pill w-12" />
          <div className="h-7 bg-surface-raised rounded-pill w-12" />
        </div>
        <div className="mt-auto space-y-1.5 min-h-[2.25rem]">
          <div className="h-3 bg-surface-raised rounded w-2/3" />
          <div className="h-4 bg-surface-raised rounded w-1/2" />
        </div>
        <div className="h-10 bg-surface-raised rounded-button w-full" />
      </div>
    </div>
  );
}
