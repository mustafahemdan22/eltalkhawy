'use client';

import { useState, useCallback, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Eye, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn, formatPrice, discountedPrice, cloudinaryUrl } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import type { ProductCard as ProductCardType } from '@/types/product';
import { useLocale } from '@/components/LocaleProvider';

/* ── Mock placeholder image (replace with real Cloudinary later) ── */
const PLACEHOLDER_IMAGES: Record<string, string> = {
  beef:    'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
  lamb:    'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80',
  default: 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&q=80',
};

/* ── Props ── */
interface ProductCardProps {
  product:         ProductCardType;
  isInWishlist?:   boolean;
  onAddToCart?:    (productId: string, weight: string, quantity: number) => void;
  onToggleWishlist?: (productId: string) => void;
  onQuickView?:    (product: ProductCardType) => void;
  priority?:       boolean;
}

export default function ProductCard({
  product,
  isInWishlist    = false,
  onAddToCart,
  onToggleWishlist,
  onQuickView,
  priority        = false,
}: ProductCardProps) {
  const [selectedWeight, setSelectedWeight]   = useState(product.variants[0]?.weight ?? '');
  const [isWishlisted, setIsWishlisted]       = useState(isInWishlist);
  const [addedToCart, setAddedToCart]         = useState(false);
  const [isHovered, setIsHovered]             = useState(false);

  // Sync wishlist state when prop changes (e.g., after data load)
  useEffect(() => {
    setIsWishlisted(isInWishlist);
  }, [isInWishlist]);

  const { locale, dict } = useLocale();
  const localizedName = locale === 'ar' ? (product.nameAr || product.name) : product.name;

  const selectedVariant = product.variants.find((v) => v.weight === selectedWeight)
    ?? product.variants[0];

  const currentPrice  = selectedVariant?.price ?? product.basePrice;
  const finalPrice    = product.discount ? discountedPrice(currentPrice, product.discount) : currentPrice;
  const imageUrl      = product.images[0]
    ? (product.images[0].startsWith('http') ? product.images[0] : cloudinaryUrl(product.images[0], { width: 600, height: 700, crop: 'fill' }))
    : PLACEHOLDER_IMAGES.default;

  const handleAddToCart = useCallback(() => {
    if (!product.isAvailable || !selectedVariant) return;
    onAddToCart?.(product._id, selectedWeight, 1);
    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 1800);
  }, [product, selectedWeight, selectedVariant, onAddToCart]);

  const handleWishlist = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlisted((v) => !v);
    onToggleWishlist?.(product._id);
  }, [product._id, onToggleWishlist]);

  const handleQuickView = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView?.(product);
  }, [product, onQuickView]);

  return (
      <article
        className={cn(
          'group relative flex flex-col rounded-card overflow-hidden',
          'bg-[var(--bg-surface)] ring-1 ring-inset ring-[var(--border-muted)]',
          'transition-all duration-350 ease-premium',
          'hover:ring-black/50 hover:shadow-card-hover',
          !product.isAvailable && 'opacity-75',
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`${product.name}${!product.isAvailable ? ', out of stock' : ''}`}
      >
        <Link href={`/${locale}/shop/${product.slug}`} className="block relative" tabIndex={-1} aria-hidden="true">
          <div className="relative aspect-product overflow-hidden bg-surface-raised/80">
            <Image
              src={imageUrl}
              alt={localizedName}
              fill
              priority={priority}
              sizes="(max-width:640px) 50vw, (max-width:1024px) 33vw, 25vw"
              className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.06]"
            />

            <div className="absolute inset-0 overlay-card opacity-0 group-hover:opacity-100 transition-opacity duration-350" aria-hidden="true" />

            {!product.isAvailable && (
              <div className="absolute inset-0 bg-[var(--bg-overlay)] flex items-center justify-center backdrop-blur-sm z-10">
                <span className="text-xs font-medium text-error tracking-widest uppercase bg-error-bg px-3 py-1 rounded-full border border-error-border">
                  {dict.shop?.outOfStock || 'Out of Stock'}
                </span>
              </div>
            )}

            <div className="absolute top-3 left-3 flex flex-col gap-3" aria-label="Product labels">
              {product.discount && (
                <Badge variant="discount">−{product.discount}%</Badge>
              )}
              {product.isBestSeller && !product.discount && (
                <Badge variant="bestseller">{dict.shop?.badges?.bestSeller || 'Best Seller'}</Badge>
              )}
              {product.isPremiumCut && (
                <Badge variant="premium">{dict.shop?.badges?.premium || 'Premium'}</Badge>
              )}
            </div>

            <div className="absolute top-3 right-3">
              {product.isFresh ? (
                <Badge variant="fresh">{dict.shop?.badges?.fresh || 'Fresh'}</Badge>
              ) : product.isFrozen ? (
                <Badge variant="frozen">{dict.shop?.badges?.frozen || 'Frozen'}</Badge>
              ) : null}
            </div>

            {/* Quick Actions overlay */}
            <AnimatePresence>
              {isHovered && product.isAvailable && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute top-3 right-3 z-30 flex flex-col gap-2"
                >
                  <button
                    onClick={handleQuickView}
                    className="w-8 h-8 rounded-full bg-surface-raised/90 text-primary flex items-center justify-center hover:bg-surface-raised/80 hover:text-[var(--gold-hover)] transition-colors shadow-md backdrop-blur-md border border-muted/50"
                    aria-label={dict.shop?.quickView || "Quick view"}
                    title={dict.shop?.quickView || "Quick view"}
                  >
                    <Eye className="w-4 h-4" aria-hidden="true" />
                  </button>
                  <button
                    onClick={handleWishlist}
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md backdrop-blur-md border border-muted/50',
                      isWishlisted
                        ? 'text-[var(--wishlist-active)] bg-[var(--wishlist-active-bg)]'
                        : 'text-primary hover:text-[var(--brand)] hover:bg-surface-raised/50',
                    )}
                    aria-label={isWishlisted ? (dict.shop?.removeFromWishlist || 'Remove from wishlist') : (dict.shop?.addToWishlist || 'Add to wishlist')}
                    aria-pressed={isWishlisted}
                    title={isWishlisted ? (dict.shop?.removeFromWishlist || 'Remove from wishlist') : (dict.shop?.addToWishlist || 'Add to wishlist')}
                  >
                    <Heart
                      className={cn('w-4 h-4 transition-all', isWishlisted && 'fill-current')}
                      aria-hidden="true"
                    />
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </Link>

        <div className="flex flex-col flex-1 p-6 gap-4">
          <Link
            href={`/${locale}/shop/${product.slug}`}
            className="group/name focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50 rounded-sm"
          >
            <h3 className="text-sm font-semibold text-primary group-hover/name:text-[var(--gold-hover)] transition-colors line-clamp-2 leading-snug">
              {localizedName}
            </h3>
          </Link>

          {product.reviewCount > 0 && (
            <StarRating
              rating={product.rating}
              reviewCount={product.reviewCount}
              size="sm"
            />
          )}

          {product.variants.length > 1 && (
            <div
              className="flex flex-wrap gap-3"
              role="radiogroup"
              aria-label="Select weight"
            >
              {product.variants.map((v) => (
                <button
                  key={v.weight}
                  role="radio"
                  aria-checked={v.weight === selectedWeight}
                  onClick={() => setSelectedWeight(v.weight)}
                  disabled={v.stock === 0}
                  className={cn(
                    'px-3 py-2 rounded text-sm font-medium transition-all duration-200 border',
                    v.weight === selectedWeight
                      ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-subtle)]'
                      : 'border-muted text-secondary hover:border-muted hover:text-primary',
                    v.stock === 0 && 'opacity-40 cursor-not-allowed line-through',
                  )}
                >
                  {v.weight}
                </button>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3 mt-auto pt-4">
              <span className="font-mono font-bold text-base text-[var(--price-current)]">
                {formatPrice(finalPrice, locale)}
              </span>
            {product.discount && (
              <span className="font-mono text-xs text-muted line-through">
                {formatPrice(currentPrice, locale)}
              </span>
            )}
          </div>

          <Button
            variant={addedToCart ? 'secondary' : 'primary'}
            size="sm"
            fullWidth
            disabled={!product.isAvailable || !selectedVariant}
            onClick={handleAddToCart}
            iconLeft={
              addedToCart
                ? <Zap className="w-4 h-4 text-[var(--gold)]" />
                : <ShoppingCart className="w-4 h-4" />
            }
            className={cn(
              addedToCart && 'border-[var(--gold)]/40 text-[var(--gold)]',
            )}
            aria-label={
              !product.isAvailable
                ? dict.shop?.outOfStock || 'Out of stock'
                : addedToCart
                ? dict.shop?.addedToCart || 'Added to cart'
                : `${dict.shop?.addToCart || 'Add'} ${selectedWeight || ''}`
            }
          >
            {!product.isAvailable ? (dict.shop?.outOfStock || 'Out of Stock') : addedToCart ? (dict.shop?.addedToCart || 'Added!') : (dict.shop?.addToCart || 'Add to Cart')}
          </Button>
        </div>
      </article>
  );
}
