import { cn } from '@/lib/utils';

interface SkeletonProps {
  className?: string;
  rounded?:   'sm' | 'md' | 'lg' | 'full' | 'card';
}

export function Skeleton({ className, rounded = 'md' }: SkeletonProps) {
  const r = {
    sm:   'rounded',
    md:   'rounded-md',
    lg:   'rounded-lg',
    full: 'rounded-full',
    card: 'rounded-card',
  }[rounded];

  return <div className={cn('skeleton', r, className)} aria-hidden="true" />;
}

/* ── Product Card Skeleton ── */
export function ProductCardSkeleton() {
  return (
    <div className="rounded-card bg-[var(--bg-surface)] border border-[var(--border-muted)] overflow-hidden">
      <Skeleton className="w-full aspect-product" rounded="sm" />
      <div className="p-5 space-y-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <div className="flex items-center gap-3 pt-1">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-11 w-full" rounded="md" />
      </div>
    </div>
  );
}

/* ── Section Skeleton ── */
export function SectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}
