'use client';

import { useEffect, useId, useRef, useState } from 'react';
import {
  ArrowDownNarrowWide,
  ArrowUpNarrowWide,
  Check,
  Clock,
  Flame,
  Sparkles,
  Star,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';
import { SORT_OPTIONS, type SortValue } from '@/lib/constants';

const ICON_MAP = {
  Sparkles,
  Clock,
  ArrowUpNarrowWide,
  ArrowDownNarrowWide,
  Star,
  Flame,
} as const;

interface SortMenuProps {
  value: SortValue;
  onChange: (value: SortValue) => void;
}

export default function SortMenu({ value, onChange }: SortMenuProps) {
  const { locale, dict } = useLocale();
  const isRtl = locale === 'ar';

  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const listRef = useRef<HTMLUListElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const active = SORT_OPTIONS.find((o) => o.value === value) ?? SORT_OPTIONS[0];
  const activeLabel = isRtl ? active.labelAr : active.label;

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  /* Close on Escape, return focus to trigger */
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  /* When the menu opens, sync the focused option to the currently-applied value */
  const handleOpen = () => {
    if (!open) {
      const idx = SORT_OPTIONS.findIndex((o) => o.value === value);
      if (idx >= 0) setActiveIdx(idx);
    }
    setOpen((v) => !v);
  };

  const handleSelect = (nextValue: SortValue) => {
    onChange(nextValue);
    setOpen(false);
    triggerRef.current?.focus();
  };

  const handleListKey = (e: React.KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'ArrowDown' || (isRtl && e.key === 'ArrowLeft') || (!isRtl && e.key === 'ArrowLeft')) {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % SORT_OPTIONS.length);
    } else if (e.key === 'ArrowUp' || (isRtl && e.key === 'ArrowRight') || (!isRtl && e.key === 'ArrowRight')) {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + SORT_OPTIONS.length) % SORT_OPTIONS.length);
    } else if (e.key === 'Home') {
      e.preventDefault();
      setActiveIdx(0);
    } else if (e.key === 'End') {
      e.preventDefault();
      setActiveIdx(SORT_OPTIONS.length - 1);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleSelect(SORT_OPTIONS[activeIdx].value);
    }
  };

  return (
    <div ref={containerRef} className="relative inline-block text-start">
      <button
        ref={triggerRef}
        type="button"
        onClick={handleOpen}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        className={cn(
          'group inline-flex items-center gap-2 min-h-11 px-4 rounded-button border transition-all duration-200',
          'bg-surface-raised border-muted text-primary',
          'hover:border-[var(--gold)]/50 hover:bg-surface-raised/80',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50',
          'cursor-pointer',
          open && 'border-[var(--gold)] ring-2 ring-[var(--gold)]/20 bg-surface',
        )}
      >
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">
          {dict.shop?.sortBy || 'Sort By'}:
        </span>
        <span className="text-sm font-bold text-primary">{activeLabel}</span>
        <ArrowDownNarrowWide
          className={cn(
            'w-4 h-4 text-[var(--gold)] transition-transform duration-250',
            open && 'rotate-180',
          )}
          aria-hidden="true"
        />
      </button>

      {open && (
        <ul
          ref={listRef}
          id={menuId}
          role="menu"
          aria-label={dict.shop?.sortBy || 'Sort By'}
          onKeyDown={handleListKey}
          className={cn(
            'absolute z-40 mt-2 min-w-[280px] max-w-[340px] py-2',
            'bg-surface border border-muted rounded-card shadow-raised',
            'overflow-hidden',
            isRtl ? 'right-0' : 'left-0',
          )}
        >
          {SORT_OPTIONS.map((opt, idx) => {
            const Icon = ICON_MAP[opt.icon as keyof typeof ICON_MAP] ?? Sparkles;
            const isActive = opt.value === value;
            const isFocused = idx === activeIdx;
            const label = isRtl ? opt.labelAr : opt.label;
            const descKey = opt.descKey as keyof NonNullable<typeof dict.shop>['sortDescriptions'];
            const desc = dict.shop?.sortDescriptions?.[descKey] ?? '';

            return (
              <li key={opt.value} role="none">
                <button
                  type="button"
                  role="menuitemradio"
                  aria-checked={isActive}
                  onMouseEnter={() => setActiveIdx(idx)}
                  onClick={() => handleSelect(opt.value)}
                  className={cn(
                    'w-full flex items-start gap-3 px-4 py-3 cursor-pointer',
                    'transition-colors duration-150',
                    isFocused && 'bg-surface-raised',
                    isActive && 'bg-[var(--gold-subtle)]/40',
                    'hover:bg-surface-raised',
                    'focus-visible:outline-none focus-visible:bg-surface-raised',
                  )}
                >
                  <span
                    className={cn(
                      'shrink-0 w-9 h-9 rounded-md flex items-center justify-center',
                      isActive
                        ? 'bg-[var(--gold)] text-[var(--gold-fg)]'
                        : 'bg-[var(--gold-subtle)] text-[var(--gold)] border border-[var(--gold-border)]',
                    )}
                    aria-hidden="true"
                  >
                    <Icon className="w-4 h-4" />
                  </span>
                  <span className="flex-1 min-w-0 text-start">
                    <span
                      className={cn(
                        'block text-sm font-bold leading-tight',
                        isActive ? 'text-[var(--gold)]' : 'text-primary',
                      )}
                    >
                      {label}
                    </span>
                    {desc && (
                      <span className="block text-xs text-muted mt-0.5 leading-snug">
                        {desc}
                      </span>
                    )}
                  </span>
                  {isActive && (
                    <span
                      className="shrink-0 mt-1 text-[var(--gold)]"
                      aria-label={locale === 'ar' ? 'محدد' : 'Selected'}
                    >
                      <Check className="w-4 h-4" aria-hidden="true" />
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
