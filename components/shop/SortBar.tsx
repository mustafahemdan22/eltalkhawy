'use client';

import { SORT_OPTIONS } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { SlidersHorizontal, ChevronDown } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';

interface SortBarProps {
  productCount: number;
  selectedSort: string;
  onSelectSort: (sort: string) => void;
  onOpenMobileFilters: () => void;
}

export default function SortBar({
  productCount,
  selectedSort,
  onSelectSort,
  onOpenMobileFilters,
}: SortBarProps) {
  const { locale, dict } = useLocale();
  const currentSort = SORT_OPTIONS.find((opt) => opt.value === selectedSort) ?? SORT_OPTIONS[0];

  return (
    <div className="flex items-center justify-between gap-4 p-6 rounded-xl bg-surface border border-muted shadow-sm">
      {/* Product Count / Mobile Filter Button */}
      <div className="flex items-center gap-4">
        <button
          onClick={onOpenMobileFilters}
          className="lg:hidden flex items-center gap-2 h-11 px-6 rounded-button bg-surface-raised border border-muted text-sm font-semibold uppercase tracking-wider text-primary hover:bg-surface-raised/80 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--gold)]" />
          {dict.shop?.filter || 'Filter'}
        </button>
        <span className="hidden sm:inline font-sans text-sm uppercase tracking-wider text-muted">
          {dict.shop?.showing || 'Showing'} <span className="font-mono text-[var(--gold)] font-bold" dir="ltr">{productCount}</span> {dict.shop?.specialties || 'Specialties'}
        </span>
      </div>

      {/* Sort Select */}
      <div className="flex items-center gap-4 font-sans">
        <label htmlFor="sort-select" className="hidden md:inline text-sm uppercase tracking-wider text-muted">
          {dict.shop?.sortBy || 'Sort By'}:
        </label>
        <div className="relative">
          <select
            id="sort-select"
            value={selectedSort}
            onChange={(e) => onSelectSort(e.target.value)}
            className={cn(
              'h-11 rounded-button text-sm font-semibold tracking-wide appearance-none cursor-pointer',
              'bg-surface-raised border border-muted text-primary',
              'focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20',
              'transition-all duration-200',
              locale === 'ar' ? 'pr-5 pl-11' : 'pl-5 pr-11'
            )}
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} className="bg-surface text-primary">
                {locale === 'ar' ? opt.labelAr : opt.label}
              </option>
            ))}
          </select>
          <ChevronDown
            className={cn("absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted pointer-events-none", locale === 'ar' ? "left-3.5" : "right-3.5")}
            aria-hidden="true"
          />
        </div>
      </div>
    </div>
  );
}
