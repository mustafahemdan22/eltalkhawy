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
      {/* Image slot */}
      <div className="relative aspect-product bg-surface-raised" />

      {/* Info slot */}
      <div className="flex flex-col p-6 gap-4">
        {/* Title */}
        <div className="space-y-2">
          <div className="h-4 bg-surface-raised rounded w-5/6" />
          <div className="h-4 bg-surface-raised rounded w-2/3" />
        </div>

        {/* Rating spacer */}
        <div className="h-3 bg-surface-raised rounded w-1/3" />

        {/* Weight selector spacing */}
        <div className="flex gap-2">
          <div className="h-6 bg-surface-raised rounded w-12" />
          <div className="h-6 bg-surface-raised rounded w-12" />
        </div>

        {/* Price row */}
        <div className="h-5 bg-surface-raised rounded w-1/2" />

        {/* Button */}
        <div className="h-11 bg-surface-raised rounded w-full" />
      </div>
    </div>
  );
}
