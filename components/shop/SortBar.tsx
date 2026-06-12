'use client';

import { useCallback, useRef } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';
import { useToast } from '@/components/ui/Toast';
import SortMenu from './SortMenu';
import { SORT_OPTIONS, type SortValue } from '@/lib/constants';

interface SortBarProps {
  productCount: number;
  selectedSort: SortValue;
  onSelectSort: (sort: SortValue) => void;
  onOpenMobileFilters: () => void;
  onClearAllFilters?: () => void;
  hasActiveFilters?: boolean;
}

export default function SortBar({
  productCount,
  selectedSort,
  onSelectSort,
  onOpenMobileFilters,
  onClearAllFilters,
  hasActiveFilters = false,
}: SortBarProps) {
  const { locale, dict } = useLocale();
  const { showToast } = useToast();
  const isFirstRender = useRef(true);

  const handleSelectSort = useCallback(
    (next: SortValue) => {
      const sameAsCurrent = next === selectedSort;
      onSelectSort(next);

      const isReset = next === 'featured';
      const option = SORT_OPTIONS.find((o) => o.value === next);
      const optionLabel = option
        ? (locale === 'ar' ? option.labelAr : option.label)
        : '';

      if (isFirstRender.current || sameAsCurrent) {
        isFirstRender.current = false;
        return;
      }

      const template = isReset
        ? (dict.shop?.sortCleared || 'Sort cleared')
        : (dict.shop?.sortApplied || 'Sorted by {option}').replace('{option}', optionLabel);

      showToast(template, 'info');
      isFirstRender.current = false;
    },
    [onSelectSort, selectedSort, showToast, dict.shop?.sortApplied, dict.shop?.sortCleared, locale],
  );

  return (
    <div
      className={cn(
        'flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between',
        'p-4 sm:p-5 rounded-xl',
        'bg-surface border border-muted shadow-card',
        'sticky top-[68px] md:top-0 z-30',
        'backdrop-blur-sm bg-surface/95',
      )}
    >
      {/* Left: count + mobile filter button */}
      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className={cn(
            'lg:hidden inline-flex items-center gap-2 min-h-11 px-4 rounded-button',
            'bg-surface-raised border border-muted',
            'text-sm font-semibold uppercase tracking-wider text-primary',
            'hover:bg-surface-raised/80 transition-colors cursor-pointer',
            'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50',
          )}
          aria-label={dict.shop?.filter || 'Filter'}
        >
          <SlidersHorizontal className="w-4 h-4 text-[var(--gold)]" aria-hidden="true" />
          {dict.shop?.filter || 'Filter'}
        </button>

        <span className="font-sans text-sm text-secondary">
          <span className="uppercase tracking-wider text-muted text-2xs">
            {dict.shop?.showing || 'Showing'}
          </span>{' '}
          <span className="font-mono font-bold text-[var(--gold)]" dir="ltr">
            {productCount}
          </span>{' '}
          <span className="uppercase tracking-wider text-muted text-2xs">
            {dict.shop?.specialties || 'Specialties'}
          </span>
        </span>

        {hasActiveFilters && onClearAllFilters && (
          <button
            type="button"
            onClick={onClearAllFilters}
            className={cn(
              'inline-flex items-center gap-1.5 min-h-11 px-3 rounded-button',
              'text-xs font-semibold uppercase tracking-wider',
              'text-muted hover:text-error transition-colors cursor-pointer',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-error/40',
            )}
            aria-label={dict.shop?.clearAll || 'Clear all filters'}
          >
            <X className="w-3.5 h-3.5" aria-hidden="true" />
            {dict.shop?.clearAll || 'Clear All'}
          </button>
        )}
      </div>

      {/* Right: sort menu */}
      <div className="flex items-center gap-2">
        <SortMenu value={selectedSort} onChange={handleSelectSort} />
      </div>
    </div>
  );
}
