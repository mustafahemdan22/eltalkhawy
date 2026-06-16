'use client';

import { use, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import OrderStatusTimeline, { type OrderStatusTimelineEntry } from '@/components/admin/OrderStatusTimeline';
import { MapPin, Phone, User, CreditCard, Tag, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { STARTERS } from '@/lib/constants';
import { Id } from '@/convex/_generated/dataModel';

function OrderItemName({ productId, fallbackName, locale }: { productId: Id<'products'>; fallbackName: string; locale: 'en' | 'ar' }) {
  const product = useQuery(api.products.get, { id: productId });
  if (product === undefined) return <span className="animate-pulse bg-[var(--bg-surface-raised)]/80 h-4 w-32 inline-block rounded" />;
  if (product === null) return <span>{fallbackName}</span>;
  return <span>{locale === 'ar' ? product.nameAr : product.name}</span>;
}

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
const STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

interface PageProps { params: Promise<{ id: string }> }

export default function AdminOrderDetailPage({ params }: PageProps) {
  const { id } = use(params);
  const { locale, dict } = useLocale();
  const { showToast } = useToast();
  const order = useQuery(api.orders.get, { orderId: id as never });
  const updateStatus = useMutation(api.orders.updateStatus);
  const [updating, setUpdating] = useState<OrderStatus | null>(null);

  const formatEGP = (n: number) =>
    locale === 'ar' ? `${n.toLocaleString('ar-EG')} ج.م` : `EGP ${n.toLocaleString()}`;

  const formatDate = (ms: number) =>
    new Date(ms).toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });

  const onSetStatus = async (status: OrderStatus) => {
    if (!order) return;
    setUpdating(status);
    try {
      await updateStatus({ orderId: order._id, status });
      showToast(dict.admin.orders.toast.statusUpdated, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : dict.admin.common.error, 'error');
    } finally {
      setUpdating(null);
    }
  };

  if (order === undefined) {
    return (
      <div>
        <AdminPageHeader title={dict.admin.orders.detail.title} />
        <div className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center text-sm text-[var(--text-secondary)]">
          {dict.admin.common.loading}
        </div>
      </div>
    );
  }

  if (order === null) {
    return (
      <div>
        <AdminPageHeader title={dict.admin.orders.detail.title} />
        <div className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-12 text-center text-sm text-[var(--text-secondary)]">
          {dict.admin.common.error}
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader
        title={`${dict.admin.orders.detail.title} ${order.orderNumber}`}
        back={{ href: `/${locale}/admin/orders`, label: dict.admin.orders.detail.backToOrders }}
        actions={
          <div className="flex items-center gap-2">
            <OrderStatusBadge status={order.status} size="md" />
            <span className="text-2xs text-[var(--text-secondary)] font-mono hidden sm:inline">
              {formatDate(order._creationTime)}
            </span>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT — items + status update */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Status update panel */}
          <section className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              {dict.admin.orders.detail.updateStatus}
            </h2>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => onSetStatus(s)}
                  disabled={updating !== null || s === order.status}
                  className={cn(
                    'inline-flex items-center justify-center gap-2 h-11 px-4 rounded-button text-xs font-semibold border transition-all',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
                    'disabled:cursor-not-allowed',
                    s === order.status
                      ? 'bg-[var(--gold-subtle)]/40 border-[var(--gold-border)] text-[var(--gold)] ring-1 ring-inset ring-[var(--gold-border)]'
                      : 'bg-[var(--bg-surface-raised)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:border-[var(--border-hover)]',
                    updating === s && 'opacity-60',
                  )}
                >
                  {updating === s && (
                    <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
                  )}
                  {dict.admin.orders.status[s]}
                </button>
              ))}
            </div>
          </section>

          {/* Timeline */}
          <section className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              {dict.admin.orders.detail.timeline}
            </h2>
            <OrderStatusTimeline
              current={order.status as OrderStatusTimelineEntry['status']}
              history={(order.statusHistory as OrderStatusTimelineEntry[] | undefined) ?? []}
            />
          </section>

          {/* Items */}
          <section className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              {dict.admin.orders.detail.items}
            </h2>
            <ul className="flex flex-col">
              {order.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center gap-4 py-3 border-b border-[var(--border-subtle)]/60 last:border-0"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-button bg-[var(--bg-surface-raised)] shrink-0">
                    <Package className="h-5 w-5 text-[var(--text-secondary)]" aria-hidden />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                      <OrderItemName productId={item.productId} fallbackName={item.productName} locale={locale} />
                    </p>
                    <p className="text-2xs text-[var(--text-secondary)] font-mono">
                      {item.variantWeight} · ×{item.quantity}
                    </p>
                    {item.isGrilled && (
                      <p className="text-2xs text-[var(--gold)] mt-0.5">
                        {locale === 'ar' ? '🔥 مشوي' : '🔥 Grilled'}{item.grillComment ? ` — ${item.grillComment}` : ''}
                      </p>
                    )}
                    {item.starterName && (
                      <p className="text-2xs text-[var(--gold)] mt-0.5">
                        {locale === 'ar' ? '+ مقبلات: ' : '+ Starter: '}{(() => {
                          const found = STARTERS.find((s) => s.name === item.starterName || s.nameAr === item.starterName);
                          return found ? (locale === 'ar' ? found.nameAr : found.name) : item.starterName;
                        })()}
                      </p>
                    )}
                  </div>
                  <div className="text-end shrink-0">
                    <p className="font-mono text-sm font-bold tabular-nums">{formatEGP(item.totalPrice)}</p>
                    <p className="text-2xs text-[var(--text-secondary)] font-mono">
                      {formatEGP(item.unitPrice)} {locale === 'ar' ? 'للوحدة' : 'ea'}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* RIGHT — summary + customer + delivery */}
        <div className="flex flex-col gap-6">
          <section className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              {dict.admin.orders.detail.summary}
            </h2>
            <dl className="flex flex-col gap-2 text-sm">
              <Row label={dict.admin.orders.detail.subtotal} value={formatEGP(order.subtotal)} />
              <Row label={dict.admin.orders.detail.deliveryCost} value={formatEGP(order.deliveryCost)} />
              {order.discount > 0 && (
                <Row label={dict.admin.orders.detail.discount} value={`− ${formatEGP(order.discount)}`} negative />
              )}
              {order.promoDiscount > 0 && order.promoCode && (
                <Row
                  label={`${dict.admin.orders.detail.promoDiscount} (${order.promoCode})`}
                  value={`− ${formatEGP(order.promoDiscount)}`}
                  negative
                />
              )}
              <div className="border-t border-[var(--border-subtle)] pt-2.5 mt-1.5">
                <Row
                  label={dict.admin.orders.detail.total}
                  value={formatEGP(order.total)}
                  large
                />
              </div>
            </dl>
          </section>

          <section className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              {dict.admin.orders.detail.customer}
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <User className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
                <span className="font-semibold">{order.deliveryAddress.fullName}</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
                <a href={`tel:${order.deliveryAddress.phone}`} className="font-mono hover:text-[var(--gold)]">
                  {order.deliveryAddress.phone}
                </a>
              </li>
            </ul>
          </section>

          <section className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              {dict.admin.orders.detail.delivery}
            </h2>
            <div className="flex items-start gap-2.5 text-sm">
              <MapPin className="h-4 w-4 text-[var(--text-secondary)] shrink-0 mt-0.5" aria-hidden />
              <div className="min-w-0">
                <p>{order.deliveryAddress.address}</p>
                <p className="text-2xs text-[var(--text-secondary)] mt-1">
                  {order.deliveryAddress.area}, {order.deliveryAddress.city}
                </p>
                {order.deliveryAddress.notes && (
                  <p className="mt-2 text-2xs italic text-[var(--text-secondary)] border-s-2 border-[var(--gold-border)] ps-2">
                    &ldquo;{order.deliveryAddress.notes}&rdquo;
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-5 sm:p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-[var(--text-primary)] mb-4">
              {dict.admin.orders.detail.payment}
            </h2>
            <ul className="flex flex-col gap-2.5 text-sm">
              <li className="flex items-center gap-2.5">
                <CreditCard className="h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
                <span className="font-semibold">{dict.admin.orders.payment[order.paymentMethod]}</span>
              </li>
              {order.promoCode && (
                <li className="flex items-center gap-2.5">
                  <Tag className="h-4 w-4 text-[var(--gold)]" aria-hidden />
                  <span className="font-mono text-xs text-[var(--gold)]">{order.promoCode}</span>
                </li>
              )}
            </ul>
            {order.notes && (
              <div className="mt-4 pt-4 border-t border-[var(--border-subtle)]">
                <p className="text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] mb-1">
                  {dict.admin.orders.detail.notes}
                </p>
                <p className="text-sm text-[var(--text-primary)] italic">&ldquo;{order.notes}&rdquo;</p>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}

function Row({
  label, value, large, negative,
}: { label: string; value: string; large?: boolean; negative?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <dt className="text-[var(--text-secondary)]">{label}</dt>
      <dd
        className={cn(
          'font-mono tabular-nums',
          large ? 'text-lg font-bold text-[var(--text-primary)]' : 'text-sm font-semibold',
          negative && 'text-emerald-500',
        )}
      >
        {value}
      </dd>
    </div>
  );
}
