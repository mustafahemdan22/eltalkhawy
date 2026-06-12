'use client';

import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import KpiCard from '@/components/admin/KpiCard';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import SalesChart, { type SalesChartPoint } from '@/components/admin/SalesChart';
import { Button } from '@/components/ui/Button';
import {
  ShoppingBag,
  Banknote,
  Package,
  Users,
  AlertTriangle,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Crown,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface RecentOrder {
  _id:         string;
  orderNumber: string;
  status:      'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  total:       number;
  _creationTime: number;
  deliveryAddress: { fullName: string; phone: string };
  items: Array<{ productName: string; quantity: number; unitPrice: number; totalPrice: number }>;
}

interface LowStockItem {
  _id:      string;
  slug:     string;
  name:     string;
  nameAr:   string;
  images:   string[];
  minStock: number;
}

function formatEGP(n: number, locale: 'en' | 'ar') {
  return locale === 'ar'
    ? `${n.toLocaleString('ar-EG')} ج.م`
    : `EGP ${n.toLocaleString()}`;
}

function timeAgo(ms: number, locale: 'en' | 'ar'): string {
  const seconds = Math.floor((Date.now() - ms) / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  if (locale === 'ar') {
    if (days > 0) return `منذ ${days} يوم`;
    if (hours > 0) return `منذ ${hours} ساعة`;
    if (minutes > 0) return `منذ ${minutes} دقيقة`;
    return 'الآن';
  }
  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return 'just now';
}

export default function AdminDashboardPage() {
  const { locale, dict } = useLocale();
  const stats = useQuery(api.dashboard.stats);
  const trend = useQuery(api.dashboard.salesTrend, { days: 14 });
  const topProducts = useQuery(api.dashboard.topProducts, { limit: 5 });

  const recentOrderCols: DataTableColumn<RecentOrder>[] = [
    {
      key: 'order',
      header: dict.admin.orders.table.order,
      render: (o) => (
        <Link
          href={`/${locale}/admin/orders/${o._id}`}
          className="font-mono text-xs font-bold text-[var(--gold)] hover:underline"
        >
          {o.orderNumber}
        </Link>
      ),
    },
    {
      key: 'customer',
      header: dict.admin.orders.table.customer,
      render: (o) => (
        <div>
          <p className="text-sm font-semibold text-[var(--text-primary)]">{o.deliveryAddress.fullName}</p>
          <p className="text-2xs text-[var(--text-secondary)] font-mono">{o.deliveryAddress.phone}</p>
        </div>
      ),
    },
    {
      key: 'items',
      header: dict.admin.orders.table.items,
      align: 'center',
      render: (o) => (
        <span className="font-mono text-sm tabular-nums">
          {o.items.reduce((s, i) => s + i.quantity, 0)}
        </span>
      ),
    },
    {
      key: 'total',
      header: dict.admin.orders.table.total,
      align: 'end',
      render: (o) => (
        <span className="font-mono text-sm font-bold tabular-nums">
          {formatEGP(o.total, locale)}
        </span>
      ),
    },
    {
      key: 'status',
      header: dict.admin.orders.table.status,
      render: (o) => <OrderStatusBadge status={o.status} size="sm" />,
      hideOn: 'sm',
    },
    {
      key: 'date',
      header: dict.admin.orders.table.date,
      render: (o) => (
        <span className="text-2xs text-[var(--text-secondary)] font-mono">
          {timeAgo(o._creationTime, locale)}
        </span>
      ),
      hideOn: 'md',
    },
  ];

  const lowStockCols: DataTableColumn<LowStockItem>[] = [
    {
      key: 'product',
      header: dict.admin.products.table.product,
      render: (p) => (
        <div className="flex items-center gap-3">
          {p.images[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.images[0]}
              alt=""
              className="h-9 w-9 rounded-button object-cover bg-[var(--bg-surface-raised)]"
            />
          ) : (
            <div className="h-9 w-9 rounded-button bg-[var(--bg-surface-raised)]" />
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {locale === 'ar' ? p.nameAr : p.name}
            </p>
            <p className="text-2xs text-[var(--text-secondary)] font-mono truncate">
              {p.slug}
            </p>
          </div>
        </div>
      ),
    },
    {
      key: 'stock',
      header: dict.admin.products.table.stock,
      align: 'end',
      render: (p) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-2xs font-bold uppercase tracking-wider font-mono',
            p.minStock === 0
              ? 'bg-red-500/10 text-red-500 ring-1 ring-inset ring-red-500/30'
              : 'bg-amber-500/10 text-amber-500 ring-1 ring-inset ring-amber-500/30',
          )}
        >
          {p.minStock === 0 ? (
            <XCircle className="h-3 w-3" aria-hidden />
          ) : (
            <AlertTriangle className="h-3 w-3" aria-hidden />
          )}
          {p.minStock}
        </span>
      ),
    },
    {
      key: 'action',
      header: '',
      align: 'end',
      render: (p) => (
        <Link
          href={`/${locale}/admin/products/${p._id}`}
          className="text-xs font-semibold text-[var(--gold)] hover:text-[var(--gold-hover)]"
        >
          {dict.admin.common.edit} →
        </Link>
      ),
      hideOn: 'sm',
    },
  ];

  const loading = stats === undefined;

  return (
    <div>
      <AdminPageHeader
        title={dict.admin.dashboard.title}
        subtitle={dict.admin.dashboard.subtitle}
        actions={
          <Link href={`/${locale}/admin/products/new`}>
            <Button variant="gold" size="md">
              {dict.admin.nav.addProduct}
            </Button>
          </Link>
        }
      />

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={dict.admin.dashboard.kpi.revenue}
          value={loading ? '—' : formatEGP(stats?.totalRevenue ?? 0, locale)}
          icon={<Banknote className="h-5 w-5" aria-hidden />}
          variant="gold"
          loading={loading}
        />
        <KpiCard
          label={dict.admin.dashboard.kpi.orders}
          value={loading ? '—' : (stats?.totalOrders ?? 0).toLocaleString()}
          icon={<ShoppingBag className="h-5 w-5" aria-hidden />}
          variant="blue"
          loading={loading}
        />
        <KpiCard
          label={dict.admin.dashboard.kpi.products}
          value={loading ? '—' : (stats?.totalProducts ?? 0).toLocaleString()}
          icon={<Package className="h-5 w-5" aria-hidden />}
          variant="purple"
          loading={loading}
        />
        <KpiCard
          label={dict.admin.dashboard.kpi.users}
          value={loading ? '—' : (stats?.totalUsers ?? 0).toLocaleString()}
          icon={<Users className="h-5 w-5" aria-hidden />}
          variant="green"
          loading={loading}
        />
      </div>

      {/* Secondary KPIs: status breakdown + low stock */}
      <div className="mt-4 grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label={dict.admin.dashboard.kpi.pending}
          value={loading ? '—' : (stats?.ordersByStatus.pending ?? 0)}
          icon={<Clock className="h-5 w-5" aria-hidden />}
          variant="neutral"
          loading={loading}
        />
        <KpiCard
          label={dict.admin.orders.status.processing}
          value={loading ? '—' : (stats?.ordersByStatus.processing ?? 0)}
          icon={<TrendingUp className="h-5 w-5" aria-hidden />}
          variant="neutral"
          loading={loading}
        />
        <KpiCard
          label={dict.admin.dashboard.kpi.delivered}
          value={loading ? '—' : (stats?.ordersByStatus.delivered ?? 0)}
          icon={<CheckCircle2 className="h-5 w-5" aria-hidden />}
          variant="green"
          loading={loading}
        />
        <KpiCard
          label={dict.admin.dashboard.kpi.lowStock}
          value={loading ? '—' : (stats?.lowStockCount ?? 0)}
          icon={<AlertTriangle className="h-5 w-5" aria-hidden />}
          variant="red"
          loading={loading}
        />
      </div>

      {/* Sales trend */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
            {locale === 'ar' ? 'المبيعات (آخر 14 يوم)' : 'Sales (last 14 days)'}
          </h2>
        </div>
        <SalesChart data={(trend ?? []) as SalesChartPoint[]} />
      </div>

      {/* Top products */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
            {dict.admin.dashboard.topProducts}
          </h2>
        </div>
        {topProducts === undefined ? (
          <div className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-6 text-center text-sm text-[var(--text-secondary)]">
            {dict.admin.common.loading}
          </div>
        ) : topProducts.length === 0 ? (
          <div className="rounded-card border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
            {dict.admin.dashboard.topProductsEmpty}
          </div>
        ) : (
          <ol className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] divide-y divide-[var(--border-subtle)]/60 overflow-hidden">
            {topProducts.map((p, i) => {
              const max = topProducts[0]?.quantity ?? 1;
              const pct = (p.quantity / max) * 100;
              return (
                <li key={p.productId} className="flex items-center gap-3 p-3 sm:p-4 hover:bg-[var(--bg-surface-hover)] transition-colors">
                  <span className="font-display text-lg sm:text-xl font-bold text-[var(--text-secondary)] w-7 sm:w-9 text-center font-mono">
                    {i + 1}
                  </span>
                  {p.image ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={p.image}
                      alt=""
                      className="h-11 w-11 sm:h-12 sm:w-12 rounded-button object-cover bg-[var(--bg-surface-raised)] shrink-0"
                    />
                  ) : (
                    <div className="h-11 w-11 sm:h-12 sm:w-12 rounded-button bg-[var(--bg-surface-raised)] shrink-0" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
                        {locale === 'ar' ? p.productNameAr : p.productName}
                      </p>
                      {i === 0 && (
                        <span className="inline-flex items-center gap-0.5 rounded-pill bg-[var(--gold-subtle)]/40 px-1.5 py-0.5 text-2xs font-bold uppercase tracking-wider text-[var(--gold)] ring-1 ring-inset ring-[var(--gold-border)]">
                          <Crown className="h-2.5 w-2.5" aria-hidden />
                          {dict.admin.dashboard.bestSeller}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-[var(--bg-surface-raised)] overflow-hidden" aria-hidden>
                        <div
                          className="h-full rounded-full bg-gradient-brand transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="text-2xs font-mono font-semibold text-[var(--text-secondary)] tabular-nums w-16 text-end">
                        ×{p.quantity}
                      </span>
                    </div>
                  </div>
                  <div className="text-end shrink-0 hidden sm:block">
                    <p className="font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">
                      {formatEGP(p.revenue, locale)}
                    </p>
                    <p className="text-2xs text-[var(--text-secondary)] font-mono">
                      {dict.admin.dashboard.revenue}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        )}
      </div>

      {/* Recent orders + low stock side by side */}
      <div className="mt-8 grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              {dict.admin.dashboard.recentOrders}
            </h2>
            <Link
              href={`/${locale}/admin/orders`}
              className="text-xs font-semibold text-[var(--gold)] hover:text-[var(--gold-hover)]"
            >
              {dict.admin.dashboard.viewAllOrders} →
            </Link>
          </div>
          {loading ? (
            <DataTable columns={recentOrderCols} rows={undefined} rowKey={(o) => o._id} />
          ) : (stats?.recentOrders?.length ?? 0) === 0 ? (
            <div className="rounded-card border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
              {dict.admin.dashboard.recentOrdersEmpty}
            </div>
          ) : (
            <DataTable columns={recentOrderCols} rows={stats?.recentOrders ?? []} rowKey={(o) => o._id} />
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
              {dict.admin.dashboard.lowStockList}
            </h2>
            <Link
              href={`/${locale}/admin/products`}
              className="text-xs font-semibold text-[var(--gold)] hover:text-[var(--gold-hover)]"
            >
              {dict.admin.dashboard.manageProducts} →
            </Link>
          </div>
          {loading ? (
            <DataTable columns={lowStockCols} rows={undefined} rowKey={(p) => p._id} />
          ) : (stats?.lowStockProducts?.length ?? 0) === 0 ? (
            <div className="rounded-card border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-8 text-center text-sm text-[var(--text-secondary)]">
              {dict.admin.dashboard.lowStockEmpty}
            </div>
          ) : (
            <DataTable columns={lowStockCols} rows={stats?.lowStockProducts ?? []} rowKey={(p) => p._id} />
          )}
        </div>
      </div>
    </div>
  );
}
