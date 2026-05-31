'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { cn, formatPrice } from '@/lib/utils';
import { ORDER_STATUS } from '@/lib/constants';
import { useUser, SignOutButton } from '@clerk/nextjs';
import { useLocale } from '@/components/LocaleProvider';
import {
  User,
  ShoppingBag,
  Clock,
  Mail,
  Phone,
  Calendar,
  Package,
  ChevronDown,
  ChevronUp,
  ArrowRight,
} from 'lucide-react';
import Image from 'next/image';

export default function AccountPage() {
  const { user, isLoaded: authLoaded } = useUser();
  const { locale, dict } = useLocale();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'orders' | 'profile'>('orders');
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  const orders = useQuery(
    api.orders.listUserOrders,
    user ? { userId: user.id } : 'skip'
  );

  const isLoading = authLoaded === false || (user && orders === undefined);

  const formatDate = (ts: number) => {
    return new Date(ts).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-base py-14 md:py-20">
        <div className="container-brand">

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-10 h-10 border-2 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
            </div>
          ) : !user ? (
            <div className="flex flex-col items-center justify-center text-center py-20 px-4 rounded-2xl bg-surface border border-muted max-w-md mx-auto">
              <div className="w-16 h-16 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-secondary mb-5">
                <User className="w-7 h-7 text-[var(--gold)]" />
              </div>
              <h3 className="font-display text-lg font-bold text-primary">{dict.account?.signInTitle}</h3>
              <p className="text-sm text-secondary max-w-xs mt-2 font-light">
                {dict.account?.signInDescription}
              </p>
              <Button
                onClick={() => router.push('/sign-in')}
                className="mt-6 h-11 px-7 uppercase tracking-wider text-sm cursor-pointer"
              >
                {dict.account?.signInButton}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 xl:gap-12 items-start">

              {/* Sidebar */}
              <div className="lg:col-span-4 flex flex-col gap-6 w-full">
                <div className="p-8 rounded-2xl bg-surface border border-muted text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-brand" />

                  <div className="relative w-20 h-20 rounded-full overflow-hidden bg-surface-raised border-2 border-[var(--gold)]/30 mx-auto mb-5">
                    {user.imageUrl ? (
                      <Image
                        src={user.imageUrl}
                        alt={user.fullName || 'User avatar'}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <User className="w-10 h-10 text-[var(--gold)] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                    )}
                  </div>

                  <h2 className="font-display text-primary font-bold text-lg leading-tight">
                    {user.fullName || 'Customer'}
                  </h2>

                  <div className="mt-8 pt-6 border-t border-muted flex flex-col gap-4">
                    <button
                      onClick={() => setActiveTab('orders')}
                      className={cn(
                        'w-full h-11 rounded-button text-sm font-semibold uppercase tracking-wider border flex items-center justify-center gap-2 cursor-pointer transition-all',
                        activeTab === 'orders'
                          ? 'border-[var(--gold)]/20 bg-[var(--gold-subtle)] text-[var(--gold)] font-bold'
                          : 'border-muted bg-surface-raised/40 text-secondary hover:text-primary hover:border-muted'
                      )}
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      {dict.account?.ordersTab}
                    </button>
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={cn(
                        'w-full h-11 rounded-button text-sm font-semibold uppercase tracking-wider border flex items-center justify-center gap-2 cursor-pointer transition-all',
                        activeTab === 'profile'
                          ? 'border-[var(--gold)]/20 bg-[var(--gold-subtle)] text-[var(--gold)] font-bold'
                          : 'border-muted bg-surface-raised/40 text-secondary hover:text-primary hover:border-muted'
                      )}
                    >
                      <User className="w-3.5 h-3.5" />
                      {dict.account?.profileTab}
                    </button>

                    <SignOutButton>
                      <button className="w-full h-11 rounded-button text-sm font-semibold uppercase tracking-wider border border-muted bg-surface-raised/20 text-secondary hover:text-error hover:border-error-border transition-all cursor-pointer mt-4">
                        {dict.account?.signOut}
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="lg:col-span-8 w-full flex flex-col gap-6">

                {/* ── Orders Tab ── */}
                {activeTab === 'orders' && (
                  <div className="p-7 rounded-2xl bg-surface border border-muted flex flex-col gap-6">
                    <h3 className="font-display text-primary font-bold text-lg border-b border-muted pb-4 flex items-center gap-2">
                      <Clock className="w-5 h-5 text-[var(--gold)]" />
                      {dict.account?.ordersTab}
                    </h3>

                    {orders && orders.length > 0 ? (
                      <div className="space-y-6">
                        {orders.map((order) => {
                          const statusConfig = ORDER_STATUS[order.status as keyof typeof ORDER_STATUS] || ORDER_STATUS.pending;
                          const date = formatDate(order._creationTime);
                          const isExpanded = expandedOrder === order._id;

                          const statusColors: Record<string, string> = {
                            success: 'bg-success-bg text-success border border-success-border',
                            warning: 'bg-warning-bg text-warning border border-warning-border',
                            frozen:  'bg-sky-500/10 text-sky-400 border border-sky-500/20',
                            fresh:   'bg-fresh-bg text-fresh border border-fresh-border',
                            error:   'bg-error-bg text-error border border-error-border',
                          };

                          return (
                            <div key={order._id} className="border border-muted bg-surface-raised/20 rounded-xl overflow-hidden">
                              {/* Order Header (always visible) */}
                              <button
                                onClick={() => setExpandedOrder(isExpanded ? null : order._id)}
                                className="w-full cursor-pointer text-left"
                              >
                                <div className="bg-surface-raised/40 p-5 border-b border-muted flex flex-wrap items-center justify-between gap-4 text-sm">
                                  <div className="space-y-1">
                                    <span className="text-xs text-secondary block font-medium">{dict.account?.orderNumber}</span>
                                    <span className="font-bold text-[var(--gold)] font-mono">{order.orderNumber}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-xs text-secondary block font-medium">{dict.account?.dateOrdered}</span>
                                    <span className="font-semibold text-primary">{date}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-xs text-secondary block font-medium">{dict.account?.totalCost}</span>
                                    <span className="font-bold text-primary font-mono">{formatPrice(order.total, locale)}</span>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-xs text-secondary block font-medium">{dict.account?.statusLog}</span>
                                    <span className={cn(
                                      'inline-block px-2.5 py-0.5 rounded-full text-2xs font-semibold tracking-wide uppercase',
                                      statusColors[statusConfig.color],
                                    )}>
                                      {locale === 'ar' ? statusConfig.labelAr : statusConfig.label}
                                    </span>
                                  </div>
                                  <div className="text-secondary shrink-0">
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </div>
                                </div>
                              </button>

                              {/* Expanded Order Items */}
                              {isExpanded && (
                                <div className="divide-y divide-muted/40 animate-in fade-in slide-in-from-top-1 duration-200">
                                  {/* Column headers */}
                                  <div className="px-5 py-3 flex items-center gap-4 text-xs font-semibold text-secondary uppercase tracking-wider">
                                    <span className="flex-1">{dict.account?.item}</span>
                                    <span className="w-16 text-center">{dict.account?.qty}</span>
                                    <span className="w-24 text-right">{dict.account?.price}</span>
                                  </div>
                                  {order.items.map((item, idx) => (
                                    <div key={idx} className="px-5 py-4 flex items-center gap-4 text-sm">
                                      <div className="flex items-center gap-3 flex-1 min-w-0">
                                        <Package className="w-4 h-4 text-[var(--gold)]/60 shrink-0" />
                                        <div className="min-w-0">
                                          <span className="font-semibold text-primary block truncate">{item.productName}</span>
                                          <span className="text-xs text-muted">{item.variantWeight}</span>
                                        </div>
                                      </div>
                                      <span className="w-16 text-center text-secondary font-mono">×{item.quantity}</span>
                                      <span className="w-24 text-right font-mono text-primary font-semibold">{formatPrice(item.totalPrice, locale)}</span>
                                    </div>
                                  ))}
                                  {/* Order Summary */}
                                  <div className="px-5 py-4 bg-surface-raised/30 space-y-1.5 text-sm border-t border-muted/60">
                                    <div className="flex justify-between text-secondary">
                                      <span>{dict.account?.totalCost}</span>
                                      <span className="font-mono text-primary font-semibold">{formatPrice(order.total, locale)}</span>
                                    </div>
                                    {order.discount > 0 && (
                                      <div className="flex justify-between text-success">
                                        <span>{dict.shop?.badges?.bestSeller || 'Discount'}</span>
                                        <span className="font-mono">-{formatPrice(order.discount, locale)}</span>
                                      </div>
                                    )}
                                    <div className="flex justify-between text-secondary text-xs">
                                      <span>{dict.account?.dateOrdered}</span>
                                      <span>{date}</span>
                                    </div>
                                    <div className="flex justify-between text-xs">
                                      <Link
                                        href={`/shop/${order.items[0]?.productId}`}
                                        className="text-[var(--gold)] hover:text-[var(--gold-hover)] inline-flex items-center gap-1 transition-colors"
                                      >
                                        {dict.shop?.addToCart || 'Reorder'} <ArrowRight className="w-3 h-3" />
                                      </Link>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="py-16 text-center border border-dashed border-muted rounded-xl flex flex-col items-center gap-4">
                        <div className="w-12 h-12 rounded-full bg-surface-raised border border-muted flex items-center justify-center">
                          <Package className="w-5 h-5 text-secondary" />
                        </div>
                        <p className="text-sm text-secondary font-light">{dict.account?.noOrdersDescription}</p>
                        <Button onClick={() => router.push('/shop')} className="uppercase tracking-wider text-sm h-11">
                          {dict.account?.shopNow}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {/* ── Profile Tab ── */}
                {activeTab === 'profile' && (
                  <div className="p-7 rounded-2xl bg-surface border border-muted flex flex-col gap-6">
                    <h3 className="font-display text-primary font-bold text-lg border-b border-muted pb-4 flex items-center gap-2">
                      <User className="w-5 h-5 text-[var(--gold)]" />
                      {dict.account?.profileTitle}
                    </h3>

                    <div className="space-y-4">
                      {/* Name */}
                      <div className="flex items-start gap-5 p-5 rounded-xl bg-surface-raised/30 border border-muted">
                        <div className="w-10 h-10 rounded-full bg-surface-raised border border-muted flex items-center justify-center shrink-0">
                          <User className="w-4 h-4 text-[var(--gold)]" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-2xs uppercase tracking-wider text-secondary block font-semibold">{dict.account?.fullName}</span>
                          <span className="text-sm font-semibold text-primary">{user.fullName || dict.account?.notProvided || 'Not provided'}</span>
                        </div>
                      </div>

                      {/* Email */}
                      <div className="flex items-start gap-5 p-5 rounded-xl bg-surface-raised/30 border border-muted">
                        <div className="w-10 h-10 rounded-full bg-surface-raised border border-muted flex items-center justify-center shrink-0">
                          <Mail className="w-4 h-4 text-[var(--gold)]" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-2xs uppercase tracking-wider text-secondary block font-semibold">{dict.account?.email}</span>
                          <span className="text-sm font-semibold text-primary">{user.primaryEmailAddress?.emailAddress || dict.account?.notProvided || 'Not provided'}</span>
                        </div>
                      </div>

                      {/* Phone */}
                      {user.primaryPhoneNumber && (
                        <div className="flex items-start gap-5 p-5 rounded-xl bg-surface-raised/30 border border-muted">
                          <div className="w-10 h-10 rounded-full bg-surface-raised border border-muted flex items-center justify-center shrink-0">
                            <Phone className="w-4 h-4 text-[var(--gold)]" />
                          </div>
                          <div className="space-y-0.5">
                            <span className="text-2xs uppercase tracking-wider text-secondary block font-semibold">{dict.account?.phone}</span>
                            <span className="text-sm font-semibold text-primary">{user.primaryPhoneNumber.phoneNumber}</span>
                          </div>
                        </div>
                      )}

                      {/* Member Since */}
                      <div className="flex items-start gap-5 p-5 rounded-xl bg-surface-raised/30 border border-muted">
                        <div className="w-10 h-10 rounded-full bg-surface-raised border border-muted flex items-center justify-center shrink-0">
                          <Calendar className="w-4 h-4 text-[var(--gold)]" />
                        </div>
                        <div className="space-y-0.5">
                          <span className="text-2xs uppercase tracking-wider text-secondary block font-semibold">{dict.account?.memberSince}</span>
                          <span className="text-sm font-semibold text-primary">
                            {new Date(user.createdAt!).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-EG', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

        </div>
      </main>

      <Footer />
    </>
  );
}
