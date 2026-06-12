'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import type { Doc, Id } from '@/convex/_generated/dataModel';
import { cn, formatPrice, cloudinaryUrl, discountedPrice } from '@/lib/utils';
import { SITE_CONFIG } from '@/lib/constants';
import { useUser } from '@clerk/nextjs';
import { useLocale } from '@/components/LocaleProvider';
import {
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Plus,
  Minus,
  Tag,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

interface PopulatedCartItem {
  productId:     string;
  variantWeight: string;
  quantity:      number;
  price:         number;
  isGrilled?:    boolean;
  grillComment?: string;
  starterName?:  string;
  starterPrice?: number;
  product: {
    _id:          string;
    slug:         string;
    name:         string;
    nameAr:       string;
    images:       string[];
    discount:     number | null;
    variants: Array<{
      weight: string;
      price:  number;
      stock:  number;
    }>;
  };
}

function CartSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14">
      <div className="lg:col-span-8 flex flex-col gap-6">
        <div className="flex items-center justify-between pb-4 border-b border-muted">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-4 w-20" />
        </div>
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="py-6 flex gap-4">
            <Skeleton className="w-16 h-20 md:w-20 md:h-24 rounded-lg shrink-0" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/4" />
              <Skeleton className="h-8 w-28" />
            </div>
            <Skeleton className="h-4 w-20 shrink-0" />
          </div>
        ))}
      </div>
      <div className="lg:col-span-4">
        <div className="p-8 rounded-2xl bg-surface border border-muted space-y-4">
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  const { user, isLoaded: authLoaded } = useUser();
  const { locale, dict } = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const [guestCart, setGuestCart] = useState<Array<{
    productId:     string;
    variantWeight: string;
    quantity:      number;
    price:         number;
  }>>(() => {
    if (typeof window !== 'undefined') {
       try { return JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]') as Array<{ productId: string; variantWeight: string; quantity: number; price: number }>; } catch { return []; }

    }
    return [];
  });
  const [promoCodeInput, setPromoCodeInput] = useState('');
  const [activePromo, setActivePromo] = useState<Doc<"promoCodes"> | null>(null);
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoError, setPromoError] = useState('');

  const dbCart = useQuery(api.cart.get, user ? { userId: user.id } : 'skip');
  const allProducts = useQuery(api.products.list, {});

  const updateQuantityMutation = useMutation(api.cart.updateQuantity);
  const removeMutation = useMutation(api.cart.remove);
  const clearMutation = useMutation(api.cart.clear);

  useEffect(() => {
    if (!user) {
      const loadGuestCart = () => {
        setGuestCart(JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]'));
      };
      window.addEventListener('storage', loadGuestCart);
      return () => window.removeEventListener('storage', loadGuestCart);
    }
  }, [user]);

  const cartItems = useMemo<PopulatedCartItem[]>(() => {
    if (user) return (dbCart?.items ?? []) as unknown as PopulatedCartItem[];
    if (!allProducts || !allProducts.length) return [];
    return guestCart.map((item) => {
      const product = allProducts.find((p) => p._id === item.productId);
      return { ...item, product } as unknown as PopulatedCartItem;
    }).filter((item) => item.product !== undefined);
  }, [user, dbCart, guestCart, allProducts]);

  /* ── Stock validation ── */
  const stockIssues = useMemo(() => {
    const issues: Array<{ name: string; weight: string; available: number; wanted: number }> = [];
    for (const item of cartItems) {
      const variant = item.product.variants.find((v) => v.weight === item.variantWeight);
      if (variant && variant.stock < item.quantity) {
        issues.push({
          name: locale === 'ar' ? item.product.nameAr : item.product.name,
          weight: item.variantWeight,
          available: variant.stock,
          wanted: item.quantity,
        });
      }
    }
    return issues;
  }, [cartItems, locale]);

  /* ── Totals ── */
  const totals = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => {
      const variant = item.product.variants.find((v) => v.weight === item.variantWeight);
      const baseVal = variant ? variant.price : item.price;
      const rawPrice = item.product.discount ? discountedPrice(baseVal, item.product.discount) : baseVal;
      const grillFee = item.isGrilled ? 50 : 0;
      const starterFee = item.starterPrice ?? 0;
      const latestPrice = rawPrice + grillFee + starterFee;
      return acc + latestPrice * item.quantity;
    }, 0);
    const deliveryCost = subtotal >= SITE_CONFIG.deliveryMin || subtotal === 0 ? 0 : SITE_CONFIG.deliveryCost;
    let promoDiscount = 0;
    if (activePromo) {
      promoDiscount = activePromo.discountType === 'percentage'
        ? subtotal * (activePromo.discountValue / 100)
        : activePromo.discountValue;
    }
    const vat = subtotal * SITE_CONFIG.vatRate;
    const total = Math.max(0, subtotal + deliveryCost - promoDiscount + vat);
    return { subtotal, deliveryCost, promoDiscount, vat, total };
  }, [cartItems, activePromo]);

  /* ── Promo code via Convex ── */
  const [promoQueryCode, setPromoQueryCode] = useState<string | null>(null);
  const promoResult = useQuery(
    api.promoCodes.getByCode,
    promoQueryCode ? { code: promoQueryCode } : 'skip',
  );

  const handleApplyPromo = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    const code = promoCodeInput.trim().toUpperCase();
    if (!code) return;
    setPromoLoading(true);
    setPromoError('');
    setPromoQueryCode(code);
  }, [promoCodeInput]);

  useEffect(() => {
    if (!promoQueryCode) return;
    if (promoResult === undefined) return;
    const timer = setTimeout(() => {
      setPromoLoading(false);
      if (!promoResult) {
        setPromoError(dict.cart?.invalidCoupon || 'Invalid coupon code.');
        setPromoQueryCode(null);
        return;
      }
      if (!promoResult.isActive) {
        setPromoError(dict.cart?.invalidCoupon || 'This coupon is no longer active.');
        setPromoQueryCode(null);
        return;
      }
      if (promoResult.expiresAt && Date.now() > promoResult.expiresAt) {
        setPromoError('This coupon has expired.');
        setPromoQueryCode(null);
        return;
      }
      if (promoResult.maxUses && promoResult.currentUses >= promoResult.maxUses) {
        setPromoError('This coupon has reached its usage limit.');
        setPromoQueryCode(null);
        return;
      }
      if (promoResult.minOrder && totals.subtotal < promoResult.minOrder) {
        setPromoError(`Minimum order of EGP ${promoResult.minOrder} required for this coupon.`);
        setPromoQueryCode(null);
        return;
      }
      setActivePromo(promoResult);
      setPromoCodeInput('');
      setPromoQueryCode(null);
    }, 0);
    return () => clearTimeout(timer);
  }, [promoQueryCode, promoResult, totals.subtotal, dict]);

  /* ── Quantity/Remove/Clear ── */
  const handleUpdateQuantity = async (productId: string, weight: string, newQty: number) => {
    if (user) {
      await updateQuantityMutation({ userId: user.id, productId: productId as Id<'products'>, variantWeight: weight, quantity: newQty });
    } else {
      const updated = guestCart.map((item) =>
        item.productId === productId && item.variantWeight === weight ? { ...item, quantity: Math.max(1, newQty) } : item
      );
      localStorage.setItem('et_guest_cart', JSON.stringify(updated));
      setGuestCart(updated);
    }
  };

  const handleRemoveItem = async (productId: string, weight: string) => {
    if (user) {
      await removeMutation({ userId: user.id, productId: productId as Id<'products'>, variantWeight: weight });
    } else {
      setGuestCart((prev) => {
        const updated = prev.filter((item) => !(item.productId === productId && item.variantWeight === weight));
        localStorage.setItem('et_guest_cart', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleClearCart = async () => {
    if (user) {
      await clearMutation({ userId: user.id });
    } else {
      localStorage.setItem('et_guest_cart', '[]');
      setGuestCart([]);
    }
  };

  const handleProceedToCheckout = () => {
    if (cartItems.length === 0 || stockIssues.length > 0) return;
    if (activePromo) sessionStorage.setItem('et_applied_promo', JSON.stringify(activePromo));
    else sessionStorage.removeItem('et_applied_promo');
    router.push(`/${locale}/checkout`);
  };

  const isLoading = authLoaded === false || (user && dbCart === undefined) || allProducts === undefined;

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-base py-14 md:py-20">
        <div className="container-brand">
          <div className="text-center mb-16">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
              {dict.cart?.yourSelection || 'Your Selection'}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-4">
              <ShoppingBag className="w-6 h-6 text-[var(--gold)]" />
              {dict.cart?.pageTitle || 'Cart'}
            </h1>
            <p className="text-base text-secondary mt-3 max-w-sm mx-auto leading-relaxed font-sans font-normal">
              {dict.cart?.pageSubtitle || 'Review your selection before checkout.'}
            </p>
          </div>

          {isLoading ? (
            <CartSkeleton />
          ) : cartItems.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
              {/* Items */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="flex items-center justify-between pb-4 border-b border-muted text-sm font-semibold uppercase tracking-wider text-secondary">
                  <span>{dict.cart?.specialtyCut || 'Item'}</span>
                  <button onClick={handleClearCart} className="px-3 py-2 -my-2 min-h-10 text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors cursor-pointer">
                    {dict.cart?.clearCart || 'Clear Cart'}
                  </button>
                </div>

                {/* Stock warning */}
                {stockIssues.length > 0 && (
                  <div className="p-4 rounded-lg bg-warning-bg border border-warning-border text-warning text-sm flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">{locale === 'ar' ? 'تعديل الكمية' : 'Quantity Adjustment Needed'}</p>
                      <ul className="space-y-1 text-warning/80">
                        {stockIssues.map((issue, i) => (
                          <li key={i}>• {issue.name} ({issue.weight}): {dict.cart?.requested || 'requested'} {issue.wanted}, {dict.cart?.available || 'available'} {issue.available}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                <div className="divide-y divide-muted/60">
                  {cartItems.map((item) => {
                    const variant = item.product.variants.find((v) => v.weight === item.variantWeight);
                    const basePrice = variant ? variant.price : item.price;
                    const rawPrice = item.product.discount ? discountedPrice(basePrice, item.product.discount) : basePrice;
                    const grillFee = item.isGrilled ? 50 : 0;
                    const starterFee = item.starterPrice ?? 0;
                    const finalPrice = rawPrice + grillFee + starterFee;
                    const maxStock = variant?.stock ?? 99;
                    const imgUrl = item.product.images[0]
                      ? (item.product.images[0].startsWith('http') ? item.product.images[0] : cloudinaryUrl(item.product.images[0], { width: 300, height: 350, crop: 'fill' }))
                      : 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&q=80';

                    return (
                      <div key={`${item.productId}-${item.variantWeight}-${item.isGrilled ? 'grill' : 'raw'}-${item.starterName || ''}`} className="py-4 md:py-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                        <div className={cn('flex items-center gap-4 flex-1', isRtl && 'flex-row-reverse')}>
                          <div className="relative w-16 h-20 md:w-20 md:h-24 rounded-lg overflow-hidden bg-surface-raised border border-muted shrink-0">
                            <Image src={imgUrl} alt={locale === 'ar' ? item.product.nameAr : item.product.name} fill sizes="120px" className="object-cover" />
                          </div>
                          <div className={cn('flex flex-col gap-1', isRtl && 'items-end text-right')}>
                            <span className="text-3xs uppercase tracking-wider text-[var(--gold)] font-semibold">{dict.cart?.specialtyCut || 'Specialty Cut'}</span>
                            <Link href={`/${locale}/shop/${item.product.slug}`} className="font-display font-bold text-primary text-sm md:text-base hover:text-[var(--gold-hover)] transition-colors line-clamp-1">
                              {locale === 'ar' ? item.product.nameAr : item.product.name}
                            </Link>

                            {/* Grill & Starter Info */}
                            {(item.isGrilled || item.starterName) && (
                              <div className={cn("flex flex-col gap-0.5 text-3xs text-[var(--gold)] mt-0.5 font-sans font-medium", isRtl && "items-end text-right")}>
                                {item.isGrilled && (
                                  <div className="flex items-center gap-1.5">
                                    <span>🔥 {locale === 'ar' ? 'تسوية وشوي (+٥٠ ج.م)' : 'Grill Prep (+EGP 50)'}</span>
                                    {item.grillComment && (
                                      <span className="text-muted italic">({item.grillComment})</span>
                                    )}
                                  </div>
                                )}
                                {item.starterName && (
                                  <div>
                                    <span>🍲 {item.starterName} (+{formatPrice(item.starterPrice ?? 0, locale)})</span>
                                  </div>
                                )}
                              </div>
                            )}

                            <div className={cn('flex items-center gap-4 text-xs text-secondary font-normal mt-0.5', isRtl && 'flex-row-reverse')}>
                              <span className={cn('font-semibold px-2 py-0.5 rounded border', maxStock <= 0 ? 'text-error border-error-border bg-error-bg' : 'bg-surface-raised border-muted')}>
                                {maxStock <= 0 ? (dict.cart?.outOfStock || 'Out of Stock') : item.variantWeight}
                              </span>
                              <span className="text-muted">{locale === 'ar' ? item.product.name : item.product.nameAr}</span>
                            </div>
                          </div>
                        </div>

                        <div className={cn('flex items-center justify-between sm:justify-end gap-6 md:gap-10 shrink-0', isRtl && 'flex-row-reverse')}>
                          <div className={cn('flex items-center justify-between border border-muted bg-surface-raised rounded-button px-3 h-10 select-none', isRtl ? 'w-28 flex-row-reverse' : 'w-28')}>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.variantWeight, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                              className="text-secondary hover:text-primary font-bold text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-sm text-primary font-bold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.variantWeight, item.quantity + 1)}
                              disabled={item.quantity >= maxStock}
                              className="text-secondary hover:text-primary font-bold text-sm cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          {maxStock > 0 && item.quantity >= maxStock && (
                            <span className="text-3xs text-warning font-medium">{locale === 'ar' ? 'الحد الأقصى' : 'Max'}</span>
                          )}

                          <div className={cn('flex flex-col gap-0.5 text-right', isRtl && 'text-left')}>
                            <span className="price-current text-sm md:text-base">{formatPrice(finalPrice * item.quantity, locale)}</span>
                            <span className="price-unit">({formatPrice(finalPrice, locale)}/{dict.shop?.per || '/'}{item.variantWeight})</span>
                          </div>

                          <button onClick={() => handleRemoveItem(item.productId, item.variantWeight)} className="p-3 rounded bg-surface-raised border border-muted text-secondary hover:text-error hover:border-error-border transition-all cursor-pointer" aria-label={dict.cart?.remove || 'Remove'}>
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Summary */}
              <div className="lg:col-span-4 flex flex-col gap-8">
                <div className="p-8 rounded-card bg-surface border border-muted flex flex-col gap-6">
                  <h3 className="font-display text-primary font-bold text-base border-b border-muted pb-4">{dict.cart?.orderSummary || 'Order Summary'}</h3>

                  <div className="space-y-3 text-sm divide-y divide-muted/40">
                    <div className={cn('flex justify-between pb-3', isRtl && 'flex-row-reverse')}>
                      <span className="text-secondary">{dict.cart?.subtotal || 'Subtotal'}</span>
                      <span className="font-mono font-bold text-primary">{formatPrice(totals.subtotal, locale)}</span>
                    </div>
                    <div className={cn('flex justify-between pt-3 pb-3', isRtl && 'flex-row-reverse')}>
                      <span className="text-secondary">{dict.cart?.delivery || 'Delivery'}</span>
                      {totals.deliveryCost === 0 ? (
                        <span className="text-success uppercase font-semibold">{dict.cart?.freeDelivery || 'Free'}</span>
                      ) : (
                        <span className="font-mono font-bold text-primary">{formatPrice(totals.deliveryCost, locale)}</span>
                      )}
                    </div>
                    {activePromo && totals.promoDiscount > 0 && (
                      <div className={cn('flex justify-between pt-3 pb-3 text-[var(--gold)] font-medium', isRtl && 'flex-row-reverse')}>
                        <span className={cn('flex items-center gap-1.5', isRtl && 'flex-row-reverse')}>
                          <Tag className="w-3.5 h-3.5" />{dict.cart?.codeApplied || 'Code'}: {activePromo!.code}
                        </span>
                        <span className="font-mono font-bold">−{formatPrice(totals.promoDiscount, locale)}</span>
                      </div>
                    )}
                    <div className={cn('flex justify-between pt-3 pb-3', isRtl && 'flex-row-reverse')}>
                      <span className="text-secondary">{dict.cart?.vat || 'VAT'}</span>
                      <span className="font-mono font-semibold text-muted">{formatPrice(totals.vat, locale)}</span>
                    </div>
                    <div className={cn('flex justify-between pt-4 text-sm font-bold border-t border-muted', isRtl && 'flex-row-reverse')}>
                      <span className="text-primary">{dict.cart?.grandTotal || 'Total'}</span>
                      <span className="font-mono text-base text-[var(--gold)] font-bold">{formatPrice(totals.total, locale)}</span>
                    </div>
                  </div>

                  {/* Promo */}
                  {!activePromo ? (
                    <form onSubmit={handleApplyPromo} className={cn('flex gap-2', isRtl && 'flex-row-reverse')}>
                      <input type="text" placeholder={dict.cart?.couponCode || 'COUPON CODE'} value={promoCodeInput}
                        onChange={(e) => setPromoCodeInput(e.target.value)}
                        className={cn('flex-1 h-10 px-4 rounded-button text-sm font-mono font-semibold uppercase tracking-wider bg-surface-raised border border-muted text-primary placeholder:text-muted focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all')} />
                      <button type="submit" disabled={promoLoading || !promoCodeInput.trim()}
                        className="h-11 px-5 rounded-button text-sm font-semibold bg-surface-raised border border-muted text-[var(--gold)] hover:text-[var(--gold-hover)] transition-colors uppercase tracking-wider cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
                        {promoLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : (dict.cart?.apply || 'Apply')}
                      </button>
                    </form>
                  ) : (
                    <div className="p-3 rounded-lg bg-[var(--gold-subtle)] border border-[var(--gold)]/20 flex items-center justify-between text-sm text-[var(--gold)] font-medium">
                      <span className={cn('flex items-center gap-1.5', isRtl && 'flex-row-reverse')}>
                        <Tag className="w-3.5 h-3.5" />{dict.cart?.codeApplied || 'Applied'}: {activePromo.code}
                      </span>
                      <button onClick={() => { setActivePromo(null); setPromoError(''); }} className="flex items-center justify-center w-11 h-11 -mr-3 text-[var(--gold)] hover:text-[var(--gold-hover)] hover:bg-[var(--gold-subtle)] rounded transition-colors cursor-pointer font-bold" aria-label="Remove promo code">✕</button>
                    </div>
                  )}
                  {promoLoading && <p className="text-2xs text-muted flex items-center gap-1.5"><RefreshCw className="w-3 h-3 animate-spin" /> {locale === 'ar' ? 'جاري التحقق...' : 'Validating...'}</p>}
                  {promoError && <p className="text-2xs text-error font-medium">{promoError}</p>}

                  <Button
                    onClick={handleProceedToCheckout}
                    fullWidth
                    disabled={stockIssues.length > 0}
                    iconRight={isRtl ? undefined : <ArrowRight className="w-4 h-4" />}
                    iconLeft={isRtl ? <ArrowRight className="w-4 h-4 rotate-180" /> : undefined}
                    className="h-12 text-sm tracking-wider uppercase font-semibold mt-3 cursor-pointer"
                  >
                    {stockIssues.length > 0
                      ? (locale === 'ar' ? 'يرجى تعديل الكميات' : 'Adjust Quantities')
                      : (dict.cart?.proceedToCheckout || 'Checkout')}
                  </Button>

                  <div className="pt-2 flex flex-col gap-4 border-t border-muted text-xs uppercase tracking-widest text-secondary font-semibold">
                    <div className={cn('flex items-center gap-4', isRtl && 'flex-row-reverse')}>
                      <Truck className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      <span>{dict.cart?.freeDeliveryOver?.replace('{min}', String(SITE_CONFIG.deliveryMin)) || `Free over EGP ${SITE_CONFIG.deliveryMin}`}</span>
                    </div>
                    <div className={cn('flex items-center gap-4', isRtl && 'flex-row-reverse')}>
                      <ShieldCheck className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      <span>{dict.cart?.dispatch || 'Same-day dispatch'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl bg-surface border border-muted max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-secondary mb-5">
                <ShoppingBag className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="font-display text-lg font-bold text-primary">{dict.cart?.cartEmpty || 'Cart is Empty'}</h3>
              <p className="text-sm text-secondary max-w-xs mt-2 font-sans font-normal">{dict.cart?.cartEmptyDesc || 'Browse our selection.'}</p>
              <Button onClick={() => router.push(`/${locale}/categories`)} className="mt-6 h-11 px-7 rounded-button text-sm font-semibold uppercase tracking-wider cursor-pointer">
                {dict.cart?.goToCatalog || 'Go to Catalog'}
              </Button>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
