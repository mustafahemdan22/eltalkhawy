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



/* ── Section Skeleton ── */
import SkeletonCard from '@/components/shop/SkeletonCard';

export function SectionSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
