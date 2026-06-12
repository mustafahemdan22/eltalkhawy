'use client';

import { useState } from 'react';
import { useQuery, useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import type { Id } from '@/convex/_generated/dataModel';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';
import AdminPageHeader from '@/components/admin/AdminPageHeader';
import DataTable, { type DataTableColumn } from '@/components/admin/DataTable';
import { Button } from '@/components/ui/Button';
import { FormField } from '@/components/admin/FormField';
import { FormInput } from '@/components/admin/FormInput';
import FormToggle from '@/components/admin/FormToggle';
import ConfirmDialog from '@/components/admin/ConfirmDialog';
import EmptyState from '@/components/admin/EmptyState';
import { Plus, Ticket, Edit, Trash2, X, Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

type Promo = {
  _id:            Id<'promoCodes'>;
  code:           string;
  discountType:   'percentage' | 'fixed';
  discountValue:  number;
  minOrder:       number | null;
  maxUses:        number | null;
  currentUses:    number;
  expiresAt:      number | null;
  isActive:       boolean;
  _creationTime:  number;
};

export default function AdminPromoCodesPage() {
  const { locale, dict } = useLocale();
  const { showToast } = useToast();
  const promos = useQuery(api.promoCodes.list);
  const createPromo = useMutation(api.promoCodes.create);
  const updatePromo = useMutation(api.promoCodes.update);
  const removePromo = useMutation(api.promoCodes.remove);

  const [editing, setEditing] = useState<Promo | null>(null);
  const [creating, setCreating] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<Promo | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const onCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(code);
      showToast(dict.admin.promoCodes.toast.copied, 'success');
      setTimeout(() => setCopied(null), 1500);
    } catch {
      // ignore
    }
  };

  const formatDate = (ms: number) =>
    new Date(ms).toLocaleDateString(locale === 'ar' ? 'ar-EG' : 'en-GB', {
      day: '2-digit', month: 'short', year: 'numeric',
    });

  const isExpired = (p: Promo) => p.expiresAt !== null && p.expiresAt < Date.now();
  const isExhausted = (p: Promo) => p.maxUses !== null && p.currentUses >= p.maxUses;
  const isUsable = (p: Promo) => p.isActive && !isExpired(p) && !isExhausted(p);

  const columns: DataTableColumn<Promo>[] = [
    {
      key: 'code',
      header: dict.admin.promoCodes.table.code,
      render: (p) => (
        <button
          type="button"
          onClick={() => onCopy(p.code)}
          className="group inline-flex items-center gap-2 rounded-button ps-2.5 pe-2 py-1.5 font-mono text-xs font-bold uppercase tracking-wider bg-[var(--gold-subtle)]/30 text-[var(--gold)] ring-1 ring-inset ring-[var(--gold-border)] hover:bg-[var(--gold-subtle)]/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          aria-label={`${dict.admin.promoCodes.copy} ${p.code}`}
        >
          {copied === p.code ? <Check className="h-3 w-3" aria-hidden /> : <Copy className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden />}
          {p.code}
        </button>
      ),
    },
    {
      key: 'discount',
      header: dict.admin.promoCodes.table.discount,
      render: (p) => (
        <span className="font-mono text-sm font-bold tabular-nums text-[var(--text-primary)]">
          {p.discountType === 'percentage' ? `${p.discountValue}%` : formatEGP(p.discountValue)}
        </span>
      ),
    },
    {
      key: 'usage',
      header: dict.admin.promoCodes.table.usage,
      render: (p) => (
        <div className="flex flex-col gap-0.5">
          <span className="font-mono text-xs tabular-nums text-[var(--text-primary)]">
            {p.currentUses}
            {p.maxUses !== null ? ` / ${p.maxUses}` : ''}
          </span>
          {p.maxUses !== null && (
            <UsageBar current={p.currentUses} max={p.maxUses} />
          )}
        </div>
      ),
      hideOn: 'sm',
    },
    {
      key: 'minOrder',
      header: dict.admin.promoCodes.table.minOrder,
      align: 'end',
      render: (p) => (
        <span className="font-mono text-2xs text-[var(--text-secondary)]">
          {p.minOrder !== null ? formatEGP(p.minOrder) : '—'}
        </span>
      ),
      hideOn: 'md',
    },
    {
      key: 'expires',
      header: dict.admin.promoCodes.table.expires,
      render: (p) => (
        <span
          className={cn(
            'text-2xs font-mono',
            isExpired(p) ? 'text-red-500' : 'text-[var(--text-secondary)]',
          )}
        >
          {p.expiresAt ? formatDate(p.expiresAt) : (locale === 'ar' ? 'بلا حدود' : 'Never')}
        </span>
      ),
      hideOn: 'lg',
    },
    {
      key: 'status',
      header: dict.admin.promoCodes.table.status,
      render: (p) => {
        if (!isUsable(p)) {
          const reason = !p.isActive
            ? (locale === 'ar' ? 'معطّل' : 'Disabled')
            : isExpired(p)
              ? (locale === 'ar' ? 'منتهي' : 'Expired')
              : (locale === 'ar' ? 'مُستنفد' : 'Exhausted');
          return (
            <span className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-2xs font-bold uppercase tracking-wider bg-[var(--bg-surface-raised)] text-[var(--text-secondary)] ring-1 ring-inset ring-[var(--border-subtle)]">
              <span className="h-1.5 w-1.5 rounded-full bg-[var(--text-secondary)]" aria-hidden />
              {reason}
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1 text-2xs font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-500 ring-1 ring-inset ring-emerald-500/30">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />
            {locale === 'ar' ? 'فعّال' : 'Active'}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: dict.admin.common.actions,
      align: 'end',
      render: (p) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            onClick={() => setEditing(p)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-button text-xs font-semibold text-[var(--text-secondary)] hover:text-[var(--gold)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
          >
            <Edit className="h-3.5 w-3.5" aria-hidden />
            <span className="hidden md:inline">{dict.admin.common.edit}</span>
          </button>
          <button
            type="button"
            onClick={() => setPendingDelete(p)}
            className="inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-button text-xs font-semibold text-[var(--text-secondary)] hover:text-red-500 hover:bg-red-500/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
          >
            <Trash2 className="h-3.5 w-3.5" aria-hidden />
          </button>
        </div>
      ),
    },
  ];

  function formatEGP(n: number) {
    return locale === 'ar' ? `${n.toLocaleString('ar-EG')} ج.م` : `EGP ${n.toLocaleString()}`;
  }

  const isEmpty = promos && promos.length === 0;

  return (
    <div>
      <AdminPageHeader
        title={dict.admin.promoCodes.title}
        subtitle={dict.admin.promoCodes.subtitle}
        actions={
          <Button
            variant="gold"
            size="md"
            iconLeft={<Plus className="h-4 w-4" />}
            onClick={() => setCreating(true)}
          >
            {dict.admin.promoCodes.addPromo}
          </Button>
        }
      />

      {isEmpty ? (
        <EmptyState
          icon={<Ticket className="h-7 w-7" aria-hidden />}
          title={dict.admin.promoCodes.empty}
          action={
            <Button
              variant="gold"
              size="md"
              iconLeft={<Plus className="h-4 w-4" />}
              onClick={() => setCreating(true)}
            >
              {dict.admin.promoCodes.addPromo}
            </Button>
          }
        />
      ) : (
        <DataTable columns={columns} rows={promos} rowKey={(p) => p._id} />
      )}

      {(creating || editing) && (
        <PromoFormModal
          initial={editing ?? undefined}
          onClose={() => { setCreating(false); setEditing(null); }}
          onSubmit={async (values) => {
            try {
              if (editing) {
                await updatePromo({ promoId: editing._id, ...values });
                showToast(dict.admin.promoCodes.toast.updated, 'success');
              } else {
                await createPromo(values);
                showToast(dict.admin.promoCodes.toast.created, 'success');
              }
              setCreating(false);
              setEditing(null);
            } catch (err) {
              showToast(err instanceof Error ? err.message : dict.admin.common.error, 'error');
            }
          }}
        />
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        onOpenChange={(o) => { if (!o) setPendingDelete(null); }}
        title={dict.admin.confirm.deleteTitle}
        description={`${dict.admin.confirm.deleteDesc} (${pendingDelete?.code})`}
        confirmText={dict.admin.common.delete}
        cancelText={dict.admin.common.cancel}
        destructive
        loading={deleting}
        onConfirm={async () => {
          if (!pendingDelete) return;
          setDeleting(true);
          try {
            await removePromo({ promoId: pendingDelete._id });
            showToast(dict.admin.promoCodes.toast.deleted, 'success');
            setPendingDelete(null);
          } catch (err) {
            showToast(err instanceof Error ? err.message : dict.admin.common.error, 'error');
          } finally {
            setDeleting(false);
          }
        }}
      />
    </div>
  );
}

function UsageBar({ current, max }: { current: number; max: number }) {
  const pct = Math.min(100, (current / max) * 100);
  return (
    <div className="h-1 w-16 rounded-full bg-[var(--bg-surface-raised)] overflow-hidden" aria-hidden>
      <div
        className={cn(
          'h-full rounded-full transition-all',
          pct >= 90 ? 'bg-red-500' : pct >= 60 ? 'bg-amber-500' : 'bg-emerald-500',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

interface PromoFormModalProps {
  initial?: Promo;
  onClose:  () => void;
  onSubmit: (values: {
    code: string;
    discountType: 'percentage' | 'fixed';
    discountValue: number;
    minOrder: number | null;
    maxUses: number | null;
    expiresAt: number | null;
    isActive: boolean;
  }) => Promise<void>;
}

function PromoFormModal({ initial, onClose, onSubmit }: PromoFormModalProps) {
  const { locale, dict } = useLocale();
  const [code, setCode] = useState(initial?.code ?? '');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>(initial?.discountType ?? 'percentage');
  const [discountValue, setDiscountValue] = useState(initial?.discountValue ?? 10);
  const [minOrderStr, setMinOrderStr] = useState(initial?.minOrder?.toString() ?? '');
  const [maxUsesStr, setMaxUsesStr] = useState(initial?.maxUses?.toString() ?? '');
  const [hasExpiry, setHasExpiry] = useState(initial?.expiresAt !== null && initial?.expiresAt !== undefined);
  const [expiryDate, setExpiryDate] = useState(() => {
    if (!initial?.expiresAt) return '';
    return new Date(initial.expiresAt).toISOString().slice(0, 10);
  });
  const [isActive, setIsActive] = useState(initial?.isActive ?? true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const trimmedCode = code.trim().toUpperCase();
    if (!trimmedCode) {
      setError(dict.admin.promoCodes.errors.codeRequired);
      return;
    }
    if (!/^[A-Z0-9_-]{3,32}$/.test(trimmedCode)) {
      setError(dict.admin.promoCodes.errors.codeFormat);
      return;
    }
    if (discountValue <= 0) {
      setError(dict.admin.promoCodes.errors.discountPositive);
      return;
    }
    if (discountType === 'percentage' && discountValue > 100) {
      setError(dict.admin.promoCodes.errors.percentMax);
      return;
    }
    let expiresAt: number | null = null;
    if (hasExpiry && expiryDate) {
      const ts = new Date(expiryDate).getTime();
      if (Number.isNaN(ts)) {
        setError(dict.admin.promoCodes.errors.invalidDate);
        return;
      }
      expiresAt = ts;
    }

    setSaving(true);
    try {
      await onSubmit({
        code: trimmedCode,
        discountType,
        discountValue,
        minOrder: minOrderStr ? Number(minOrderStr) : null,
        maxUses: maxUsesStr ? Number(maxUsesStr) : null,
        expiresAt,
        isActive,
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-[var(--bg-overlay)]/70 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />
      <div className="relative w-full max-w-xl max-h-[90vh] overflow-y-auto rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] shadow-raised">
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-[var(--border-subtle)] bg-[var(--bg-surface)]">
          <h2 className="font-display text-base font-bold text-[var(--text-primary)]">
            {initial ? dict.admin.promoCodes.editPromo : dict.admin.promoCodes.addPromo}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-button text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)]"
            aria-label="Close"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-4">
          <FormField label={dict.admin.promoCodes.form.code} required help={dict.admin.promoCodes.form.codeHelp}>
            <FormInput
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              required
              dir="ltr"
              placeholder="SUMMER25"
              maxLength={32}
              className="font-mono uppercase"
            />
          </FormField>

          <div className="grid grid-cols-2 gap-4">
            <FormField label={dict.admin.promoCodes.form.type} required>
              <div className="flex items-center gap-1 rounded-button border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] p-0.5">
                {(['percentage', 'fixed'] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setDiscountType(t)}
                    className={cn(
                      'flex-1 h-10 rounded text-xs font-semibold transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
                      discountType === t
                        ? 'bg-[var(--gold)] text-[var(--brand-fg)]'
                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                    )}
                  >
                    {t === 'percentage'
                      ? (locale === 'ar' ? 'نسبة %' : '% Percentage')
                      : (locale === 'ar' ? 'مبلغ ثابت' : 'Fixed amount')}
                  </button>
                ))}
              </div>
            </FormField>
            <FormField label={dict.admin.promoCodes.form.discountValue} required>
              <FormInput
                type="number"
                value={discountValue}
                onChange={(e) => setDiscountValue(Number(e.target.value))}
                min={0}
                step={discountType === 'percentage' ? 1 : 0.01}
                dir="ltr"
                required
              />
            </FormField>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label={dict.admin.promoCodes.form.minOrder} help={dict.admin.promoCodes.form.minOrderHelp}>
              <FormInput
                type="number"
                value={minOrderStr}
                onChange={(e) => setMinOrderStr(e.target.value)}
                min={0}
                placeholder="0"
                dir="ltr"
              />
            </FormField>
            <FormField label={dict.admin.promoCodes.form.maxUses} help={dict.admin.promoCodes.form.maxUsesHelp}>
              <FormInput
                type="number"
                value={maxUsesStr}
                onChange={(e) => setMaxUsesStr(e.target.value)}
                min={1}
                placeholder="∞"
                dir="ltr"
              />
            </FormField>
          </div>

          <div className="rounded-button border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/40 p-3 flex flex-col gap-3">
            <div className="flex items-center justify-between gap-3">
              <FormField label={dict.admin.promoCodes.form.hasExpiry} className="flex-1">
                <span className="text-2xs text-[var(--text-secondary)]">
                  {dict.admin.promoCodes.form.hasExpiryHelp}
                </span>
              </FormField>
              <FormToggle checked={hasExpiry} onChange={setHasExpiry} />
            </div>
            {hasExpiry && (
              <FormField label={dict.admin.promoCodes.form.expiryDate}>
                <FormInput
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  dir="ltr"
                />
              </FormField>
            )}
          </div>

          <FormField label={dict.admin.promoCodes.form.isActive}>
            <div className="h-11 flex items-center">
              <FormToggle checked={isActive} onChange={setIsActive} />
            </div>
          </FormField>

          {error && (
            <p className="text-xs text-red-500 font-semibold" role="alert">{error}</p>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[var(--border-subtle)]">
            <Button type="button" variant="secondary" size="md" onClick={onClose}>
              {dict.admin.common.cancel}
            </Button>
            <Button type="submit" variant="gold" size="md" loading={saving}>
              {saving ? dict.admin.common.saving : dict.admin.common.save}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
