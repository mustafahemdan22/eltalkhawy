'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';
import { cn, formatPrice, cloudinaryImageUrl, discountedPrice } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/LocaleProvider';
import { STARTERS } from '@/lib/constants';

interface CartDrawerProps {
  isOpen:    boolean;
  onClose:   () => void;
}

interface GuestCartItem {
  productId: string;
  variantWeight: string;
  quantity: number;
  price: number;
  isGrilled?: boolean;
  grillComment?: string;
  starterName?: string;
  starterPrice?: number;
}

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
    categorySlug: string;
    images:       string[];
    discount:     number | null;
    variants: Array<{
      weight: string;
      price:  number;
      stock:  number;
    }>;
  };
}

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { user } = useUser();
  const { locale, dict } = useLocale();
  const router = useRouter();

  const isRtl = locale === 'ar';
  const localePrefix = `/${locale}`;

  const [guestCart, setGuestCart] = useState<GuestCartItem[]>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]'); } catch { return []; }
    }
    return [];
  });

  const dbCart = useQuery(api.cart.get, user ? { userId: user.id } : 'skip');
  const allProducts = useQuery(api.products.list, {});

  const localProductsList = useMemo(() => allProducts ?? [], [allProducts]);

  const updateQuantityMutation = useMutation(api.cart.updateQuantity);
  const removeMutation = useMutation(api.cart.remove);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Re-sync guest cart from localStorage each time the drawer opens
      // This ensures we never show stale state if the storage event was missed
      if (!user) {
        try {
          const raw = localStorage.getItem('et_guest_cart') ?? '[]';
          setGuestCart(JSON.parse(raw));
        } catch {
          setGuestCart([]);
        }
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, user]);

  /* Sync guest cart state when localStorage changes (e.g. after add-to-cart) */
  useEffect(() => {
    if (user) return; // authenticated users rely on Convex reactive query
    const syncGuestCart = () => {
      try {
        const raw = localStorage.getItem('et_guest_cart') ?? '[]';
        setGuestCart(JSON.parse(raw));
      } catch {
        setGuestCart([]);
      }
    };
    window.addEventListener('storage', syncGuestCart);
    return () => window.removeEventListener('storage', syncGuestCart);
  }, [user]);

  /* Close on Escape */
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const cartItems = useMemo<PopulatedCartItem[]>(() => {
    if (user) {
      return (dbCart?.items ?? []) as unknown as PopulatedCartItem[];
    }
    if (!localProductsList.length) return [];

    return guestCart.map((item) => {
      const product = localProductsList.find((p) => p._id === item.productId);
      return {
        ...item,
        product,
      } as unknown as PopulatedCartItem;
    }).filter((item) => item.product !== undefined);
  }, [user, dbCart, guestCart, localProductsList]);

  const subtotal = useMemo(() => {
    return cartItems.reduce((acc, item) => {
      const variant = item.product.variants.find((v) => v.weight === item.variantWeight);
      const baseVal = variant ? variant.price : item.price;
      const rawPrice = item.product.discount
        ? discountedPrice(baseVal, item.product.discount)
        : baseVal;
      const grillFee = item.isGrilled ? 50 : 0;
      const starterFee = item.starterPrice ?? 0;
      const latestPrice = rawPrice + grillFee + starterFee;
      return acc + latestPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const handleUpdateQuantity = async (productId: string, weight: string, newQty: number) => {
    if (user) {
      await updateQuantityMutation({
        userId: user.id,
        productId: productId as Id<"products">,
        variantWeight: weight,
        quantity: newQty,
      });
    } else {
      const updated = guestCart.map((item) => {
        if (item.productId === productId && item.variantWeight === weight) {
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      });
      localStorage.setItem('et_guest_cart', JSON.stringify(updated));
      setGuestCart(updated);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleRemoveItem = async (productId: string, weight: string) => {
    if (user) {
      await removeMutation({
        userId: user.id,
        productId: productId as Id<"products">,
        variantWeight: weight,
      });
    } else {
      const filtered = guestCart.filter(
        (item) => !(item.productId === productId && item.variantWeight === weight)
      );
      localStorage.setItem('et_guest_cart', JSON.stringify(filtered));
      setGuestCart(filtered);
      window.dispatchEvent(new Event('storage'));
    }
  };

  const handleCheckoutClick = () => {
    onClose();
    router.push(`${localePrefix}/checkout`);
  };


  const drawerVariants = {
    hidden: { x: isRtl ? '-100%' : '100%' },
    visible: { x: 0 },
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-overlay backdrop-blur-sm"
          />

          <motion.div
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={drawerVariants}
            transition={{ type: 'spring', stiffness: 350, damping: 35 }}
            data-theme="dark"
            className={cn(
              'fixed top-0 bottom-0 z-50 w-full max-w-md bg-surface border shadow-raised flex flex-col font-sans',
              isRtl ? 'left-0 border-r border-l-0' : 'right-0 border-l',
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="p-6 sm:p-8 border-b border-muted flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <ShoppingCart className="w-5 h-5 text-[var(--gold)]" />
                <span className="font-display font-bold text-base uppercase tracking-widest">{dict.cart?.basket || 'Basket'}</span>
                <span className="font-mono text-xs text-[var(--gold)] font-bold bg-[var(--gold-subtle)] px-2.5 py-1 rounded-full border border-[var(--gold-border)]">
                  {cartItems.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-3 rounded-button bg-surface-raised border border-muted text-secondary hover:text-primary transition-colors cursor-pointer"
                aria-label={dict.cart?.close || 'Close cart drawer'}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content */}
            <div className={cn('flex-1 overflow-y-auto no-scrollbar p-6 divide-y divide-muted/40')}>
              {cartItems.length > 0 ? (
                cartItems.map((item) => {
                  const variant = item.product.variants.find((v) => v.weight === item.variantWeight);
                  const baseVal = variant ? variant.price : item.price;
                  const rawPrice = item.product.discount
                    ? discountedPrice(baseVal, item.product.discount)
                    : baseVal;
                  const grillFee = item.isGrilled ? 50 : 0;
                  const starterFee = item.starterPrice ?? 0;
                  const finalPrice = rawPrice + grillFee + starterFee;

                  const imgUrl = item.product.images[0]
                    ? cloudinaryImageUrl(item.product.images[0], { width: 120, height: 160, crop: 'fill', gravity: 'auto' })
                    : cloudinaryImageUrl('eltalkhawy/categories/beef/products/beef-chuck-cubes', { width: 120, height: 160, crop: 'fill', gravity: 'auto' });

                  return (
                    <div key={`${item.productId}-${item.variantWeight}-${item.isGrilled ? 'grill' : 'raw'}-${item.starterName || ''}`} className="py-4 flex gap-4 cart-item-enter">
                      <div className={cn('relative w-16 h-20 rounded-md bg-surface-raised border border-muted overflow-hidden shrink-0')}>
                        <Image src={imgUrl} alt={locale === 'ar' ? item.product.nameAr : item.product.name} fill sizes="64px" className="object-cover" />
                      </div>

                      <div className="flex-1 flex flex-col gap-1 min-w-0">
                        <Link
                          href={`/${locale}/shop/${item.product.slug}`}
                          onClick={onClose}
                          className="font-display font-bold text-primary text-sm hover:text-[var(--brand)] transition-colors truncate"
                        >
                          {locale === 'ar' ? item.product.nameAr : item.product.name}
                        </Link>
                        
                        {/* Grill & Starter Info */}
                        {(item.isGrilled || item.starterName) && (
                          <div className={cn("flex flex-col gap-0.5 text-3xs text-[var(--gold)] mt-0.5 font-sans font-medium", isRtl && "text-right")}>
                            {item.isGrilled && (
                              <div className="flex items-center gap-1">
                                <span>🔥 {locale === 'ar' ? 'تسوية وشوي (+٥٠ ج.م)' : 'Grill Prep (+EGP 50)'}</span>
                                {item.grillComment && (
                                  <span className="text-muted italic truncate max-w-[120px]">({item.grillComment})</span>
                                )}
                              </div>
                            )}
                            {item.starterName && (
                              <div>
                                <span>🍲 {(() => {
                                  const starterObj = STARTERS.find(s => s.name === item.starterName || s.nameAr === item.starterName || s.id === item.starterName);
                                  return starterObj ? (locale === 'ar' ? starterObj.nameAr : starterObj.name) : item.starterName;
                                })()} (+{formatPrice(item.starterPrice ?? 0, locale)})</span>
                              </div>
                            )}
                          </div>
                        )}

                        <div className={cn('flex items-baseline gap-2', isRtl && 'flex-row-reverse')}>
                          <span className="price-current text-sm">
                            {formatPrice(finalPrice, locale)}
                          </span>
                          <span className="text-xs text-secondary">{item.variantWeight}</span>
                        </div>

                        <div className={cn('flex items-center gap-2 mt-1 select-none', isRtl && 'flex-row-reverse')}>
                          <div className={cn('flex items-center justify-between border border-muted bg-surface-raised rounded-md h-11', isRtl ? 'w-28 flex-row-reverse' : 'w-28')}>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.variantWeight, item.quantity - 1)}
                              className="flex items-center justify-center w-11 h-11 text-secondary hover:text-primary font-bold cursor-pointer"
                              aria-label={dict.cart?.decreaseQuantity || "Decrease quantity"}
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-sm text-primary font-bold tabular-nums">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.variantWeight, item.quantity + 1)}
                              className="flex items-center justify-center w-11 h-11 text-secondary hover:text-primary font-bold cursor-pointer"
                              aria-label={dict.cart?.increaseQuantity || "Increase quantity"}
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.productId, item.variantWeight)}
                            className="flex items-center gap-1 px-3 py-2 -my-1 text-2xs text-secondary hover:text-error hover:bg-error-bg/40 rounded transition-colors cursor-pointer min-h-10"
                          >
                            <Trash2 className="w-3 h-3" />
                            {dict.cart?.remove || 'Remove'}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center py-20 px-8">
                  <div className="w-16 h-16 rounded-full bg-[var(--gold-subtle)] border border-[var(--gold-border)] flex items-center justify-center text-[var(--gold)] mb-5">
                    <ShoppingCart className="w-7 h-7" />
                  </div>
                  <h4 className="font-display text-primary font-bold text-base leading-tight">{dict.cart?.emptyTitle || 'Your Basket is Empty'}</h4>
                  <p className="text-sm text-secondary mt-2 font-normal max-w-xs">
                    {dict.cart?.emptyDescription || 'Browse our butcher selections to begin shopping.'}
                  </p>
                  <Button onClick={() => { onClose(); router.push(`/${locale}/categories`); }} size="md" variant="primary" className="mt-6 text-xs h-11 px-7 cursor-pointer">
                    {dict.cart?.browseCatalog || 'Browse Catalog'}
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 sm:p-8 border-t border-muted bg-surface-raised/50 flex flex-col gap-6">
                <div className={cn('flex justify-between items-center text-base font-bold', isRtl && 'flex-row-reverse')}>
                  <span className="text-primary">{dict.cart?.subtotal || 'Subtotal:'}</span>
                  <span className="font-mono text-[var(--price-current)] text-xl">{formatPrice(subtotal, locale)}</span>
                </div>
                <div className="flex flex-col gap-3">
                  <Button
                    onClick={handleCheckoutClick}
                    fullWidth
                    iconRight={isRtl ? undefined : <ArrowRight className="w-4 h-4" />}
                    iconLeft={isRtl ? <ArrowRight className="w-4 h-4 rotate-180" /> : undefined}
                    className="h-12 text-sm tracking-wider uppercase font-semibold cursor-pointer"
                  >
                    {dict.cart?.reviewCheckout || 'Review & Checkout'}
                  </Button>
                  <button
                    onClick={onClose}
                    className="h-12 px-5 rounded-button text-sm font-semibold border border-muted text-secondary hover:text-primary hover:border-muted transition-all uppercase tracking-wider cursor-pointer"
                  >
                    {dict.cart?.continueShopping || 'Continue Shopping'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
