'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import { useDebounce } from '@/hooks/useDebounce';
import { useToast } from '@/components/ui/Toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable';
import { FormInput } from '@/components/admin/FormInput';
import { Shield, User as UserIcon, Crown, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

type CustomerRow = {
  _id: string;
  clerkId: string;
  name: string | null;
  email: string;
  imageUrl: string | null;
  role: 'admin' | 'customer';
  createdAt: number;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt: number | null;
};

export default function AdminCustomersPage() {
  const { locale, dict } = useLocale();
  const { showToast } = useToast();
  const customers = useQuery(api.users.listWithStats);
  const setRole = useMutation(api.users.setRole);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'customer'>('all');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 200);

  const formatEGP = (n: number) =>
    locale === 'ar' ? `${n.toLocaleString('ar-EG')} ج.م` : `EGP ${n.toLocaleString()}`;

  const formatDate = (ms: number) =>
    new Date(ms).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

  const rows: CustomerRow[] = useMemo(() => {
    if (!customers) return [];
    const q = debouncedSearch.toLowerCase().trim();
    return customers.filter((c) => {
      if (roleFilter !== 'all' && c.role !== roleFilter) return false;
      if (!q) return true;
      return (
        (c.name ?? '').toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q)
      );
    });
  }, [customers, debouncedSearch, roleFilter]);

  const totals = useMemo(() => {
    const all = customers ?? [];
    return {
      total: all.length,
      admins: all.filter((c) => c.role === 'admin').length,
      customers: all.filter((c) => c.role === 'customer').length,
      spenders: all.filter((c) => c.totalSpent > 0).length,
    };
  }, [customers]);

  const onToggleRole = async (row: CustomerRow) => {
    setPendingId(row._id);
    try {
      const newRole: 'admin' | 'customer' = row.role === 'admin' ? 'customer' : 'admin';
      await setRole({ userId: row._id as never, role: newRole });
      showToast(
        locale === 'ar'
          ? (newRole === 'admin' ? `تم ترقية ${row.name ?? row.email} إلى مشرف` : `تم تخفيض ${row.name ?? row.email} إلى عميل`)
          : (`${row.name ?? row.email} is now ${newRole === 'admin' ? 'an admin' : 'a customer'}`),
        'success',
      );
    } catch (err) {
      showToast(err instanceof Error ? err.message : dict.admin.common.error, 'error');
    } finally {
      setPendingId(null);
    }
  };

  const columns: DataTableColumn<CustomerRow>[] = [
    {
      key: 'customer',
      header: dict.admin.customers.table.customer,
      render: (c) => (
        <div className="flex items-center gap-3 min-w-0">
          {c.imageUrl ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img src={c.imageUrl} alt="" className="h-9 w-9 rounded-full object-cover bg-[var(--bg-surface-raised)]" />
          ) : (
            <div className="h-9 w-9 rounded-full bg-gradient-brand text-[var(--brand-fg)] flex items-center justify-center text-sm font-bold">
              {(c.name?.[0] ?? c.email[0] ?? '?').toUpperCase()}
            </div>
          )}
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--text-primary)] truncate">
              {c.name ?? (locale === 'ar' ? 'بدون اسم' : 'No name')}
            </p>
            <p className="text-2xs text-[var(--text-secondary)] font-mono truncate">{c.email}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'role',
      header: dict.admin.customers.table.role,
      render: (c) => (
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-2xs font-bold uppercase tracking-wider',
            c.role === 'admin'
              ? 'bg-[var(--gold-subtle)]/40 text-[var(--gold)] ring-1 ring-inset ring-[var(--gold-border)]'
              : 'bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]',
          )}
        >
          {c.role === 'admin' ? <Crown className="h-3 w-3" aria-hidden /> : <UserIcon className="h-3 w-3" aria-hidden />}
          {c.role === 'admin' ? 'Admin' : (locale === 'ar' ? 'عميل' : 'Customer')}
        </span>
      ),
      hideOn: 'sm',
    },
    {
      key: 'orders',
      header: dict.admin.customers.table.orders,
      align: 'center',
      render: (c) => (
        <span className="font-mono text-sm font-semibold tabular-nums text-[var(--text-primary)]">
          {c.ordersCount}
        </span>
      ),
    },
    {
      key: 'totalSpent',
      header: dict.admin.customers.table.totalSpent,
      align: 'end',
      render: (c) => (
        <span className="font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">
          {formatEGP(c.totalSpent)}
        </span>
      ),
      hideOn: 'md',
    },
    {
      key: 'lastOrder',
      header: dict.admin.customers.table.lastOrder,
      render: (c) => (
        <span className="text-2xs text-[var(--text-secondary)] font-mono">
          {c.lastOrderAt ? formatDate(c.lastOrderAt) : (locale === 'ar' ? '—' : '—')}
        </span>
      ),
      hideOn: 'lg',
    },
    {
      key: 'actions',
      header: '',
      align: 'end',
      render: (c) => (
        <button
          type="button"
          onClick={() => onToggleRole(c)}
          disabled={pendingId === c._id}
          className={cn(
            'inline-flex items-center gap-1.5 h-9 px-3 rounded-button text-xs font-semibold border transition-colors',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            c.role === 'admin'
              ? 'bg-[var(--bg-surface-raised)] border-[var(--border-subtle)] text-[var(--text-secondary)] hover:text-[var(--error)] hover:border-[var(--error)]/40'
              : 'bg-[var(--gold-subtle)]/30 border-[var(--gold-border)] text-[var(--gold)] hover:bg-[var(--gold-subtle)]/50',
          )}
          aria-label={c.role === 'admin' ? (locale === 'ar' ? 'إلغاء صلاحية المشرف' : 'Demote to customer') : (locale === 'ar' ? 'ترقية إلى مشرف' : 'Promote to admin')}
        >
          {pendingId === c._id ? (
            <RotateCcw className="h-3 w-3 animate-spin" aria-hidden />
          ) : c.role === 'admin' ? (
            <UserIcon className="h-3 w-3" aria-hidden />
          ) : (
            <Shield className="h-3 w-3" aria-hidden />
          )}
          {c.role === 'admin'
            ? (locale === 'ar' ? 'إلغاء الصلاحية' : 'Demote')
            : (locale === 'ar' ? 'ترقية' : 'Promote')}
        </button>
      ),
    },
  ];

  return (
    <div>
      <AdminPageHeader title={dict.admin.customers.title} subtitle={dict.admin.customers.subtitle} />

      <div className="mb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat label={dict.admin.customers.table.customer} value={totals.total} />
        <Stat label={dict.admin.customers.roleAdmin} value={totals.admins} variant="gold" />
        <Stat label={dict.admin.customers.roleCustomer} value={totals.customers} />
        <Stat
          label={locale === 'ar' ? 'الذين اشتروا' : 'Have ordered'}
          value={totals.spenders}
          variant="green"
        />
      </div>

      <div className="mb-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FormInput
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={dict.admin.customers.searchPlaceholder}
            aria-label={dict.admin.customers.searchPlaceholder}
          />
        </div>
        <div className="flex items-center gap-1 rounded-button border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-0.5 self-start">
          {(['all', 'admin', 'customer'] as const).map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={cn(
                'h-9 px-3 rounded text-xs font-semibold transition-colors',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
                roleFilter === r
                  ? 'bg-[var(--gold)] text-[var(--brand-fg)]'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
              )}
            >
              {r === 'all' ? dict.admin.customers.roleAll : r === 'admin' ? dict.admin.customers.roleAdmin : dict.admin.customers.roleCustomer}
            </button>
          ))}
        </div>
      </div>

      {customers === undefined ? (
        <DataTable columns={columns} rows={undefined} rowKey={(c) => c._id} />
      ) : rows.length === 0 ? (
        <div className="rounded-card border border-dashed border-[var(--border-default)] bg-[var(--bg-surface)] p-12 text-center">
          <p className="text-sm text-[var(--text-secondary)]">
            {customers.length === 0 ? dict.admin.customers.table.noCustomers : dict.admin.customers.empty}
          </p>
        </div>
      ) : (
        <DataTable columns={columns} rows={rows} rowKey={(c) => c._id} />
      )}
    </div>
  );
}

function Stat({ label, value, variant }: { label: string; value: number; variant?: 'gold' | 'green' }) {
  return (
    <div className="rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] px-4 py-3">
      <p className="text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)]">{label}</p>
      <p
        className={cn(
          'font-display text-2xl font-bold font-mono tabular-nums mt-0.5',
          variant === 'gold' ? 'text-[var(--gold)]' : variant === 'green' ? 'text-emerald-500' : 'text-[var(--text-primary)]',
        )}
      >
        {value}
      </p>
    </div>
  );
}
