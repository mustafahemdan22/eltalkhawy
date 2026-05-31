'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, ShoppingCart, Plus, Minus, ArrowRight } from 'lucide-react';
import { cn, formatPrice, cloudinaryUrl } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/LocaleProvider';

interface CartDrawerProps {
  isOpen:    boolean;
  onClose:   () => void;
}

interface PopulatedCartItem {
  productId:     string;
  variantWeight: string;
  quantity:      number;
  price:         number;
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

export default function CartDrawer({ isOpen, onClose }: CartDrawerProps) {
  const { user } = useUser();
  const { locale, dict } = useLocale();
  const router = useRouter();

  const isRtl = locale === 'ar';
  const localePrefix = `/${locale}`;

  const [guestCart, setGuestCart] = useState<any[]>([]);
  const [localProductsList, setLocalProductsList] = useState<any[]>([]);

  const dbCart = useQuery(api.cart.get, user ? { userId: user.id } : 'skip');
  const allProducts = useQuery(api.products.list, {});

  const updateQuantityMutation = useMutation(api.cart.updateQuantity);
  const removeMutation = useMutation(api.cart.remove);

  useEffect(() => {
    if (!user && isOpen) {
      const cartData = JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]');
      setGuestCart(cartData);
    }
  }, [user, isOpen]);

  useEffect(() => {
    if (allProducts) {
      setLocalProductsList(allProducts);
    }
  }, [allProducts]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

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
      const latestPrice = item.product.discount
        ? baseVal * (1 - item.product.discount / 100)
        : baseVal;
      return acc + latestPrice * item.quantity;
    }, 0);
  }, [cartItems]);

  const handleUpdateQuantity = async (productId: string, weight: string, newQty: number) => {
    if (user) {
      await updateQuantityMutation({
        userId: user.id,
        productId: productId as any,
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
        productId: productId as any,
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

  const PLACEHOLDER_IMAGES = {
    default: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=120&q=80',
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
            className={cn(
              'fixed top-0 bottom-0 z-50 w-full max-w-md bg-surface border shadow-raised flex flex-col font-sans',
              isRtl ? 'left-0 border-r border-l-0' : 'right-0 border-l',
            )}
            dir={isRtl ? 'rtl' : 'ltr'}
          >
            {/* Header */}
            <div className="p-6 border-b border-muted flex items-center justify-between">
              <div className="flex items-center gap-3 text-primary">
                <ShoppingCart className="w-4 h-4 text-[var(--gold)]" />
                <span className="font-display font-bold text-sm uppercase tracking-wider">{dict.cart?.basket || 'Basket'}</span>
                <span className="font-mono text-xs text-[var(--gold)] font-bold bg-[var(--gold-subtle)] px-2 py-1 rounded border border-[var(--gold-border)]">
                  {cartItems.length}
                </span>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-button bg-surface-raised border border-muted text-secondary hover:text-primary transition-colors cursor-pointer"
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
                  const finalPrice = item.product.discount
                    ? baseVal * (1 - item.product.discount / 100)
                    : baseVal;

                  const imgUrl = item.product.images[0]
                    ? (item.product.images[0].startsWith('http') ? item.product.images[0] : cloudinaryUrl(item.product.images[0], { width: 120, height: 140, crop: 'fill' }))
                    : PLACEHOLDER_IMAGES.default;

                  return (
                    <div key={`${item.productId}-${item.variantWeight}`} className="py-6 flex gap-5">
                      <div className={cn('relative w-14 h-18 rounded bg-surface-raised border border-muted overflow-hidden shrink-0')}>
                        <Image src={imgUrl} alt={locale === 'ar' ? item.product.nameAr : item.product.name} fill sizes="60px" className="object-cover" />
                      </div>

                      <div className="flex-1 flex flex-col gap-1.5">
                        <Link
                          href={`/${locale}/shop/${item.product.slug}`}
                          onClick={onClose}
                          className="font-display font-bold text-primary text-sm hover:text-[var(--gold)] transition-colors line-clamp-1"
                        >
                          {locale === 'ar' ? item.product.nameAr : item.product.name}
                        </Link>
                        <div className={cn('flex items-baseline gap-2', isRtl && 'flex-row-reverse')}>
                          <span className="font-mono text-sm font-bold text-[var(--price-current)]">
                            {formatPrice(finalPrice, locale)}
                          </span>
                          <span className="text-xs text-secondary font-mono">{item.variantWeight}</span>
                        </div>

                        <div className={cn('flex items-center gap-3 mt-2 select-none', isRtl && 'flex-row-reverse')}>
                          <div className={cn('flex items-center justify-between border border-muted bg-surface-raised rounded-button px-3 h-8', isRtl ? 'w-22 flex-row-reverse' : 'w-22')}>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.variantWeight, item.quantity - 1)}
                              className="text-secondary hover:text-primary font-bold text-3xs cursor-pointer"
                            >
                              <Minus className="w-2.5 h-2.5" />
                            </button>
                            <span className="font-mono text-3xs text-primary font-bold">{item.quantity}</span>
                            <button
                              onClick={() => handleUpdateQuantity(item.productId, item.variantWeight, item.quantity + 1)}
                              className="text-secondary hover:text-primary font-bold text-3xs cursor-pointer"
                            >
                              <Plus className="w-2.5 h-2.5" />
                            </button>
                          </div>

                          <button
                            onClick={() => handleRemoveItem(item.productId, item.variantWeight)}
                            className="text-xs text-secondary hover:text-error transition-colors cursor-pointer flex items-center gap-1"
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
                <div className="h-full flex flex-col items-center justify-center text-center py-24 px-6">
                  <div className="w-14 h-14 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-secondary mb-4">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h4 className="font-display text-primary font-bold text-sm">{dict.cart?.emptyTitle || 'Your Basket is Empty'}</h4>
                  <p className="text-sm text-secondary max-w-xs mt-2 font-light">
                    {dict.cart?.emptyDescription || 'Browse our butcher selections to begin shopping.'}
                  </p>
                  <Button onClick={() => { onClose(); router.push(`/${locale}/shop`); }} size="sm" className="mt-4 uppercase tracking-wider text-xs h-9 cursor-pointer">
                    {dict.cart?.browseCatalog || 'Browse Catalog'}
                  </Button>
                </div>
              )}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-muted bg-surface-raised/50 flex flex-col gap-5">
                <div className={cn('flex justify-between items-center text-sm font-bold', isRtl && 'flex-row-reverse')}>
                  <span className="text-primary">{dict.cart?.subtotal || 'Subtotal:'}</span>
                  <span className="font-mono text-[var(--price-current)] text-base">{formatPrice(subtotal, locale)}</span>
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
