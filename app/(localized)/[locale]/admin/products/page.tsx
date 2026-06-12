'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable';
import { FormInput } from '@/components/admin/FormInput';
import { FormSelect } from '@/components/admin/FormSelect';
import { Button } from '@/components/ui/Button';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import StockQuickEdit from '@/components/admin/StockQuickEdit';
import { Plus, Search, Package, Edit, Trash2 } from 'lucide-react';
import { cn, discountedPrice } from '@/lib/utils';

interface ProductRow {
  _id:        Id<'products'>;
  slug:       string;
  name:       string;
  nameAr:     string;
  categorySlug: string;
  basePrice:  number;
  discount:   number | null;
  images:     string[];
  isAvailable:boolean;
  variants:   Array<{ weight: string; price: number; stock: number }>;
}

export default function AdminProductsPage() {
  const { locale, dict } = useLocale();
  const { showToast } = useToast();
  const products = useQuery(api.products.listAll);
  const removeProduct = useMutation(api.products.remove);

  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStock, setFilterStock] = useState<'' | 'low' | 'out'>('');
  const [filterStatus, setFilterStatus] = useState<'' | 'available' | 'unavailable'>('');
  const [pendingDelete, setPendingDelete] = useState<ProductRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const categories = useQuery(api.categories.listAll);

  const categoryName = (slug: string) => {
    const c = categories?.find((c) => c.slug === slug);
    if (!c) return slug;
    return locale === 'ar' ? c.nameAr : c.name;
  };

  const filtered = useMemo(() => {
    if (!products) return undefined;
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (q) {
        const hit =
          p.name.toLowerCase().includes(q) ||
          p.nameAr.toLowerCase().includes(q) ||
          p.slug.toLowerCase().includes(q);
        if (!hit) return false;
      }
      if (filterCategory && p.categorySlug !== filterCategory) return false;
      if (filterStatus === 'available' && !p.isAvailable) return false;
      if (filterStatus === 'unavailable' && p.isAvailable) return false;
      if (filterStock) {
        const min = Math.min(...p.variants.map((v) => v.stock));
        if (filterStock === 'out' && min !== 0) return false;
        if (filterStock === 'low' && (min === 0 || min >= 10)) return false;
      }
      return true;
    });
  }, [products, search, filterCategory, filterStock, filterStatus]);

  const formatPrice = (p: ProductRow) => {
    const price = p.discount
      ? discountedPrice(p.basePrice, p.discount)
      : p.basePrice;
    return locale === 'ar' ? `${Math.round(price).toLocaleString('ar-EG')} ج.م` : `EGP ${Math.round(price).toLocaleString()}`;
  };

  const columns: DataTableColumn<ProductRow>[] = [
    {
      key: 'product',
      header: dict.admin.products.table.product,
      render: (p) => (
        <div className="flex items-center gap-3 min-w-0">
          {p.images[0] ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={p.images[0]}
              alt=""
              className="h-10 w-10 rounded-button object-cover bg-[var(--bg-surface-raised)] shrink-0"
            />
          ) : (
            <div className="h-10 w-10 rounded-button bg-[var(--bg-surface-raised)] shrink-0" />
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
      key: 'category',
      header: dict.admin.products.table.category,
      render: (p) => (
        <span className="text-xs text-[var(--text-secondary)]">{categoryName(p.categorySlug)}</span>
      ),
      hideOn: 'md',
    },
    {
      key: 'price',
      header: dict.admin.products.table.price,
      align: 'end',
      render: (p) => (
        <div className="flex flex-col items-end">
          <span className="font-mono text-sm font-semibold tabular-nums">{formatPrice(p)}</span>
          {p.discount && (
            <span className="text-2xs text-[var(--text-secondary)] line-through font-mono">
              {locale === 'ar' ? `${p.basePrice.toLocaleString('ar-EG')} ج.م` : `EGP ${p.basePrice.toLocaleString()}`}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'stock',
      header: dict.admin.products.table.stock,
      align: 'center',
      render: (p) => (
        <StockQuickEdit productId={p._id} variants={p.variants} />
      ),
    },
    {
      key: 'status',
      header: dict.admin.products.table.status,
      render: (p) => (
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-2xs font-bold uppercase tracking-wider',
            p.isAvailable
              ? 'bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/30'
              : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]',
          )}
        >
          <span className={cn('h-1.5 w-1.5 rounded-full', p.isAvailable ? 'bg-emerald-500' : 'bg-[var(--text-secondary)]')} aria-hidden />
          {p.isAvailable ? dict.admin.products.statusAvailable : dict.admin.products.statusUnavailable}
        </span>
      ),
      hideOn: 'sm',
    },
    {
      key: 'actions',
      header: dict.admin.common.actions,
      align: 'end',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <Link
            href={`/${locale}/admin/products/${p._id}`}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-button text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
            aria-label={dict.admin.common.edit}
          >
            <Edit className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden md:inline">{dict.admin.common.edit}</span>
          </Link>
          <button
            type="button"
            onClick={() => setPendingDelete(p)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-button text-xs font-semibold text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
            aria-label={dict.admin.common.delete}
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  const isEmpty = !products || (filtered && filtered.length === 0 && !search && !filterCategory && !filterStock && !filterStatus);

  return (
    <div>
      <AdminPageHeader
        title={dict.admin.products.title}
        subtitle={dict.admin.products.subtitle}
        actions={
          <Link href={`/${locale}/admin/products/new`}>
            <Button variant="gold" size="md" iconLeft={<Plus className="h-4 w-4" />}>
              {dict.admin.nav.addProduct}
            </Button>
          </Link>
        }
      />

      {/* Filters */}
      <div className="mb-4 grid grid-cols-1 md:grid-cols-12 gap-2.5">
        <div className="md:col-span-5 relative">
          <Search className="absolute start-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--text-secondary)]" aria-hidden />
          <FormInput
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.admin.products.searchPlaceholder}
            className="ps-10"
          />
        </div>
        <div className="md:col-span-3">
          <FormSelect
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            options={[
              { value: '', label: dict.admin.products.filterCategory },
              ...(categories?.map((c) => ({
                value: c.slug,
                label: locale === 'ar' ? c.nameAr : c.name,
              })) ?? []),
            ]}
          />
        </div>
        <div className="md:col-span-2">
          <FormSelect
            value={filterStock}
            onChange={(e) => setFilterStock(e.target.value as '' | 'low' | 'out')}
            options={[
              { value: '',        label: dict.admin.products.stockAll },
              { value: 'low',     label: dict.admin.products.stockLow },
              { value: 'out',     label: dict.admin.products.stockOut },
            ]}
          />
        </div>
        <div className="md:col-span-2">
          <FormSelect
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value as '' | 'available' | 'unavailable')}
            options={[
              { value: '',            label: dict.admin.products.statusAll },
              { value: 'available',   label: dict.admin.products.statusAvailable },
              { value: 'unavailable', label: dict.admin.products.statusUnavailable },
            ]}
          />
        </div>
      </div>

      {isEmpty ? (
        <EmptyState
          icon={<Package className="h-7 w-7" aria-hidden />}
          title={dict.admin.products.empty}
          action={
            <Link href={`/${locale}/admin/products/new`}>
              <Button variant="gold" size="md" iconLeft={<Plus className="h-4 w-4" />}>
                {dict.admin.products.addFirst}
              </Button>
            </Link>
          }
        />
      ) : (
        <DataTable columns={columns} rows={filtered} rowKey={(p) => p._id} />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => { if (!o) setPendingDelete(null); }}
        title={dict.admin.confirm.deleteTitle}
        description={`${dict.admin.confirm.deleteDesc} (${pendingDelete ? (locale === 'ar' ? pendingDelete.nameAr : pendingDelete.name) : ''})`}
        confirmText={dict.admin.common.delete}
        cancelText={dict.admin.common.cancel}
        destructive
        loading={deleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleting(true);
          try {
            await removeProduct({ productId: pendingDelete._id });
            showToast(dict.admin.products.toast.deleted, 'success');
            setPendingDelete(null);
          } catch {
            showToast(dict.admin.common.error, 'error');
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}
