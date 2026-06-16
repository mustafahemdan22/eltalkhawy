'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Eye, ShoppingCart, Check, ArrowRight } from 'lucide-react';
import { cn, formatPrice, discountedPrice, cloudinaryImageUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import type { AnimalCutEntry } from '@/lib/animal-cuts';

export interface CutCardProductData {
  _id: string;
  slug: string;
  isAvailable: boolean;
  isFresh: boolean;
  isFrozen: boolean;
  isPremiumCut: boolean;
  variants: { weight: string; price: number; stock: number }[];
  discount: number | null;
}

interface CutCardProps {
  cut: AnimalCutEntry;
  locale: 'en' | 'ar';
  product?: CutCardProductData | null;
  onAddToCart?: (productId: string, weight: string) => Promise<void> | void;
  isAdding?: boolean;
  priority?: boolean;
}

export default function CutCard({
  cut,
  locale,
  product,
  onAddToCart,
  isAdding,
  priority,
}: CutCardProps) {
  const isRtl = locale === 'ar';
  const hasProduct = !!product && product.isAvailable;
  const href = `/${locale}/shop/${cut.productSlug || cut.slug}`;

  const displayPrice = product
    ? product.discount
      ? discountedPrice(product.variants[0].price, product.discount)
      : product.variants[0].price
    : cut.price;

  const originalPrice = product?.discount ? product.variants[0].price : null;
  const displayWeight = product?.variants[0]?.weight || cut.defaultWeight;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (product && onAddToCart) {
      onAddToCart(product._id, product.variants[0].weight);
    }
  };

  const imageUrl = cloudinaryImageUrl(cut.image, { width: 600, height: 450, crop: 'fill', gravity: 'auto' });

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-2xl overflow-hidden',
        'bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border-muted)]',
        'transition-all duration-350 ease-premium',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        !hasProduct && product && 'opacity-70',
      )}
      aria-label={`${cut.name} — ${cut.nameAr}`}
    >
      {/* Image */}
      <Link href={href} className="block relative" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-[4/3] overflow-hidden bg-surface-raised/80" data-theme="dark">
          <Image
            src={imageUrl}
            alt={isRtl ? cut.nameAr : cut.name}
            fill
            priority={priority}
            sizes="(max-width:640px) 100vw, (max-width:1024px) 50vw, 33vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/70 via-transparent to-transparent opacity-60" />

          {/* Badges */}
          <div className="absolute top-3 left-3 flex flex-col gap-2 z-10">
            {product?.isPremiumCut && (
              <span className="text-2xs font-bold uppercase tracking-wider text-inverse bg-[var(--gold)] px-2.5 py-1 rounded shadow-sm">
                {isRtl ? 'قطعية فاخرة' : 'Prime Cut'}
              </span>
            )}
            {product?.discount && (
              <span className="text-2xs font-bold uppercase tracking-wider text-error-fg bg-error px-2.5 py-1 rounded shadow-sm">
                -{product.discount}%
              </span>
            )}

          </div>

          {product && !product.isAvailable && (
            <div className="absolute inset-0 bg-[var(--bg-overlay)] flex items-center justify-center backdrop-blur-sm z-10">
              <span className="text-xs font-medium text-error tracking-widest uppercase bg-error-bg px-3 py-1 rounded-full border border-error-border">
                Out of Stock
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3">
        {/* Usage subtitle */}
        <span className={cn(
          'text-3xs uppercase tracking-[0.2em] font-semibold text-[var(--gold)] line-clamp-1',
          isRtl && 'text-right',
        )}>
          {isRtl ? cut.subtitleAr : cut.subtitle}
        </span>

        {/* Bilingual name */}
        <Link
          href={href}
          className="group/title focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 rounded-sm"
        >
          <h3 className={cn(
            'font-display text-base sm:text-lg font-bold text-primary',
            'group-hover/title:text-[var(--gold-hover)] transition-colors leading-tight line-clamp-1',
            isRtl && 'text-right',
          )}>
            {isRtl ? cut.nameAr : cut.name}
          </h3>
          <span className={cn(
            'font-arabic text-sm text-secondary group-hover/title:text-[var(--gold)]/80 transition-colors line-clamp-1',
            'block',
            isRtl ? 'text-left' : 'text-right',
          )}>
            {isRtl ? cut.name : cut.nameAr}
          </span>
        </Link>

        {/* Weight label — compact */}
        <div className="flex items-center gap-1.5 min-h-[1.25rem]">
          <span className="text-2xs font-mono uppercase tracking-wider text-muted">
            {isRtl ? 'الوزن' : 'Weight'}
          </span>
          <span className="text-2xs font-mono font-bold text-primary">
            {displayWeight}
          </span>
        </div>

        {/* Price */}
        <div className={cn(
          'flex items-baseline gap-2 pt-1 min-h-[2rem]',
          isRtl && 'flex-row-reverse justify-end',
        )}>
          <span className="price-current text-base sm:text-lg font-bold">
            {displayPrice ? formatPrice(displayPrice, locale) : (isRtl ? 'السعر عند الطلب' : 'Price on request')}
          </span>
          {originalPrice && (
            <span className="price-original">
              {formatPrice(originalPrice, locale)}
            </span>
          )}
        </div>

        {/* CTA — primary action is full-width gold Add to Cart; View Details is a secondary text link */}
        <div className="mt-auto pt-3 flex flex-col gap-2">
          {hasProduct && onAddToCart ? (
            <Button
              variant={isAdding ? 'secondary' : 'gold'}
              size="md"
              fullWidth
              onClick={handleAdd}
              disabled={isAdding}
              iconLeft={
                isAdding
                  ? <Check className="w-4 h-4" />
                  : <ShoppingCart className="w-4 h-4" />
              }
              aria-label={isRtl ? 'أضف للسلة' : 'Add to cart'}
            >
              {isRtl ? 'أضف للسلة' : 'Add to Cart'}
            </Button>
          ) : (
            <Link href={href} className="block" tabIndex={-1}>
              <Button
                variant="gold"
                size="md"
                fullWidth
                iconLeft={<Eye className="w-4 h-4" />}
              >
                {isRtl ? 'عرض التفاصيل' : 'View Details'}
              </Button>
            </Link>
          )}
          <Link
            href={href}
            className={cn(
              'inline-flex items-center justify-center gap-1 min-h-11 text-2xs font-semibold uppercase tracking-wider',
              'text-muted hover:text-[var(--gold)] transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 rounded-sm',
            )}
          >
            {isRtl ? 'عرض التفاصيل الكاملة' : 'View full details'}
            <ArrowRight className={cn('w-3 h-3', isRtl && 'rotate-180')} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
