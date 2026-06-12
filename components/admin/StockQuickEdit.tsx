'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';
import { cn } from '@/lib/utils';
import { Check, ChevronDown, Loader2, X } from 'lucide-react';

type Variant = { weight: string; price: number; stock: number };

interface StockQuickEditProps {
  productId: string;
  variants: Variant[];
  size?: 'sm' | 'md';
  align?: 'start' | 'end';
}

export default function StockQuickEdit({ productId, variants, size = 'sm', align = 'end' }: StockQuickEditProps) {
  const { locale, dict } = useLocale();
  const { showToast } = useToast();
  const setStock = useMutation(api.products.setStock);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState<Record<string, string>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalStock = variants.reduce((s, v) => s + v.stock, 0);
  const isOut = totalStock === 0;
  const isLow = !isOut && totalStock < 20;

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const onSave = async (variantWeight: string) => {
    const raw = pending[variantWeight];
    if (raw === undefined) return;
    const stock = Number(raw);
    if (!Number.isFinite(stock) || stock < 0) {
      showToast(locale === 'ar' ? 'قيمة غير صالحة' : 'Invalid value', 'error');
      return;
    }
    setSavingKey(variantWeight);
    try {
      await setStock({ productId: productId as never, variantWeight, stock });
      showToast(dict.admin.products.toast.stockUpdated, 'success');
      setPending((p) => {
        const next = { ...p };
        delete next[variantWeight];
        return next;
      });
      setOpen(false);
    } catch (err) {
      showToast(err instanceof Error ? err.message : dict.admin.common.error, 'error');
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-pill ring-1 ring-inset font-mono tabular-nums font-bold',
          size === 'sm' ? 'h-7 px-2.5 text-2xs' : 'h-8 px-3 text-xs',
          isOut
            ? 'bg-red-500/10 text-red-500 ring-red-500/30'
            : isLow
              ? 'bg-amber-500/10 text-amber-500 ring-amber-500/30'
              : 'bg-emerald-500/10 text-emerald-500 ring-emerald-500/30',
        )}
        aria-haspopup="dialog"
        aria-expanded={open}
      >
        {totalStock}
        <ChevronDown className={cn('h-3 w-3 opacity-60 transition-transform', open && 'rotate-180')} aria-hidden />
      </button>

      {open && (
        <div
          role="dialog"
          aria-label={dict.admin.products.editStock}
          className={cn(
            'absolute z-30 mt-2 w-72 rounded-card border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-4 shadow-raised',
            align === 'end' ? 'end-0' : 'start-0',
          )}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-display text-sm font-bold text-[var(--text-primary)]">
              {dict.admin.products.editStock}
            </h3>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="inline-flex h-7 w-7 items-center justify-center rounded-button text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]"
              aria-label={dict.admin.common.cancel}
            >
              <X className="h-3.5 w-3.5" aria-hidden />
            </button>
          </div>

          <ul className="flex flex-col gap-2.5">
            {variants.map((v) => {
              const draft = pending[v.weight];
              const dirty = draft !== undefined && draft !== String(v.stock);
              return (
                <li key={v.weight} className="flex items-center gap-2">
                  <span className="font-mono text-2xs font-semibold text-[var(--text-secondary)] w-16 shrink-0 truncate" title={v.weight}>
                    {v.weight}
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={draft ?? v.stock}
                    onChange={(e) => setPending((p) => ({ ...p, [v.weight]: e.target.value }))}
                    onFocus={(e) => e.currentTarget.select()}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && dirty) onSave(v.weight);
                      if (e.key === 'Escape') setOpen(false);
                    }}
                    className="flex-1 h-9 px-2.5 rounded-button bg-[var(--bg-surface-raised)] border border-[var(--border-default)] text-sm font-mono tabular-nums text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--gold)]/40 focus:border-[var(--border-hover)]"
                    aria-label={`${dict.admin.products.editStock} ${v.weight}`}
                    dir="ltr"
                  />
                  <button
                    type="button"
                    onClick={() => onSave(v.weight)}
                    disabled={!dirty || savingKey === v.weight}
                    className={cn(
                      'inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-button text-[var(--text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
                      'disabled:opacity-30 disabled:cursor-not-allowed',
                      dirty ? 'bg-[var(--gold)] text-[var(--brand-fg)] hover:opacity-90' : 'bg-[var(--bg-surface-raised)]',
                    )}
                    aria-label={dict.admin.common.save}
                  >
                    {savingKey === v.weight ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                    ) : (
                      <Check className="h-3.5 w-3.5" aria-hidden />
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="mt-3 text-2xs text-[var(--text-secondary)]">
            {locale === 'ar' ? 'اضغط Enter للحفظ' : 'Press Enter to save'}
          </p>
        </div>
      )}
    </div>
  );
}
