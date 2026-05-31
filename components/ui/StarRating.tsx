import { Star, StarHalf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getStars } from '@/lib/utils';

interface StarRatingProps {
  rating:      number;
  reviewCount?: number;
  size?:       'sm' | 'md' | 'lg';
  showCount?:  boolean;
  className?:  string;
}

const sizeMap = {
  sm: 'w-3.5 h-3.5',
  md: 'w-4 h-4',
  lg: 'w-5 h-5',
};

const textSizeMap = {
  sm: 'text-xs',
  md: 'text-sm',
  lg: 'text-base',
};

export function StarRating({
  rating,
  reviewCount,
  size      = 'sm',
  showCount = true,
  className,
}: StarRatingProps) {
  const stars = getStars(rating);
  const starClass = sizeMap[size];

  return (
    <div
      className={cn('flex items-center gap-1.5', className)}
      aria-label={`Rating: ${rating.toFixed(1)} out of 5${reviewCount ? `, ${reviewCount} reviews` : ''}`}
    >
      <div className="flex items-center gap-1">
        {stars.map((type, i) => (
          <span key={i} aria-hidden="true">
            {type === 'full' ? (
              <Star className={cn(starClass, 'fill-[var(--rating-star)] text-[var(--rating-star)]')} />
            ) : type === 'half' ? (
              <StarHalf className={cn(starClass, 'fill-[var(--rating-star)] text-[var(--rating-star)]')} />
            ) : (
              <Star className={cn(starClass, 'text-[var(--rating-star-empty)] fill-none')} />
            )}
          </span>
        ))}
      </div>
      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className={cn('text-[var(--text-muted)]', textSizeMap[size])}>
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
