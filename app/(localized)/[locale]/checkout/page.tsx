'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id, Doc } from '@/convex/_generated/dataModel';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { cn, formatPrice, cloudinaryImageUrl, discountedPrice, parseWeight } from '@/lib/utils';
import { SITE_CONFIG, STARTERS } from '@/lib/constants';
import { useUser } from '@clerk/nextjs';
import { useLocale } from '@/components/LocaleProvider';
import {
  CreditCard,
  MapPin,
  Truck,
  ShieldCheck,
  ShoppingBag,
  CircleDollarSign,
  Wallet,
  CheckCircle2,
} from 'lucide-react';
import Image from 'next/image';

interface CheckoutCartItem {
  productId: string;
  variantWeight: string;
  quantity: number;
  price: number;
  isGrilled?: boolean;
  grillComment?: string;
  starterName?: string;
  starterPrice?: number;
  product: {
    _id: string;
    slug: string;
    name: string;
    nameAr: string;
    categorySlug: string;
    images: string[];
    discount: number | null;
    basePrice: number;
    variants: Array<{
      weight: string;
      price: number;
      stock: number;
    }>;
  };
}

export default function CheckoutPage() {
  const { user, isLoaded: authLoaded } = useUser();
  const { locale, dict } = useLocale();
  const router = useRouter();
  const isRtl = locale === 'ar';

  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [area, setArea] = useState('');
  const [city, setCity] = useState('Cairo');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [butcherNotes, setButcherNotes] = useState('');
  const [guestEmail, setGuestEmail] = useState('');

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'wallet'>('cash');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const [successOrder, setSuccessOrder] = useState<{
    orderId: string;
    orderNumber: string;
  } | null>(null);

  const guestCart = useMemo<Array<{
    productId: string;
    variantWeight: string;
    quantity: number;
    price: number;
  }>>(() => {
    if (typeof window !== 'undefined') {
      try { return JSON.parse(localStorage.getItem('et_guest_cart') ?? '[]') as Array<{ productId: string; variantWeight: string; quantity: number; price: number }>; } catch { return []; }

    }
    return [];
  }, []);
  const appliedPromo = useMemo<Doc<'promoCodes'> | null>(() => {
    if (typeof window !== 'undefined') {
      try {
        const p = sessionStorage.getItem('et_applied_promo');
        return p ? JSON.parse(p) : null;
      } catch { return null; }
    }
    return null;
  }, []);

  const dbCart = useQuery(api.cart.get, user ? { userId: user.id } : 'skip');
  const allProducts = useQuery(api.products.list, {});
  const createOrderMutation = useMutation(api.orders.create);

  useEffect(() => {
    if (!user) return;
    const timer = setTimeout(() => {
      setFullName(user.fullName || '');
      setPhone(user.primaryPhoneNumber?.phoneNumber || '');
      if (user.primaryEmailAddress?.emailAddress) {
        setGuestEmail(user.primaryEmailAddress.emailAddress);
      }
    }, 0);
    return () => clearTimeout(timer);
  }, [user]);

  const checkoutItems = useMemo<CheckoutCartItem[]>(() => {
    if (user) return (dbCart?.items ?? []) as unknown as CheckoutCartItem[];
    if (!allProducts || !guestCart.length) return [];
    return guestCart.map((item) => {
      const product = allProducts.find((p) => p._id === item.productId);
      return { ...item, product };
    }).filter((item) => item.product !== undefined) as CheckoutCartItem[];
  }, [user, dbCart, guestCart, allProducts]);

  useEffect(() => {
    if (authLoaded && !user) {
      router.push(`/${locale}/sign-in?redirect_url=${encodeURIComponent(`/${locale}/checkout`)}`);
    }
  }, [authLoaded, user, locale, router]);

  useEffect(() => {
    if (authLoaded && user && dbCart !== undefined && checkoutItems.length === 0 && !successOrder) {
      router.push(`/${locale}/categories`);
    }
  }, [authLoaded, user, dbCart, checkoutItems, successOrder, locale, router]);

  const totals = useMemo(() => {
    const subtotal = checkoutItems.reduce((acc, item) => {
      const variant = item.product.variants.find((v) => v.weight === item.variantWeight);
      const baseVal = variant
        ? variant.price
        : Math.round(item.product.basePrice * (parseWeight(item.variantWeight) / 1000));
      const rawPrice = item.product.discount ? discountedPrice(baseVal, item.product.discount) : baseVal;
      const grillFee = item.isGrilled ? 50 : 0;
      const starterFee = item.starterPrice ?? 0;
      const latestPrice = rawPrice + grillFee + starterFee;
      return acc + latestPrice * item.quantity;
    }, 0);
    const deliveryCost = subtotal >= SITE_CONFIG.deliveryMin || subtotal === 0 ? 0 : SITE_CONFIG.deliveryCost;
    let promoDiscount = 0;
    if (appliedPromo) {
      promoDiscount = appliedPromo.discountType === 'percentage'
        ? subtotal * (appliedPromo.discountValue / 100)
        : appliedPromo.discountValue;
    }
    const vat = subtotal * SITE_CONFIG.vatRate;
    const total = Math.max(0, subtotal + deliveryCost - promoDiscount + vat);
    return { subtotal, deliveryCost, promoDiscount, vat, total };
  }, [checkoutItems, appliedPromo]);

  const validateForm = () => {
    const errors: Record<string, string> = {};
    if (!fullName.trim()) errors.fullName = `${dict.checkout?.fullName || 'Full Name'} ${dict.checkout?.required || 'is required'}`;
    if (!phone.trim()) errors.phone = `${dict.checkout?.phone || 'Phone'} ${dict.checkout?.required || 'is required'}`;
    if (!address.trim()) errors.address = `${dict.checkout?.address || 'Address'} ${dict.checkout?.required || 'is required'}`;
    if (!area.trim()) errors.area = `${dict.checkout?.area || 'Area'} ${dict.checkout?.required || 'is required'}`;
    if (!user && !guestEmail.trim()) {
      errors.guestEmail = dict.checkout?.emailRequired || 'Email is required';
    } else if (!user && guestEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guestEmail)) {
      errors.guestEmail = dict.checkout?.invalidEmail || 'Invalid email';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      alert(locale === 'ar' ? 'يرجى تسجيل الدخول للمتابعة وإتمام عملية الشراء.' : 'Please sign in to continue with your purchase.');
      router.push(`/${locale}/sign-in?redirect_url=${encodeURIComponent(`/${locale}/checkout`)}`);
      return;
    }
    if (!validateForm() || isSubmitting) return;
    try {
      setIsSubmitting(true);
      const orderItems = checkoutItems.map((item) => {
        const variant = item.product.variants.find((v) => v.weight === item.variantWeight);
        const baseVal = variant ? variant.price : item.price;
        const rawPrice = item.product.discount ? discountedPrice(baseVal, item.product.discount) : baseVal;
        const grillFee = item.isGrilled ? 50 : 0;
        const starterFee = item.starterPrice ?? 0;
        const unitPrice = rawPrice + grillFee + starterFee;
        return {
          productId: item.product._id as Id<'products'>,
          productName: item.product.name,
          variantWeight: item.variantWeight,
          quantity: item.quantity,
          unitPrice,
          totalPrice: unitPrice * item.quantity,
          isGrilled: item.isGrilled,
          grillComment: item.grillComment,
          starterName: item.starterName,
          starterPrice: item.starterPrice,
        };
      });
      const response = await createOrderMutation({
        userId: user ? user.id : null,
        guestEmail: user ? null : guestEmail.trim(),
        items: orderItems,
        deliveryAddress: {
          fullName: fullName.trim(),
          phone: phone.trim(),
          address: address.trim(),
          area: area.trim(),
          city: city.trim(),
          notes: deliveryNotes.trim() || null,
        },
        subtotal: totals.subtotal,
        deliveryCost: totals.deliveryCost,
        discount: 0,
        promoDiscount: totals.promoDiscount,
        total: totals.total,
        promoCode: appliedPromo ? appliedPromo.code : null,
        paymentMethod,
        notes: butcherNotes.trim() || null,
      });
      if (!user) localStorage.setItem('et_guest_cart', '[]');
      sessionStorage.removeItem('et_applied_promo');
      setSuccessOrder(response);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ── Success Screen ── */
  if (successOrder) {
    return (
      <div className="min-h-screen bg-base flex flex-col">
        <Navbar />
        <main id="main-content" className="flex-grow flex items-center justify-center py-16 px-4">
          <div className="max-w-md w-full p-10 rounded-2xl bg-surface border border-muted text-center shadow-raised relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="absolute top-0 right-0 w-[200px] h-[200px] bg-[var(--success)]/2 blur-[80px] rounded-full pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-success-bg border border-success-border flex items-center justify-center text-success mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-3">
              {dict.checkout?.successSubtitle || 'Order Confirmed'}
            </span>
            <h1 className="font-display text-2xl font-bold text-primary mb-3">
              {dict.checkout?.successTitle || 'Order Placed!'}
            </h1>
            <p className="text-sm text-secondary font-normal leading-relaxed max-w-sm mx-auto mb-8">
              {dict.checkout?.successDescription || 'Your order is being prepared.'}
            </p>
            <div className={cn("bg-surface-raised/80 border border-muted rounded-xl p-5 text-sm mb-8 space-y-2.5 font-mono", isRtl ? "text-right" : "text-left")}>
              <div className={cn('flex justify-between', isRtl && 'flex-row-reverse')}>
                <span className="text-secondary">{dict.checkout?.orderId || 'Order ID'}:</span>
                <span className="font-bold text-[var(--gold)]">{successOrder.orderNumber}</span>
              </div>
              <div className={cn('flex justify-between', isRtl && 'flex-row-reverse')}>
                <span className="text-secondary">{dict.checkout?.grandTotalPaid || 'Total'}:</span>
                <span className="font-bold text-primary">{formatPrice(totals.total, locale)}</span>
              </div>
              <div className={cn('flex justify-between', isRtl && 'flex-row-reverse')}>
                <span className="text-secondary">{dict.checkout?.payment || 'Payment'}:</span>
                <span className="font-bold text-primary">
                  {(() => {
                    if (paymentMethod === 'cash') return locale === 'ar' ? 'الدفع عند الاستلام' : (dict.checkout?.cash || 'Cash on Delivery');
                    if (paymentMethod === 'card') return locale === 'ar' ? 'بطاقة ائتمان' : (dict.checkout?.card || 'Card');
                    return locale === 'ar' ? 'محفظة إلكترونية' : (dict.checkout?.wallet || 'Wallet');
                  })()}
                </span>
              </div>
              <div className={cn('flex justify-between', isRtl && 'flex-row-reverse')}>
                <span className="text-secondary">{dict.checkout?.estDelivery || 'Delivery'}:</span>
                <span className="font-bold text-success">{dict.checkout?.estDeliveryValue || 'Today'}</span>
              </div>
            </div>
            <div className="flex flex-col gap-4">
              <Button onClick={() => router.push(`/${locale}/categories`)} fullWidth className="uppercase tracking-wider text-2xs font-semibold h-11 cursor-pointer">
                {dict.checkout?.backToCatalog || 'Back to Catalog'}
              </Button>
              {user && (
                <button onClick={() => router.push(`/${locale}/account`)}
                  className="h-11 px-5 rounded-button text-2xs font-semibold border border-muted text-secondary hover:text-primary hover:border-muted transition-all uppercase tracking-wider cursor-pointer">
                  {dict.checkout?.trackOrder || 'Track Order'}
                </button>
              )}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const isLoading = authLoaded === false || (user && dbCart === undefined) || allProducts === undefined;

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-base py-14 md:py-20">
        <div className="container-brand">
          <div className="text-center mb-14">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
              {dict.checkout?.secureCheckout || 'Secure Checkout'}
            </span>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-primary flex items-center justify-center gap-4">
              <CreditCard className="w-6 h-6 text-[var(--gold)]" />
              {dict.checkout?.pageTitle || 'Checkout'}
            </h1>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
            </div>
          ) : (
            <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
              <div className="lg:col-span-7 flex flex-col gap-6">
                {/* Delivery Info */}
                <div className="p-7 rounded-2xl bg-surface border border-muted flex flex-col gap-6">
                  <h2 className="font-display text-primary font-bold text-base border-b border-muted pb-4 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[var(--gold)]" />
                    {dict.checkout?.deliveryInfo || 'Delivery Info'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="fullName" className="text-3xs uppercase tracking-wider text-secondary font-semibold">{dict.checkout?.fullName || 'Full Name'}</label>
                      <input id="fullName" type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
                        className={cn('h-11 px-5 rounded-button text-sm bg-surface-raised border', formErrors.fullName ? 'border-error-border' : 'border-muted', 'text-primary focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all')} />
                      {formErrors.fullName && <p className="text-3xs text-error mt-0.5">{formErrors.fullName}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="phone" className="text-3xs uppercase tracking-wider text-secondary font-semibold">{dict.checkout?.phone || 'Phone'}</label>
                      <input id="phone" type="tel" required value={phone} onChange={(e) => setPhone(e.target.value)}
                        placeholder={dict.checkout?.phonePlaceholder || 'Phone'} className={cn('h-11 px-5 rounded-button text-sm bg-surface-raised border', formErrors.phone ? 'border-error-border' : 'border-muted', 'text-primary focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all')} />
                      {formErrors.phone && <p className="text-3xs text-error mt-0.5">{formErrors.phone}</p>}
                    </div>
                  </div>

                  {!user && (
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="guestEmail" className="text-3xs uppercase tracking-wider text-secondary font-semibold">{dict.checkout?.guestEmail || 'Email'} ({dict.checkout?.guestEmailDesc || 'receipt'})</label>
                      <input id="guestEmail" type="email" required value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)}
                        className={cn('h-11 px-5 rounded-button text-sm bg-surface-raised border', formErrors.guestEmail ? 'border-error-border' : 'border-muted', 'text-primary focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all')} />
                      {formErrors.guestEmail && <p className="text-3xs text-error mt-0.5">{formErrors.guestEmail}</p>}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="area" className="text-3xs uppercase tracking-wider text-secondary font-semibold">{dict.checkout?.area || 'Area'}</label>
                      <input id="area" type="text" required value={area} placeholder={dict.checkout?.areaPlaceholder || 'Area'} onChange={(e) => setArea(e.target.value)}
                        className={cn('h-11 px-5 rounded-button text-sm bg-surface-raised border', formErrors.area ? 'border-error-border' : 'border-muted', 'text-primary focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all')} />
                      {formErrors.area && <p className="text-3xs text-error mt-0.5">{formErrors.area}</p>}
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="city" className="text-3xs uppercase tracking-wider text-secondary font-semibold">{dict.checkout?.city || 'City'}</label>
                      <select id="city" value={city} onChange={(e) => setCity(e.target.value)}
                        className="h-11 px-5 rounded-button text-sm bg-surface-raised border border-muted text-primary focus:outline-none focus:border-[var(--gold)] transition-all">
                        <option value="Cairo">{locale === 'ar' ? 'القاهرة' : 'Cairo'}</option>
                        <option value="Giza">{locale === 'ar' ? 'الجيزة' : 'Giza'}</option>
                        <option value="Alexandria">{locale === 'ar' ? 'الإسكندرية' : 'Alexandria'}</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="address" className="text-3xs uppercase tracking-wider text-secondary font-semibold">{dict.checkout?.address || 'Address'}</label>
                    <input id="address" type="text" required value={address} onChange={(e) => setAddress(e.target.value)}
                      className={cn('h-11 px-5 rounded-button text-sm bg-surface-raised border', formErrors.address ? 'border-error-border' : 'border-muted', 'text-primary focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all')} />
                    {formErrors.address && <p className="text-3xs text-error mt-0.5">{formErrors.address}</p>}
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="butcherNotes" className="text-3xs uppercase tracking-wider text-secondary font-semibold">{dict.checkout?.butcherNotes || 'Butcher Notes'}</label>
                    <textarea id="butcherNotes" rows={3} value={butcherNotes} onChange={(e) => setButcherNotes(e.target.value)}
                      placeholder={dict.checkout?.butcherNotesPlaceholder || 'Butcher instructions...'}
                      className="w-full p-4 rounded-button text-sm bg-surface-raised border border-muted text-primary placeholder:text-muted focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all resize-none" />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label htmlFor="deliveryNotes" className="text-3xs uppercase tracking-wider text-secondary font-semibold">{dict.checkout?.deliveryNotes || 'Delivery Notes'}</label>
                    <textarea id="deliveryNotes" rows={2} value={deliveryNotes} onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder={dict.checkout?.deliveryNotesPlaceholder || 'Delivery instructions...'}
                      className="w-full p-4 rounded-button text-sm bg-surface-raised border border-muted text-primary placeholder:text-muted focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all resize-none" />
                  </div>
                </div>

                {/* Payment */}
                <div className="p-7 rounded-2xl bg-surface border border-muted flex flex-col gap-6">
                  <h2 className="font-display text-primary font-bold text-base border-b border-muted pb-4 flex items-center gap-2">
                    <CircleDollarSign className="w-4 h-4 text-[var(--gold)]" />
                    {dict.checkout?.paymentMethod || 'Payment'}
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      { id: 'cash' as const, label: locale === 'ar' ? 'الدفع عند الاستلام' : (dict.checkout?.cash || 'Cash'), icon: CircleDollarSign },
                      { id: 'card' as const, label: locale === 'ar' ? 'بطاقة ائتمان' : (dict.checkout?.card || 'Card'), icon: CreditCard },
                      { id: 'wallet' as const, label: locale === 'ar' ? 'محفظة إلكترونية' : (dict.checkout?.wallet || 'Wallet'), icon: Wallet },
                    ].map((method) => {
                      const Icon = method.icon;
                      return (
                        <button key={method.id} type="button" onClick={() => setPaymentMethod(method.id)}
                          className={cn('p-5 rounded-xl border flex flex-col items-center text-center gap-4 transition-all duration-350 cursor-pointer',
                            paymentMethod === method.id ? 'border-[var(--gold)] bg-[var(--gold-subtle)] text-[var(--gold)] shadow-gold' : 'border-muted bg-surface-raised/40 text-secondary hover:border-muted hover:text-primary')}>
                          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0 border',
                            paymentMethod === method.id ? 'border-[var(--gold)] bg-[var(--gold-subtle)]' : 'border-muted bg-surface-raised')}>
                            <Icon className="w-4 h-4 text-[var(--gold)]" />
                          </div>
                          <div>
                            <span className="text-sm font-semibold block">{method.label}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                <div className="p-7 rounded-2xl bg-surface border border-muted flex flex-col gap-5">
                  <h2 className="font-display text-primary font-bold text-base border-b border-muted pb-4 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-[var(--gold)]" />
                    {dict.checkout?.yourOrder || 'Your Order'}
                  </h2>
                  <div className="divide-y divide-muted/40 max-h-60 overflow-y-auto no-scrollbar pr-1">
                    {checkoutItems.map((item) => {
                      const variant = item.product.variants.find((v) => v.weight === item.variantWeight);
                      const basePrice = variant ? variant.price : item.price;
                      const rawPrice = item.product.discount ? discountedPrice(basePrice, item.product.discount) : basePrice;
                      const grillFee = item.isGrilled ? 50 : 0;
                      const starterFee = item.starterPrice ?? 0;
                      const unitPrice = rawPrice + grillFee + starterFee;
                      const imgUrl = item.product.images[0]
                        ? cloudinaryImageUrl(item.product.images[0], { width: 120, height: 140, crop: 'fill', gravity: 'auto' })
                        : cloudinaryImageUrl('eltalkhawy/categories/beef/products/beef-chuck-cubes/1', { width: 120, height: 140, crop: 'fill', gravity: 'auto' });

                      return (
                        <div key={`${item.productId}-${item.variantWeight}-${item.isGrilled ? 'grill' : 'raw'}-${item.starterName || ''}`} className={cn('py-4 flex items-center justify-between gap-5', isRtl && 'flex-row-reverse')}>
                          <div className={cn('flex items-center gap-4', isRtl && 'flex-row-reverse')}>
                            <div className="relative w-10 h-12 rounded bg-surface-raised border border-muted overflow-hidden shrink-0">
                              <Image src={imgUrl} alt={locale === 'ar' ? item.product.nameAr : item.product.name} fill sizes="60px" className="object-cover" />
                            </div>
                            <div className={isRtl ? 'text-right' : ''}>
                              <span className="text-sm font-semibold text-primary block line-clamp-1">{locale === 'ar' ? item.product.nameAr : item.product.name}</span>
                              <span className="text-3xs text-muted block font-mono mt-0.5">{item.variantWeight} × {item.quantity}</span>
                              {item.isGrilled && (
                                <span className="text-3xs text-[var(--gold)] block font-medium">🔥 {locale === 'ar' ? 'تسوية وشوي (+٥٠ ج.م)' : 'Grill Prep (+EGP 50)'}</span>
                              )}
                              {item.starterName && (
                                <span className="text-3xs text-[var(--gold)] block font-medium">🍲 {(() => {
                                  const starterObj = STARTERS.find(s => s.name === item.starterName || s.nameAr === item.starterName || s.id === item.starterName);
                                  return starterObj ? (locale === 'ar' ? starterObj.nameAr : starterObj.name) : item.starterName;
                                })()} (+{formatPrice(item.starterPrice ?? 0, locale)})</span>
                              )}
                            </div>
                          </div>
                          <span className="font-mono text-sm font-bold text-[var(--gold)] shrink-0">{formatPrice(unitPrice * item.quantity, locale)}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-7 rounded-2xl bg-surface border border-muted flex flex-col gap-6">
                  <h2 className="font-display text-primary font-bold text-base border-b border-muted pb-4">{dict.checkout?.billingDetails || 'Billing'}</h2>
                  <div className="space-y-4 text-sm divide-y divide-muted/40">
                    <div className={cn('flex justify-between pb-3', isRtl && 'flex-row-reverse')}>
                      <span className="text-secondary">{dict.checkout?.subtotal || 'Subtotal'}</span>
                      <span className="font-mono font-bold text-primary">{formatPrice(totals.subtotal, locale)}</span>
                    </div>
                    <div className={cn('flex justify-between pt-3 pb-3', isRtl && 'flex-row-reverse')}>
                      <span className="text-secondary">{dict.checkout?.delivery || 'Delivery'}</span>
                      {totals.deliveryCost === 0 ? (
                        <span className="text-success uppercase font-semibold">{dict.checkout?.freeDelivery || 'Free'}</span>
                      ) : (
                        <span className="font-mono font-bold text-primary">{formatPrice(totals.deliveryCost, locale)}</span>
                      )}
                    </div>
                    {totals.promoDiscount > 0 && (
                      <div className={cn('flex justify-between pt-3 pb-3 text-[var(--gold)] font-medium', isRtl && 'flex-row-reverse')}>
                        <span>{dict.checkout?.couponSavings || 'Savings'} ({appliedPromo!.code})</span>
                        <span className="font-mono font-bold">−{formatPrice(totals.promoDiscount, locale)}</span>
                      </div>
                    )}
                    <div className={cn('flex justify-between pt-3 pb-3', isRtl && 'flex-row-reverse')}>
                      <span className="text-secondary">{dict.checkout?.vat || 'VAT'}</span>
                      <span className="font-mono font-semibold text-muted">{formatPrice(totals.vat, locale)}</span>
                    </div>
                    <div className={cn('flex justify-between pt-4 text-sm font-bold border-t border-muted', isRtl && 'flex-row-reverse')}>
                      <span className="text-primary">{dict.checkout?.grandTotal || 'Total'}</span>
                      <span className="font-mono text-base text-[var(--gold)] font-bold">{formatPrice(totals.total, locale)}</span>
                    </div>
                  </div>

                  <Button type="submit" disabled={isSubmitting || checkoutItems.length === 0} loading={isSubmitting} fullWidth className="h-12 text-sm tracking-wider uppercase font-semibold mt-3 cursor-pointer">
                    {dict.checkout?.placeOrder || 'Place Order'}
                  </Button>

                  <div className={cn('pt-2 flex flex-col gap-4 border-t border-muted text-xs uppercase tracking-widest text-secondary font-semibold')}>
                    <div className={cn('flex items-center gap-4', isRtl && 'flex-row-reverse')}>
                      <Truck className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      <span>{dict.checkout?.deliveryEstimate || 'Delivery 2-3 hours'}</span>
                    </div>
                    <div className={cn('flex items-center gap-4', isRtl && 'flex-row-reverse')}>
                      <ShieldCheck className="w-4 h-4 text-[var(--gold)] shrink-0" />
                      <span>{dict.checkout?.coldChain || 'Cold chain logistics'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
