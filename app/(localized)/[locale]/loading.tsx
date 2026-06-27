import { Skeleton } from '@/components/ui/Skeleton';
import SkeletonCard from '@/components/shop/SkeletonCard';

export default function Loading() {
  return (
    <main id="main-content" className="min-h-[60vh]">
      <div className="container-premium py-10 md:py-16 space-y-10">
        <div className="space-y-3 max-w-2xl">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          <div className="hidden lg:block space-y-4">
            <Skeleton className="h-6 w-1/2" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-5 md:gap-7">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
