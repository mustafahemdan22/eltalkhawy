'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Zap } from 'lucide-react';
import { cn, formatPrice, discountedPrice, cloudinaryUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import type { ProductCard as ProductCardType } from '@/types/product';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';

const PLACEHOLDER_IMAGES: Record<string, string> = {
  beef:    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
  lamb:    'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&q=80',
};

interface ProductCardProps {
  product:           ProductCardType;
  isInWishlist?:     boolean;
  onAddToCart?:      (productId: string, weight: string, quantity: number) => void;
  onToggleWishlist?: (productId: string) => void;
  priority?:         boolean;
}

export default function ProductCard({
  product,
  isInWishlist    = false,
  onAddToCart,
  onToggleWishlist,
  priority        = false,
}: ProductCardProps) {
  const [selectedWeight, setSelectedWeight] = useState(product.variants[0]?.weight ?? '');
  const [isWishlisted, setIsWishlisted]     = useState(isInWishlist);
  const [addedToCart, setAddedToCart] = useState(false);
  const prevWishlistRef = useRef(isInWishlist);

  useEffect(() => {
    if (prevWishlistRef.current !== isInWishlist) {
      prevWishlistRef.current = isInWishlist;
      setIsWishlisted(isInWishlist);
    }
  }, [isInWishlist]);

  const { locale, dict } = useLocale();
  const { showToast } = useToast();
  const localizedName = locale === 'ar' ? (product.nameAr || product.name) : product.name;

  const selectedVariant = product.variants.find((v) => v.weight === selectedWeight)
    ?? product.variants[0];

  const currentPrice = selectedVariant?.price ?? product.basePrice;
  const finalPrice = product.discount ? discountedPrice(currentPrice, product.discount) : currentPrice;
  const imageUrl = product.images[0]
    ? (product.images[0].startsWith('http') ? product.images[0] : cloudinaryUrl(product.images[0], { width: 600, height: 700, crop: 'fill' }))
    : PLACEHOLDER_IMAGES.default;

  const handleAddToCart = useCallback(() => {
    if (!product.isAvailable || !selectedVariant) return;
    onAddToCart?.(product._id, selectedWeight, 1);
    setAddedToCart(true);
    showToast('Added to cart', 'success', <ShoppingCart className="w-4 h-4 text-[var(--gold)]" />);
    setTimeout(() => setAddedToCart(false), 1800);
  }, [product, selectedWeight, selectedVariant, onAddToCart, showToast]);

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((v) => !v);
    onToggleWishlist?.(product._id);
    showToast(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist', 'info', <Heart className="w-4 h-4 text-[var(--wishlist-active)]" />);
  }, [product._id, isWishlisted, onToggleWishlist, showToast]);

  return (
    <article
      className={cn(
        'group relative flex flex-col rounded-card overflow-hidden',
        'bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border-muted)]',
        'transition-all duration-350 ease-premium',
        'hover:shadow-card-hover hover:-translate-y-0.5',
        !product.isAvailable && 'opacity-70',
      )}
      aria-label={`${product.name}${!product.isAvailable ? ', out of stock' : ''}`}
    >
      <Link href={`/${locale}/shop/${product.slug}`} className="block relative" tabIndex={-1} aria-hidden="true">
        <div className="relative aspect-product overflow-hidden bg-surface-raised/80">
          <Image
            src={imageUrl}
            alt={localizedName}
            fill
            priority={priority}
            loading={priority ? undefined : 'lazy'}
            sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
            className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.04]"
          />

          {!product.isAvailable && (
            <div className="absolute inset-0 bg-[var(--bg-overlay)] flex items-center justify-center backdrop-blur-sm z-10">
              <span className="text-xs font-medium text-error tracking-widest uppercase bg-error-bg px-3 py-1 rounded-full border border-error-border">
                {dict.shop?.outOfStock || 'Out of Stock'}
              </span>
            </div>
          )}

          <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-20" aria-label="Product labels">
            {product.discount && (
              <Badge variant="discount">-{product.discount}%</Badge>
            )}
            {!product.discount && product.isBestSeller && (
              <Badge variant="bestseller">{dict.shop?.badges?.bestSeller || 'Best Seller'}</Badge>
            )}
            {!product.discount && !product.isBestSeller && product.isPremiumCut && (
              <Badge variant="premium">{dict.shop?.badges?.premium || 'Premium'}</Badge>
            )}
          </div>

          <button
            onClick={handleWishlist}
            className={cn(
              'absolute bottom-3 right-3 z-20 w-11 h-11 rounded-full flex items-center justify-center transition-all shadow-sm backdrop-blur-sm border',
              isWishlisted
                ? 'text-[var(--wishlist-active)] bg-[var(--wishlist-active-bg)] border-[var(--wishlist-border)]'
                : 'text-primary/80 bg-[var(--bg-overlay)] border-transparent hover:text-primary hover:bg-surface-raised/90 hover:border-muted',
            )}
            aria-label={isWishlisted
              ? (dict.shop?.removeFromWishlist || 'Remove from wishlist')
              : (dict.shop?.addToWishlist || 'Add to wishlist')}
            aria-pressed={isWishlisted}
            title={isWishlisted
              ? (dict.shop?.removeFromWishlist || 'Remove from wishlist')
              : (dict.shop?.addToWishlist || 'Add to wishlist')}
          >
            <Heart
              className={cn('w-4 h-4 transition-all', isWishlisted && 'fill-current')}
              aria-hidden="true"
            />
          </button>
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-4 sm:p-5 gap-3.5">
        <Link
          href={`/${locale}/shop/${product.slug}`}
          className="group/name focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 rounded-sm"
        >
          <h3 className="font-display text-sm sm:text-base font-bold text-primary group-hover/name:text-[var(--gold-hover)] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]">
            {localizedName}
          </h3>
        </Link>

        <div className="flex items-center justify-between gap-2 min-h-[1.25rem]">
          {product.reviewCount > 0 ? (
            <StarRating rating={product.rating} reviewCount={product.reviewCount} size="sm" />
          ) : (
            <span className="text-xs text-muted">{locale === 'ar' ? 'جديد' : 'New'}</span>
          )}
        </div>

        {product.variants.length > 1 && (
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Select weight">
            {product.variants.map((v) => (
              <button
                key={v.weight}
                role="radio"
                aria-checked={v.weight === selectedWeight}
                onClick={() => setSelectedWeight(v.weight)}
                disabled={v.stock === 0}
                className={cn(
                  'px-2.5 py-1.5 min-h-9 rounded text-2xs font-bold transition-all duration-200 border',
                  v.weight === selectedWeight
                    ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-subtle)]'
                    : 'border-[var(--border-muted)] text-secondary hover:border-muted hover:text-primary',
                  v.stock === 0 && 'opacity-40 cursor-not-allowed line-through',
                )}
              >
                {v.weight}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-baseline gap-2 pt-3 mt-auto border-t border-[var(--border-muted)]/40 min-h-[2.25rem]">
          <span className="price-current text-base sm:text-lg font-bold">
            {formatPrice(finalPrice, locale)}
          </span>
          {product.discount && (
            <span className="price-original">
              {formatPrice(currentPrice, locale)}
            </span>
          )}
        </div>

        <Button
          variant={addedToCart ? 'secondary' : 'gold'}
          size="md"
          fullWidth
          disabled={!product.isAvailable || !selectedVariant}
          onClick={handleAddToCart}
          iconLeft={
            addedToCart
              ? <Zap className="w-4 h-4 text-[var(--gold)]" />
              : <ShoppingCart className="w-4 h-4" />
          }
          aria-label={
            !product.isAvailable
              ? dict.shop?.outOfStock || 'Out of stock'
              : addedToCart
              ? dict.shop?.addedToCart || 'Added to cart'
              : `${dict.shop?.addToCart || 'Add'} ${selectedWeight || ''}`
          }
        >
          {!product.isAvailable
            ? (dict.shop?.outOfStock || 'Out of Stock')
            : addedToCart
            ? (dict.shop?.addedToCart || 'Added!')
            : (dict.shop?.addToCart || 'Add to Cart')}
        </Button>
      </div>
    </article>
  );
}
