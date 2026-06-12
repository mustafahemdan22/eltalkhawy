'use client';

import { useEffect, useRef } from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';

interface ConfirmDialogProps {
  open:        boolean;
  onOpenChange:(open: boolean) => void;
  title:       string;
  description: string;
  confirmText: string;
  cancelText?: string;
  destructive?:boolean;
  loading?:    boolean;
  onConfirm:   () => void | Promise<void>;
}

export default function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmText,
  cancelText,
  destructive = false,
  loading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => confirmRef.current?.focus(), 30);
      return () => clearTimeout(t);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-desc"
    >
      <button
        type="button"
        className="absolute inset-0 bg-[var(--bg-overlay)]/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-label="Close dialog"
      />

      <div
        className={cn(
          'relative w-full max-w-md rounded-card border border-[var(--border-subtle)]',
          'bg-[var(--bg-surface)] p-6 shadow-raised',
        )}
      >
        <button
          type="button"
          onClick={() => onOpenChange(false)}
          className="absolute top-3 right-3 inline-flex h-9 w-9 items-center justify-center rounded-button text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--border-default)]"
          aria-label="Close"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={cn(
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-full border',
              destructive
                ? 'bg-red-500/10 border-red-500/30'
                : 'bg-[var(--gold-subtle)]/40 border-[var(--gold-border)]/40',
            )}
          >
            <AlertTriangle
              className={cn('h-5 w-5', destructive ? 'text-red-500' : 'text-[var(--gold)]')}
              aria-hidden
            />
          </div>
          <div className="min-w-0 flex-1">
            <h2 id="confirm-title" className="font-display text-lg font-bold text-[var(--text-primary)]">
              {title}
            </h2>
            <p id="confirm-desc" className="mt-1.5 text-sm text-[var(--text-secondary)] leading-relaxed">
              {description}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="secondary"
            size="md"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            {cancelText ?? 'Cancel'}
          </Button>
          <button
            ref={confirmRef}
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              'inline-flex items-center justify-center h-11 px-6 rounded-button text-sm font-semibold gap-2.5',
              'transition-all duration-250 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
              'focus-visible:ring-offset-[var(--bg-base)]',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              destructive
                ? 'bg-red-500 text-white hover:bg-red-600 focus-visible:ring-red-500 shadow-card'
                : 'bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] focus-visible:ring-[var(--gold)] shadow-gold',
            )}
          >
            {loading && (
              <span className="inline-block h-3.5 w-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" aria-hidden />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
