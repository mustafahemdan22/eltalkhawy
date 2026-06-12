'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable';
import { FormInput } from '@/components/admin/FormInput';
import { FormSelect } from '@/components/admin/FormSelect';
import { Button } from '@/components/ui/Button';
import OrderStatusBadge from '@/components/admin/OrderStatusBadge';
import EmptyState from '@/components/admin/EmptyState';
import { Search, ShoppingBag, Eye, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toCsv, downloadCsv } from '@/lib/csv';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

interface OrderRow {
  _id:         string;
  orderNumber: string;
  status:      OrderStatus;
  total:       number;
  subtotal:    number;
  deliveryCost:number;
  discount:    number;
  promoCode:   string | null;
  _creationTime: number;
  paymentMethod: 'cash' | 'card' | 'wallet';
  deliveryAddress: { fullName: string; phone: string; address: string; area: string; city: string };
  items:       Array<{ productName: string; quantity: number; totalPrice: number }>;
}

export default function AdminOrdersPage() {
  const { locale, dict } = useLocale();
  const router = useRouter();
  const orders = useQuery(api.orders.listAll);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | OrderStatus>('');

  const filtered = useMemo(() => {
    if (!orders) return undefined;
    const q = search.trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter && o.status !== statusFilter) return false;
      if (q) {
        const hit =
          o.orderNumber.toLowerCase().includes(q) ||
          o.deliveryAddress.fullName.toLowerCase().includes(q) ||
          o.deliveryAddress.phone.toLowerCase().includes(q);
        if (!hit) return false;
      }
      return true;
    });
  }, [orders, search, statusFilter]);

  const formatDate = (ms: number) => {
    const d = new Date(ms);
    return d.toLocaleString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
    });
  };

  const formatEGP = (n: number) =>
    locale === 'ar' ? `${n.toLocaleString('ar-EG')} ج.م` : `EGP ${n.toLocaleString()}`;

  const columns: DataTableColumn<OrderRow>[] = [
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
      hideOn: 'sm',
    },
    {
      key: 'payment',
      header: dict.admin.orders.detail.payment,
      render: (o) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-pill px-2 py-0.5 text-2xs font-bold uppercase tracking-wider',
            'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]',
          )}
        >
          {dict.admin.orders.payment[o.paymentMethod]}
        </span>
      ),
      hideOn: 'md',
    },
    {
      key: 'total',
      header: dict.admin.orders.table.total,
      align: 'end',
      render: (o) => (
        <span className="font-mono text-sm font-bold tabular-nums">{formatEGP(o.total)}</span>
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
          {formatDate(o._creationTime)}
        </span>
      ),
      hideOn: 'lg',
    },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (o) => (
        <Link
          href={`/${locale}/admin/orders/${o._id}`}
          className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-button text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
        >
          <Eye className="h-3.5 w-3.5" aria-hidden />
        </Link>
      ),
    },
  ];

  const isEmpty = orders && orders.length === 0 && filtered && filtered.length === 0 && !search && !statusFilter;

  const onExport = () => {
    if (!filtered || filtered.length === 0) return;
    const csv = toCsv(filtered as unknown as Record<string, unknown>[], [
      { key: 'orderNumber',  header: dict.admin.orders.csv.orderNumber },
      { key: '_creationTime', header: dict.admin.orders.csv.date, format: (v) => v ? formatDate(v as number) : '' },
      { key: 'status',       header: dict.admin.orders.csv.status, format: (v) => dict.admin.orders.status[v as OrderStatus] ?? String(v) },
      { key: 'paymentMethod', header: dict.admin.orders.csv.payment, format: (v) => dict.admin.orders.payment[v as 'cash' | 'card' | 'wallet'] ?? String(v) },
      {
        key: 'deliveryAddress',
        header: dict.admin.orders.csv.customer,
        format: (_, row) => {
          const r = row as unknown as OrderRow;
          return `${r.deliveryAddress.fullName} (${r.deliveryAddress.phone})`;
        },
      },
      {
        key: 'deliveryAddress',
        header: dict.admin.orders.csv.address,
        format: (_, row) => {
          const r = row as unknown as OrderRow;
          return `${r.deliveryAddress.address}, ${r.deliveryAddress.area}, ${r.deliveryAddress.city}`;
        },
      },
      { key: 'subtotal',     header: dict.admin.orders.csv.subtotal },
      { key: 'deliveryCost', header: dict.admin.orders.csv.delivery },
      { key: 'discount',     header: dict.admin.orders.csv.discount },
      { key: 'promoCode',    header: dict.admin.orders.csv.promo, format: (v) => v ? String(v) : '' },
      { key: 'total',        header: dict.admin.orders.csv.total },
      {
        key: 'items',
        header: dict.admin.orders.csv.items,
        format: (v) => {
          const items = v as OrderRow['items'];
          if (!Array.isArray(items)) return '';
          return items.map((i) => `${i.productName} ×${i.quantity}`).join(' | ');
        },
      },
    ]);
    const date = new Date().toISOString().slice(0, 10);
    downloadCsv(`orders-${date}.csv`, csv);
  };

  return (
    <div>
      <AdminPageHeader
        title={dict.admin.orders.title}
        subtitle={dict.admin.orders.subtitle}
        actions={
          <Button
            variant="secondary"
            size="md"
            iconLeft={<Download className="h-4 w-4" aria-hidden />}
            onClick={onExport}
            disabled={!filtered || filtered.length === 0}
          >
            {dict.admin.orders.export}
          </Button>
        }
      />

      <div className="mb-4 grid grid-cols-1 md:grid-cols-12 gap-2.5">
        <div className="md:col-span-8 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
          <FormInput
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.admin.orders.searchPlaceholder}
            className="ps-10"
          />
        </div>
        <div className="md:col-span-4">
          <FormSelect
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as '' | OrderStatus)}
            options={[
              { value: '',           label: dict.admin.orders.allStatuses },
              { value: 'pending',    label: dict.admin.orders.status.pending },
              { value: 'confirmed',  label: dict.admin.orders.status.confirmed },
              { value: 'processing', label: dict.admin.orders.status.processing },
              { value: 'shipped',    label: dict.admin.orders.status.shipped },
              { value: 'delivered',  label: dict.admin.orders.status.delivered },
              { value: 'cancelled',  label: dict.admin.orders.status.cancelled },
            ]}
          />
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<ShoppingBag className="h-7 w-7" aria-hidden />}
          title={dict.admin.orders.empty}
        />
      ) : (
        <DataTable
          columns={columns}
          rows={filtered}
          rowKey={(o) => o._id}
          onRowClick={(o) => { router.push(`/${locale}/admin/orders/${o._id}`); }}
        />
      )}
    </div>
  );
}
