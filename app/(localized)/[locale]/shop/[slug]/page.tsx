'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/shop/ProductCard';
import { StarRating } from '@/components/ui/StarRating';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn, formatPrice, cloudinaryImageUrl, discountedPrice } from '@/lib/utils';
import { useUser } from '@clerk/nextjs';
import {
  Heart,
  ShoppingCart,
  Zap,
  Truck,
  ShieldCheck,
  Flame,
  Award,
  Calendar,
  Sparkles,
} from 'lucide-react';
import Image from 'next/image';
import { useLocale } from '@/components/LocaleProvider';
import { ANIMAL_CUTS } from '@/lib/animal-cuts';
import { STARTERS, CATEGORIES } from '@/lib/constants';
import { motion, AnimatePresence } from 'framer-motion';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailPage({ params }: PageProps) {
  // Next.js 15/16 Promise parameters unpacking
  const { slug } = React.use(params);
  const router = useRouter();
  const { user } = useUser();

  // ── Local States ──
  const [selectedWeight, setSelectedWeight] = useState('');
  const [prevProductSlug, setPrevProductSlug] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<'details' | 'preparation' | 'nutrition'>('details');
  const [addedToCart, setAddedToCart] = useState(false);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewError, setReviewError] = useState('');
  const [reviewSuccess, setReviewSuccess] = useState(false);
  const [isGrilled, setIsGrilled] = useState(false);
  const [grillComment, setGrillComment] = useState('');
  const [selectedStarter, setSelectedStarter] = useState('');

  const { locale, dict } = useLocale();

  // ── Convex Data Fetching ──
  const dbProduct = useQuery(api.products.getBySlug, { slug });

  // If not found in database, check static animal cuts catalogue
  const product = useMemo(() => {
    if (dbProduct) return dbProduct;
    if (dbProduct === null) {
      // Find matching static cut
      const allCuts = Object.entries(ANIMAL_CUTS).flatMap(([animal, list]) =>
        list.map((c) => ({ ...c, animal }))
      );
      const staticCut = allCuts.find((c) => c.productSlug === slug || c.slug === slug);
      if (staticCut) {
        return {
          _id: 'static-cut' as Id<'products'>,
           _creationTime: 1700000000000,

          slug: staticCut.productSlug || staticCut.slug,
          name: staticCut.name,
          nameAr: staticCut.nameAr,
          description: staticCut.subtitle,
          descriptionAr: staticCut.subtitleAr,
          categorySlug: staticCut.animal,
          subcategory: staticCut.slug,
          images: [staticCut.image],
          basePrice: staticCut.price || 0,
          variants: [
            {
              weight: staticCut.defaultWeight,
              price: staticCut.price || 0,
              stock: 0,
            },
          ],
          isFresh: true,
          isFrozen: false,
          discount: null,
          isAvailable: false, // Mark unavailable so cart action is disabled
          isBestSeller: false,
          isPremiumCut: false,
          isFeatured: false,
          isBBQ: false,
          tags: [],
          unit: 'kg',
          cookingTips: [],
          nutritionInfo: null,
          storageInfo: null,
          weight: null,
          rating: 0,
          reviewCount: 0,
        };
      }
    }
    return dbProduct;
  }, [dbProduct, slug]);

  // When a new product loads, reset the selected weight to its first variant.
  if (product && product.slug !== prevProductSlug) {
    if (product.variants?.[0]) {
      setSelectedWeight(product.variants[0].weight);
    }
    setPrevProductSlug(product.slug);
  }
  
  const isStatic = product?._id === 'static-cut';

  const dbRelatedProducts = useQuery(
    api.products.related,
    product && !isStatic
      ? { productId: product._id, categorySlug: product.categorySlug, limit: 4 }
      : 'skip'
  );

  const staticCategoryProducts = useQuery(
    api.products.list,
    product && isStatic
      ? { categorySlug: product.categorySlug, limit: 4 }
      : 'skip'
  );

  const relatedProducts = isStatic ? staticCategoryProducts : dbRelatedProducts;

  const dbReviews = useQuery(
    api.reviews.list,
    product && !isStatic ? { productId: product._id } : 'skip'
  );
  const reviews = isStatic ? [] : dbReviews;

  const wishlistItems = useQuery(
    api.wishlist.get,
    user ? { userId: user.id } : 'skip'
  );

  // ── Wishlist & Cart Mutations ──
  const toggleWishlistMutation = useMutation(api.wishlist.toggle);
  const addToCartMutation = useMutation(api.cart.add);
  const addReviewMutation = useMutation(api.reviews.add);

  // Selected variant derivation

  const selectedVariant = useMemo(() => {
    if (!product) return null;
    return product.variants.find((v) => v.weight === selectedWeight) ?? product.variants[0];
  }, [product, selectedWeight]);

  const isWishlisted = useMemo(() => {
    if (!wishlistItems || !product) return false;
    return wishlistItems.some((item) => item._id === product._id);
  }, [wishlistItems, product]);

  if (product === undefined) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <div className="w-10 h-10 border-2 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
          <h1 className="font-display text-2xl font-bold text-primary">{dict.productDetail?.notFoundTitle || 'Specialty Cut Not Found'}</h1>
          <p className="text-sm text-secondary mt-2 max-w-sm leading-relaxed">
            {dict.productDetail?.notFoundDesc || 'The prime cut or specialty item you are looking for is not in our active registry. It might be out of season.'}
          </p>
          <Button onClick={() => router.push(`/${locale}/categories`)} className="mt-6 uppercase tracking-wider text-sm">
            {dict.productDetail?.backToCatalog || 'Back to Catalog'}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const currentPrice = selectedVariant?.price ?? product.basePrice;
  const finalPrice = product.discount ? discountedPrice(currentPrice, product.discount) : currentPrice;

  const selectedStarterObj = STARTERS.find((s) => s.id === selectedStarter);
  const starterPriceVal = selectedStarterObj?.price ?? 0;
  const grillFeeVal = isGrilled ? 50 : 0;
  const computedUnitPrice = finalPrice + grillFeeVal + starterPriceVal;

  // Placeholder support
  const PLACEHOLDER_IMAGES = {
    default: 'products/placeholders/placeholder',
  };
  const imageUrl = product.images[0]
    ? cloudinaryImageUrl(product.images[0], { preset: 'productDetail' })
    : cloudinaryImageUrl(PLACEHOLDER_IMAGES.default, { preset: 'productDetail' });

  const handleToggleWishlist = async (productId?: string | React.MouseEvent) => {
    if (!user) {
      router.push(`/${locale}/sign-in`);
      return;
    }
    const targetId = typeof productId === 'string' ? productId : product._id;
    if (targetId === 'static-cut') return;
    await toggleWishlistMutation({ userId: user.id, productId: targetId as Id<'products'> });
  };

  const handleAddToCart = async () => {
    if (!product.isAvailable || !selectedVariant) return;

    if (user) {
      await addToCartMutation({
        userId: user.id,
        productId: product._id,
        variantWeight: selectedWeight,
        quantity,
        price: computedUnitPrice,
        isGrilled,
        grillComment: isGrilled && grillComment.trim() ? grillComment.trim() : undefined,
        starterName: selectedStarterObj?.name,
        starterPrice: selectedStarterObj?.price,
      });
    } else {
      // Guest local storage cart sync
      const guestCart = JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]');
      const existingIdx = guestCart.findIndex(
        (item: { productId: string; variantWeight: string; quantity: number; isGrilled?: boolean; grillComment?: string; starterName?: string }) =>
          item.productId === product._id &&
          item.variantWeight === selectedWeight &&
          (item.isGrilled ?? false) === isGrilled &&
          (item.grillComment ?? '') === (isGrilled ? grillComment.trim() : '') &&
          (item.starterName ?? '') === (selectedStarterObj?.name ?? '')
      );
      if (existingIdx > -1) {
        guestCart[existingIdx].quantity += quantity;
      } else {
        guestCart.push({
          productId: product._id,
          variantWeight: selectedWeight,
          quantity,
          price: computedUnitPrice,
          isGrilled,
          grillComment: isGrilled && grillComment.trim() ? grillComment.trim() : undefined,
          starterName: selectedStarterObj?.name,
          starterPrice: selectedStarterObj?.price,
        });
      }
      localStorage.setItem('et_guest_cart', JSON.stringify(guestCart));
      window.dispatchEvent(new Event('storage'));
    }

    setAddedToCart(true);
    setTimeout(() => setAddedToCart(false), 2000);

    // Open the cart drawer
    window.dispatchEvent(new Event('open-cart'));
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      router.push(`/${locale}/sign-in`);
      return;
    }
    if (product._id === 'static-cut') {
      setReviewError('Reviews are not available for this seasonal cut.');
      return;
    }
    if (!reviewComment.trim()) {
      setReviewError('Please write a review comment.');
      return;
    }

    try {
      setReviewError('');
      await addReviewMutation({
        productId: product._id,
        userId: user.id,
        userName: user.fullName || user.username || 'Gourmet Customer',
        userImage: user.imageUrl || null,
        rating: reviewRating,
        comment: reviewComment.trim(),
      });
      setReviewSuccess(true);
      setReviewComment('');
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to submit review.';
      setReviewError(errorMessage);
    }
  };

  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-[var(--bg-base)] min-h-screen py-10">
        <div className="container-brand">
          
          {/* Breadcrumb */}
          <nav className="flex items-center gap-3 text-xs uppercase tracking-[0.15em] text-muted mb-10 font-sans flex-wrap" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <Link href={`/${locale}`} className="inline-flex items-center px-2 py-2 -mx-2 min-h-11 rounded hover:text-primary transition-colors">{dict.productDetail?.home || 'Home'}</Link>
            <span className={locale === 'ar' ? 'rotate-180' : ''} aria-hidden="true">/</span>
            <Link href={`/${locale}/categories`} className="inline-flex items-center px-2 py-2 -mx-2 min-h-11 rounded hover:text-primary transition-colors">{locale === 'ar' ? 'التصنيفات' : 'Categories'}</Link>
            <span aria-hidden="true">/</span>
            <Link href={`/${locale}/categories/${product.categorySlug}`} className="inline-flex items-center px-2 py-2 -mx-2 min-h-11 rounded hover:text-primary transition-colors">
              {(() => {
                const categoryObj = CATEGORIES.find(c => c.slug === product.categorySlug);
                return categoryObj ? (locale === 'ar' ? categoryObj.nameAr : categoryObj.name) : product.categorySlug;
              })()}
            </Link>
            <span aria-hidden="true">/</span>
            <span className="text-[var(--gold)] font-medium truncate max-w-[120px]">{locale === 'ar' ? product.nameAr : product.name}</span>
          </nav>

          {/* Product Editorial Detail Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
            
            {/* Gallery Column */}
            <div className="lg:col-span-6 flex flex-col gap-5">
              <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-surface border border-muted shadow-raised group">
                <Image
                  src={imageUrl}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.03]"
                />
                
                {/* Status Badges */}
                <div className="absolute top-4 left-4 flex flex-col gap-4">
                  {product.discount && <Badge variant="discount">−{product.discount}%</Badge>}
                  {product.isBestSeller && <Badge variant="bestseller">{dict.shop?.badges?.bestSeller || 'Best Seller'}</Badge>}
                  {product.isPremiumCut && <Badge variant="premium">{dict.shop?.badges?.premium || 'Premium'}</Badge>}
                </div>
                <div className="absolute top-4 right-4">
                  {product.isFresh ? <Badge variant="fresh">{dict.shop?.badges?.fresh || 'Fresh'}</Badge> : product.isFrozen ? <Badge variant="frozen">{dict.shop?.badges?.frozen || 'Frozen'}</Badge> : null}
                </div>
              </div>
            </div>

            {/* Content Column */}
            <div className={cn("lg:col-span-6 flex flex-col gap-6", locale === 'ar' && "text-right")}>
              <div>
                <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-2">
                  {dict.productDetail?.specialtySelection || 'Specialty Selection'}
                </span>
                <div className={cn("flex flex-wrap items-baseline justify-between gap-5", locale === 'ar' && "flex-row-reverse")}>
                  <h1 className="font-display text-3xl md:text-4xl font-bold text-primary text-wrap-balance leading-tight">
                    {locale === 'ar' ? product.nameAr : product.name}
                  </h1>
                  <span className="text-[var(--gold)] font-arabic text-lg tracking-wide shrink-0">
                    {locale === 'ar' ? product.name : product.nameAr}
                  </span>
                </div>

                {/* Rating summary */}
                <div className={cn("flex items-center gap-4 mt-3", locale === 'ar' && "flex-row-reverse")}>
                  <StarRating rating={product.rating} reviewCount={product.reviewCount} />
                  {product.reviewCount > 0 && (
                    <span className="text-2xs text-muted font-mono" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                      {dict.productDetail?.basedOnReviews?.replace('{count}', product.reviewCount.toString()) || `(Based on ${product.reviewCount} verified reviews)`}
                    </span>
                  )}
                </div>
              </div>

              {/* Price box */}
              <div className={cn("p-6 md:p-8 rounded-2xl bg-surface-raised border border-[var(--gold-border)] flex items-center justify-between shadow-gold relative overflow-hidden group", locale === 'ar' && "flex-row-reverse")}>
                <div className={cn("absolute top-0 w-24 h-24 bg-[var(--gold)]/5 blur-xl rounded-full pointer-events-none", locale === 'ar' ? "left-0" : "right-0")} />
                <div className={cn("flex flex-col gap-1.5", locale === 'ar' && "items-end")}>
                  <span className="text-xs uppercase tracking-widest text-muted font-semibold">{dict.productDetail?.totalPrice || 'Total Price'}</span>
                  <div className={cn("flex items-baseline gap-3", locale === 'ar' && "flex-row-reverse")} dir="ltr">
                    <span className="price-current text-3xl md:text-4xl">
                      {formatPrice(computedUnitPrice * quantity, locale)}
                    </span>
                    {(product.discount || isGrilled || starterPriceVal > 0) && (
                      <span className="font-mono text-sm text-muted line-through">
                        {formatPrice((currentPrice + grillFeeVal + starterPriceVal) * quantity, locale)}
                      </span>
                    )}
                  </div>
                </div>

                <div className={cn(locale === 'ar' ? "text-left" : "text-right")}>
                  <span className="text-3xs uppercase tracking-wider text-muted block mb-1">{dict.productDetail?.availability || 'Availability'}</span>
                  {product.isAvailable ? (
                    selectedVariant && selectedVariant.stock > 0 ? (
                      <span className="text-sm font-semibold text-fresh bg-fresh-bg px-2.5 py-1 rounded-full border border-fresh-border" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                        {selectedVariant.stock} {dict.productDetail?.inStock || 'items In Stock'}
                      </span>
                    ) : (
                      <span className="text-sm font-semibold text-warning bg-warning-bg px-2.5 py-1 rounded-full border border-warning-border">
                        {dict.productDetail?.outOfStock || 'Out of Stock'}
                      </span>
                    )
                  ) : (
                    <span className="text-sm font-semibold text-warning bg-warning-bg px-2.5 py-1 rounded-full border border-warning-border">
                      {isStatic
                        ? (dict.productDetail?.comingSoon || 'Coming Soon')
                        : (dict.productDetail?.unavailable || 'Unavailable')}
                    </span>
                  )}
                </div>
              </div>

              {/* Description */}
              <p className="text-base text-secondary leading-relaxed font-sans font-normal text-wrap-pretty mt-2">
                {locale === 'ar' ? product.descriptionAr : product.description}
              </p>

              {/* Variant Weight Selector */}
              {product.variants.length > 1 && (
                <div className={cn("flex flex-col gap-4", locale === 'ar' && "items-end")}>
                  <span className="text-3xs uppercase tracking-[0.2em] font-semibold text-[var(--gold)]">
                    {dict.productDetail?.selectWeight || 'Select Desired Weight'}
                  </span>
                  <div className={cn("flex flex-wrap gap-4", locale === 'ar' && "flex-row-reverse")} role="radiogroup" aria-label="Select weight">
                    {product.variants.map((v) => (
                      <button
                        key={v.weight}
                        role="radio"
                        aria-checked={v.weight === selectedWeight}
                        onClick={() => {
                          setSelectedWeight(v.weight);
                          setQuantity(1);
                        }}
                        disabled={v.stock === 0}
                        className={cn(
                          'h-12 px-6 rounded-button text-sm font-bold transition-all duration-300 border flex items-center justify-between gap-5 cursor-pointer shadow-sm hover:shadow-md',
                          v.weight === selectedWeight
                            ? 'border-[var(--gold)] text-[var(--gold)] bg-[var(--gold-subtle)] ring-1 ring-[var(--gold)]/50'
                            : 'border-muted text-secondary bg-surface hover:border-[var(--gold-hover)] hover:text-primary',
                          v.stock === 0 && 'opacity-30 cursor-not-allowed line-through hover:border-muted hover:shadow-none',
                        )}
                      >
                        <span className="tracking-wide">{v.weight}</span>
                        <span className="font-mono text-[var(--gold)]">{formatPrice(product.discount ? discountedPrice(v.price, product.discount) : v.price, locale)}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Preparation & Starters */}
              {product._id !== 'static-cut' && product.isAvailable && (
                <div className={cn("flex flex-col gap-5 p-6 rounded-2xl bg-surface-raised border border-muted shadow-sm", locale === 'ar' && "items-end")}>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold uppercase tracking-wider text-primary">
                      {locale === 'ar' ? 'تجهيز الشيف والمقبلات الخاصة' : 'Chef Preparation & Starters'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                    {/* Grill cooking option */}
                    <div 
                      onClick={() => setIsGrilled(!isGrilled)}
                      className={cn(
                        "p-4 rounded-xl border flex flex-col gap-2 cursor-pointer transition-all duration-350 select-none",
                        isGrilled 
                          ? "border-[var(--gold)] bg-[var(--gold-subtle)] text-[var(--gold)] shadow-gold" 
                          : "border-muted bg-surface hover:border-muted hover:text-primary"
                      )}
                    >
                      <div className={cn("flex justify-between items-center font-bold", locale === 'ar' && "flex-row-reverse")}>
                        <span className="text-sm">{locale === 'ar' ? 'تسوية على الشواية' : 'Cook on Grill'}</span>
                        <span className="text-xs font-mono text-[var(--gold)]">+{formatPrice(50, locale)}</span>
                      </div>
                      <span className="text-xs text-muted leading-snug">
                        {locale === 'ar' ? 'طهي اللحم على شواية الطلخاوي وتقديمه ساخناً' : 'Cooked fresh on El Talkhawy grills and delivered hot'}
                      </span>
                    </div>

                    {/* Starter Selection */}
                    <div className="flex flex-col gap-2">
                      <label htmlFor="starter-select" className="text-xs font-bold text-secondary">
                        {locale === 'ar' ? 'إضافة شوربة أو مقبلات' : 'Add Starter / Special Soup'}
                      </label>
                      <select
                        id="starter-select"
                        value={selectedStarter}
                        onChange={(e) => setSelectedStarter(e.target.value)}
                        className="h-12 px-4 rounded-button text-sm bg-surface border border-muted text-primary focus:outline-none focus:border-[var(--gold)] transition-all w-full cursor-pointer font-sans"
                      >
                        <option value="">{locale === 'ar' ? 'بدون مقبلات' : 'No Starter'}</option>
                        {STARTERS.map((s) => (
                          <option key={s.id} value={s.id}>
                            {locale === 'ar' ? `${s.nameAr} (+${s.price} ج.م)` : `${s.name} (+EGP ${s.price})`}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Grill Comment text area */}
                  <AnimatePresence>
                    {isGrilled && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                        className="w-full overflow-hidden flex flex-col gap-2"
                      >
                        <label htmlFor="grill-instructions" className="text-xs font-bold text-secondary">
                          {locale === 'ar' ? 'تعليمات الشوي (مثال: درجة التسوية، التوابل)' : 'Grill Master Instructions (e.g. Well Done, spices)'}
                        </label>
                        <textarea
                          id="grill-instructions"
                          rows={2}
                          value={grillComment}
                          onChange={(e) => setGrillComment(e.target.value)}
                          placeholder={locale === 'ar' ? 'اكتب تفضيلاتك للشوي هنا...' : 'Write your grilling preferences here...'}
                          className="w-full p-3 rounded-button text-sm font-sans resize-none bg-surface border border-muted text-primary placeholder:text-muted focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-300"
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Quantity selector & Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-5 items-stretch pt-2">
                {/* Quantity box */}
                {selectedVariant && selectedVariant.stock > 0 && (
                  <div className="flex items-center justify-between border border-muted bg-surface rounded-button px-1 h-12 w-32 shrink-0 select-none">
                    <button
                      onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                      aria-label="Decrease quantity"
                      className="w-11 h-11 flex items-center justify-center text-muted hover:text-primary font-bold text-base transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                    >
                      −
                    </button>
                    <span className="font-mono text-sm text-primary font-bold" aria-live="polite">{quantity}</span>
                    <button
                      onClick={() => setQuantity((q) => Math.min(selectedVariant.stock, q + 1))}
                      aria-label="Increase quantity"
                      className="w-11 h-11 flex items-center justify-center text-muted hover:text-primary font-bold text-base transition-colors cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                    >
                      +
                    </button>
                  </div>
                )}

                {/* Add to Cart button */}
                <div className="flex-1 flex flex-col gap-3">
                  <div className="flex gap-4">
                  <Button
                    variant={addedToCart ? 'secondary' : 'primary'}
                    disabled={!product.isAvailable || !selectedVariant || selectedVariant.stock === 0}
                    onClick={handleAddToCart}
                    fullWidth
                    iconLeft={
                      addedToCart ? (
                        <Zap className="w-4 h-4 text-[var(--gold)] animate-bounce" />
                      ) : (
                        <ShoppingCart className="w-4 h-4" />
                      )
                    }
                    className={cn(
                      'h-12 text-sm tracking-wider uppercase font-semibold cursor-pointer',
                      addedToCart && 'border-[var(--gold)]/40 text-[var(--gold)]'
                    )}
                  >
                    {!product.isAvailable
                      ? (isStatic
                          ? (dict.productDetail?.comingSoon || 'Coming Soon')
                          : (dict.productDetail?.unavailable || 'Unavailable'))
                      : selectedVariant && selectedVariant.stock === 0
                      ? (dict.productDetail?.outOfStock || 'Out of Stock')
                      : addedToCart
                      ? (dict.productDetail?.addedToCart || 'Added to cart')
                      : (dict.productDetail?.addToCart || 'Add to Cart')}
                  </Button>

                  {/* Wishlist button */}
                  <button
                    onClick={handleToggleWishlist}
                    className={cn(
                      'w-12 h-12 rounded-button border flex items-center justify-center transition-all duration-300 shrink-0 cursor-pointer',
                      isWishlisted
                        ? 'border-[var(--brand)]/40 bg-[var(--brand)]/10 text-[var(--brand)]'
                        : 'border-muted bg-surface text-secondary hover:text-primary hover:border-muted'
                    )}
                    aria-label={isWishlisted ? (dict.shop?.removeFromWishlist || 'Remove from wishlist') : (dict.shop?.addToWishlist || 'Add to wishlist')}
                    title={isWishlisted ? (dict.shop?.removeFromWishlist || 'Remove from wishlist') : (dict.shop?.addToWishlist || 'Add to wishlist')}
                  >
                    <Heart className={cn('w-5 h-5 transition-transform duration-300', isWishlisted && 'fill-current scale-110')} />
                  </button>
                  </div>

                  {/* Browse category link for static cuts */}
                  {isStatic && (
                    <Button
                      variant="secondary"
                      onClick={() => router.push(`/${locale}/categories/${product.categorySlug}`)}
                      fullWidth
                      className="h-11 text-sm tracking-wider uppercase font-semibold cursor-pointer"
                    >
                      {(() => {
                        const categoryObj = CATEGORIES.find(c => c.slug === product.categorySlug);
                        const catName = categoryObj ? (locale === 'ar' ? categoryObj.nameAr : categoryObj.name) : product.categorySlug;
                        return locale === 'ar' ? `تصفح منتجات ${catName}` : `Browse ${catName} Products`;
                      })()}
                    </Button>
                  )}
                </div>
              </div>

              {/* Delivery trust strip */}
              <div className={cn("pt-2 grid grid-cols-2 gap-5 border-t border-muted", locale === 'ar' && "text-right")} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                <div className="flex items-center gap-4 text-sm text-secondary">
                  <Truck className="w-4 h-4 text-[var(--gold)] shrink-0" />
                  <span>{dict.productDetail?.delivery || 'Same-Day Fresh Delivery'}</span>
                </div>
                <div className="flex items-center gap-4 text-sm text-secondary">
                  <ShieldCheck className="w-4 h-4 text-[var(--gold)] shrink-0" />
                  <span>{dict.productDetail?.sourcing || 'Certified Fresh Sourcing'}</span>
                </div>
              </div>

            </div>

          </div>

          {/* Cooking, Storage & Nutrition Information Tabs */}
          <div className="mt-20 bg-surface border border-muted rounded-2xl overflow-hidden shadow-card">
            <div className={cn("flex border-b border-muted text-sm font-semibold uppercase tracking-wider bg-surface-raised/60", locale === 'ar' && "flex-row-reverse")} role="tablist">
              {[
                { id: 'details' as const, label: dict.productDetail?.tabs?.details || 'Bespoke Details', icon: Sparkles },
                { id: 'preparation' as const, label: dict.productDetail?.tabs?.preparation || 'Butcher Preparation Tips', icon: Flame },
                { id: 'nutrition' as const, label: dict.productDetail?.tabs?.nutrition || 'Nutrition Facts', icon: Calendar },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex-1 sm:flex-none h-12 px-6 flex items-center justify-center gap-2 transition-all duration-300 cursor-pointer',
                      activeTab === tab.id
                        ? 'text-[var(--gold)] border-b-2 border-[var(--gold)] bg-surface'
                        : 'text-muted hover:text-primary hover:bg-surface/30'
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            <div className={cn("p-6 md:p-8 font-sans text-sm text-secondary leading-relaxed min-h-48", locale === 'ar' && "text-right")}>
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <h3 className="font-display text-primary font-bold text-base mb-2">{dict.productDetail?.heritage || 'Heritage Description'}</h3>
                  <p>{locale === 'ar' ? product.descriptionAr : product.description}</p>
                  {product.storageInfo && (
                    <div className="mt-4 p-4 rounded-lg bg-surface-raised/40 border border-muted/80">
                      <h4 className="font-semibold text-sm text-[var(--gold)] uppercase tracking-wider mb-1.5">{dict.productDetail?.storage || 'Storage Instruction'}</h4>
                      <p className="text-sm font-normal">{product.storageInfo}</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'preparation' && (
                <div className="space-y-4">
                  <h3 className="font-display text-primary font-bold text-base mb-2">{dict.productDetail?.tipsTitle || 'Master Butcher Preparation Tips'}</h3>
                  {product.cookingTips && product.cookingTips.length > 0 ? (
                    <ul className="space-y-3 list-none">
                      {product.cookingTips.map((tip, idx) => (
                        <li key={idx} className={cn("flex gap-4", locale === 'ar' && "flex-row-reverse")}>
                          <span className="w-5 h-5 rounded-full bg-[var(--gold-subtle)] border border-[var(--gold)]/30 text-[var(--gold)] text-2xs flex items-center justify-center shrink-0 font-bold font-mono">
                            {idx + 1}
                          </span>
                          <span className="font-normal">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="font-normal italic">{dict.productDetail?.noTips || 'No preparation tips currently registered. This cut is best prepared simply to appreciate its natural quality.'}</p>
                  )}
                </div>
              )}

              {activeTab === 'nutrition' && (
                <div className={cn("max-w-md", locale === 'ar' && "ml-auto")}>
                  <h3 className="font-display text-primary font-bold text-base mb-4">{dict.productDetail?.nutritionTitle || 'Nutrition Facts'}</h3>
                  {product.nutritionInfo ? (
                    <div className="border border-muted rounded-lg overflow-hidden bg-surface-raised/40">
                      <div className={cn("bg-surface-raised/60 p-3 border-b border-muted text-sm text-muted font-medium", locale === 'ar' && "flex flex-row-reverse gap-2")}>
                        {dict.productDetail?.servingSize || 'Serving Size per'}: <span className="font-mono text-primary" dir="ltr">{product.nutritionInfo.per}</span>
                      </div>
                      <div className="divide-y divide-[var(--border-subtle)] font-mono text-sm">
                        {[
                          { label: dict.productDetail?.energy || 'Energy / Calories', val: `${product.nutritionInfo.calories} kcal` },
                          { label: dict.productDetail?.protein || 'Protein', val: `${product.nutritionInfo.protein}g` },
                          { label: dict.productDetail?.fats || 'Total Fats', val: `${product.nutritionInfo.fat}g` },
                          { label: dict.productDetail?.saturatedFats || 'Saturated Fatty Acids', val: `${product.nutritionInfo.saturatedFat}g` },
                          { label: dict.productDetail?.sodium || 'Sodium', val: `${product.nutritionInfo.sodium}mg` },
                        ].map((nut) => (
                          <div key={nut.label} className={cn("flex justify-between p-3", locale === 'ar' && "flex-row-reverse")}>
                            <span className="text-secondary font-sans">{nut.label}</span>
                            <span className="font-bold text-primary" dir="ltr">{nut.val}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="font-normal italic">{dict.productDetail?.noNutrition || 'Detailed macro nutrition registry is currently processing for this specialty cut. Sourced raw and all-natural.'}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Customer Reviews Section */}
          <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
            
            {/* Reviews list */}
            <div className={cn("lg:col-span-7 flex flex-col gap-6", locale === 'ar' && "text-right")}>
              <h3 className={cn("font-display text-xl font-bold text-primary flex items-center gap-2", locale === 'ar' && "flex-row-reverse")}>
                <Award className="w-5 h-5 text-[var(--gold)]" />
                {dict.productDetail?.impressions?.replace('{count}', (reviews?.length ?? 0).toString()) || `Customer Impressions (${reviews?.length ?? 0})`}
              </h3>

              {reviews && reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((rev) => (
                    <div key={rev._id} className="p-5 rounded-xl bg-surface border border-muted shadow-card font-sans">
                      <div className={cn("flex items-start justify-between gap-4", locale === 'ar' && "flex-row-reverse")}>
                      <div className={cn("flex items-center gap-4", locale === 'ar' && "flex-row-reverse")}>
                        <div className="w-10 h-10 rounded-full bg-surface-raised border border-muted flex items-center justify-center overflow-hidden">
                            {rev.userImage ? (
                              <Image src={rev.userImage} alt={rev.userName} width={36} height={36} className="object-cover" />
                            ) : (
                              <span className="text-[var(--gold)] font-bold text-sm">{rev.userName.charAt(0)}</span>
                            )}
                          </div>
                          <div>
                            <span className="text-sm font-semibold text-primary block">{rev.userName}</span>

                          </div>
                          <span className="text-sm text-secondary" dir="ltr">{new Date(rev._creationTime).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                        </div>
                      </div>
                      <p className="text-sm text-secondary mt-3 font-normal leading-relaxed">{rev.comment}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 border border-dashed border-muted rounded-xl flex items-center justify-center text-center">
                  <p className="text-sm font-normal text-muted italic px-4">{dict.productDetail?.noReviews || 'No customer reviews yet. Be the first to share your experience.'}</p>
                </div>
              )}
            </div>

            {/* Review submission Form */}
            <div className={cn("lg:col-span-5", locale === 'ar' && "text-right")} dir={locale === 'ar' ? 'rtl' : 'ltr'}>
              <div className="p-6 rounded-xl bg-surface border border-muted shadow-card font-sans">
                <h3 className="font-display text-base font-bold text-primary mb-4">{dict.productDetail?.recordImpression || 'Record Your Impression'}</h3>
                
                {user ? (
                  product._id === 'static-cut' ? (
                    <div className="py-8 text-center flex flex-col items-center gap-4">
                      <p className="text-sm font-normal text-muted px-4">
                        {locale === 'ar' ? 'التقييمات غير متوفرة لهذه القطعية الموسمية.' : 'Reviews are not available for this seasonal cut.'}
                      </p>
                    </div>
                  ) : reviewSuccess ? (
                    <div className="text-center py-6 flex flex-col items-center gap-2">
                      <div className="w-12 h-12 rounded-full bg-success-bg border border-success-border flex items-center justify-center text-success mb-2">
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                      <h4 className="font-bold text-primary text-sm">{dict.productDetail?.reviewSubmitted || 'Review Submitted!'}</h4>
                      <p className="text-sm text-secondary font-normal max-w-xs mt-1">
                        {dict.productDetail?.reviewThanks || 'Thank you for sharing your experience. Your rating has been integrated into the average cut rating.'}
                      </p>
                    </div>
                  ) : (
                    <form onSubmit={handleReviewSubmit} className="space-y-4">
                      {/* Rating select */}
                      <div>
                        <span className="text-3xs uppercase tracking-wider text-muted block mb-2">{dict.productDetail?.tasteRating || 'Taste Rating'}</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setReviewRating(star)}
                              aria-label={`${star} ${star === 1 ? 'star' : 'stars'}`}
                              aria-pressed={star <= reviewRating}
                              className="w-11 h-11 flex items-center justify-center text-xl hover:scale-110 transition-transform cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
                            >
                              <span className={cn(star <= reviewRating ? 'text-[var(--gold)]' : 'text-[var(--rating-star-empty)]')}>★</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Comment */}
                      <div>
                        <label htmlFor="review-comment" className="text-3xs uppercase tracking-wider text-muted block mb-1.5">
                          {dict.productDetail?.commentLabel || 'Impression Comment'}
                        </label>
                        <textarea
                          id="review-comment"
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder={dict.productDetail?.commentPlaceholder || 'Describe the texture, marbling, freshness, or overall quality of this select cut...'}
                          className={cn(
                            'w-full p-4 rounded-button text-sm font-sans resize-none',
                            'bg-surface-raised border border-muted',
                            'text-primary placeholder:text-muted focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20',
                            'transition-all duration-300'
                          )}
                        />
                      </div>

                      {reviewError && <p className="text-sm text-error font-medium">{reviewError}</p>}

                      <Button type="submit" fullWidth className="uppercase tracking-wider text-2xs font-semibold h-11 cursor-pointer">
                        {dict.productDetail?.submitReview || 'Submit Review'}
                      </Button>
                    </form>
                  )
                ) : (
                  <div className="py-8 text-center flex flex-col items-center gap-4">
                    <p className="text-sm font-normal text-muted px-4">{dict.productDetail?.signInPrompt || 'Please sign in to your El Talkhawy account to record verified purchase reviews.'}</p>
                    <Button onClick={() => router.push(`/${locale}/sign-in`)} size="sm" className="uppercase tracking-wider text-xs h-10">
                      {dict.productDetail?.signInNow || 'Sign In Now'}
                    </Button>
                  </div>
                )}
              </div>
            </div>

          </div>

          {/* Related Products Grid */}
          {relatedProducts && relatedProducts.length > 0 && (
            <div className="mt-24 border-t border-muted pt-20">
              <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block text-center mb-3">
                {dict.productDetail?.masterRecommendations || 'Master Recommendations'}
              </span>
              <h3 className="font-display text-2xl md:text-3xl font-bold text-primary text-center mb-10">
                {dict.productDetail?.youMayAlsoRelish || 'You May Also Relish'}
              </h3>

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-7">
                {relatedProducts.map((prod) => (
                  <ProductCard
                    key={prod._id}
                    product={prod}
                    isInWishlist={wishlistItems?.some((item) => item._id === prod._id)}
                    onAddToCart={async (productId, weight, quantity) => {
                      const relatedProduct = relatedProducts.find((p) => p._id === productId);
                      if (!relatedProduct) return;
                      const variant = relatedProduct.variants.find((v) => v.weight === weight) ?? relatedProduct.variants[0];
                      const finalPrice = relatedProduct.discount ? discountedPrice(variant.price, relatedProduct.discount) : variant.price;
                      if (user) {
                        await addToCartMutation({ userId: user.id, productId: productId as Id<'products'>, variantWeight: weight, quantity, price: finalPrice });
                      } else {
                        const guestCart = JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]');
                        const existingIdx = guestCart.findIndex((item: { productId: string; variantWeight: string; quantity: number }) => item.productId === productId && item.variantWeight === weight);
                        if (existingIdx > -1) guestCart[existingIdx].quantity += quantity;
                        else guestCart.push({ productId, variantWeight: weight, quantity, price: finalPrice });
                        localStorage.setItem('et_guest_cart', JSON.stringify(guestCart));
                        window.dispatchEvent(new Event('storage'));
                      }
                      window.dispatchEvent(new Event('open-cart'));
                    }}
                    onToggleWishlist={handleToggleWishlist}
                  />
                ))}
              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
