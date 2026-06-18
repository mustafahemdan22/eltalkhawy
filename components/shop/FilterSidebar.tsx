'use client';

import { CATEGORIES } from '@/lib/constants';
import { cn, formatPrice } from '@/lib/utils';
import { X, Filter } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';

interface FilterSidebarProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  selectedStates: {
    fresh: boolean;
    frozen: boolean;
    premium: boolean;
    bestseller: boolean;
  };
  onChangeStates: (states: {
    fresh: boolean;
    frozen: boolean;
    premium: boolean;
    bestseller: boolean;
  }) => void;
  priceRange: [number, number];
  onChangePriceRange: (range: [number, number]) => void;
  onClearAll: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function FilterSidebar({
  selectedCategory,
  onSelectCategory,
  selectedStates,
  onChangeStates,
  priceRange,
  onChangePriceRange,
  onClearAll,
  isOpen = false,
  onClose,
}: FilterSidebarProps) {
  const { locale, dict } = useLocale();
  const maxPrice = priceRange[1];

  const handleStateToggle = (key: keyof typeof selectedStates) => {
    onChangeStates({
      ...selectedStates,
      [key]: !selectedStates[key],
    });
  };

  const handleCategorySelect = (slug: string) => {
    onSelectCategory(slug);
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    onChangePriceRange([priceRange[0], val]);
  };

  const hasActiveFilters =
    selectedCategory ||
    selectedStates.fresh ||
    selectedStates.frozen ||
    selectedStates.premium ||
    selectedStates.bestseller ||
    priceRange[1] < 2000;

  const sidebarContent = (
    <div className="flex flex-col gap-10 h-full">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-muted">
        <h2 className="font-display text-lg font-bold text-primary flex items-center gap-3">
          <Filter className="w-4 h-4 text-[var(--gold)]" />
          {dict.shop?.filters || 'Filter Selection'}
        </h2>
        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="px-3 py-3 -my-3 text-xs font-semibold text-[var(--gold)] hover:text-[var(--gold)] transition-colors uppercase tracking-wider"
          >
            {dict.shop?.clearAll || 'Clear All'}
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex flex-col gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[var(--gold)]" />
          {dict.shop?.categories || 'Categories'}
        </h3>
        <ul className="space-y-2 max-h-60 overflow-y-auto no-scrollbar pr-1" role="list">
          <li>
              <button
                onClick={() => handleCategorySelect('')}
                className={cn(
                    'w-full text-left px-4 py-3 rounded text-sm transition-all duration-200',
                  !selectedCategory
                    ? 'bg-[var(--gold-subtle)] text-[var(--gold)] font-bold border border-[var(--gold-border)] shadow-gold'
                    : 'text-secondary hover:bg-surface-raised hover:text-primary border border-transparent',
                    locale === 'ar' && 'text-right'
                )}
              >
                {dict.shop?.allCategories || 'All Specialties'}
              </button>
            </li>
            {CATEGORIES.map((cat) => (
              <li key={cat.slug}>
                <button
                  onClick={() => handleCategorySelect(cat.slug)}
                className={cn(
                  'w-full text-left px-4 py-2.5 rounded text-sm transition-all duration-200 flex items-center justify-between',
                  selectedCategory === cat.slug
                    ? 'bg-[var(--gold-subtle)] text-[var(--gold)] font-bold border border-[var(--gold-border)] shadow-gold'
                    : 'text-secondary hover:bg-surface-raised hover:text-primary border border-transparent',
                    locale === 'ar' && 'flex-row-reverse text-right'
                )}
              >
                <span className="flex items-center gap-3">
                  <span aria-hidden="true">{cat.icon}</span>
                  {locale === 'ar' ? cat.nameAr : cat.name}
                </span>
                <span className="text-xs text-muted font-arabic font-normal tracking-wide">
                  {locale === 'ar' ? cat.name : cat.nameAr}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Product States / Attributes */}
      <div className="flex flex-col gap-3.5">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[var(--gold)]" />
          {dict.shop?.status || 'Product Status'}
        </h3>
        <div className="space-y-5 font-sans">
          {[
            { key: 'fresh' as const, label: dict.shop?.statusOptions?.fresh || 'Fresh Daily', labelAr: dict.shop?.statusOptions?.fresh || 'طازج يومياً' },
            { key: 'frozen' as const, label: dict.shop?.statusOptions?.frozen || 'Premium Frozen', labelAr: dict.shop?.statusOptions?.frozen || 'مجمد فاخر' },
            { key: 'premium' as const, label: dict.shop?.statusOptions?.premium || 'Prime Artisan Cuts', labelAr: dict.shop?.statusOptions?.premium || 'قطع مميزة' },
            { key: 'bestseller' as const, label: dict.shop?.statusOptions?.bestseller || 'Bestselling Selection', labelAr: dict.shop?.statusOptions?.bestseller || 'الأكثر مبيعاً' },
          ].map((item) => (
            <label
              key={item.key}
              className={cn("flex items-center justify-between cursor-pointer group text-sm text-secondary hover:text-primary", locale === 'ar' && "flex-row-reverse text-right")}
            >
              <div className="flex items-center gap-3 select-none">
                <input
                  type="checkbox"
                  checked={selectedStates[item.key]}
                  onChange={() => handleStateToggle(item.key)}
                  className="sr-only"
                />
                <div
                  className={cn(
                    'w-4 h-4 rounded border transition-all duration-200 flex items-center justify-center shrink-0',
                    selectedStates[item.key]
                      ? 'border-[var(--gold)] bg-[var(--gold)] text-[var(--gold-fg)] shadow-gold'
                      : 'border-muted bg-surface-raised group-hover:border-[var(--gold-border)] transition-colors',
                  )}
                >
                  {selectedStates[item.key] && (
                    <svg
                      className="w-2.5 h-2.5 stroke-current"
                      viewBox="0 0 10 10"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M2 5L4 7L8 3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span>{locale === 'ar' ? item.labelAr : item.label}</span>
              </div>
              <span className="text-3xs text-muted font-arabic tracking-wide">{locale === 'ar' ? item.label : item.labelAr}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Slider */}
      <div className="flex flex-col gap-3.5">
        <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-[var(--gold)] flex items-center gap-2">
          <span className="w-1 h-1 rounded-full bg-[var(--gold)]" />
          {dict.shop?.priceRange || 'Price Budget'}
          </h3>
          <span className="font-mono text-xs text-[var(--gold)] font-bold bg-[var(--gold-subtle)] px-3 py-1 rounded border border-[var(--gold-border)]" dir="ltr">
            {dict.shop?.max || 'Max'}: {formatPrice(maxPrice, locale)}
          </span>
        </div>
        <div className="pt-3 font-sans">
          <input
            type="range"
            min="0"
            max="2000"
            step="50"
            value={maxPrice}
            onChange={handlePriceChange}
            className="w-full accent-[var(--gold)] h-1.5 bg-surface-raised border border-muted rounded-lg cursor-pointer appearance-none shadow-inner"
            dir="ltr"
            aria-label={dict.shop?.priceRangeLabel || 'Maximum price filter'}
          />
          <div className="flex justify-between text-2xs text-muted mt-3 font-mono" dir="ltr">
            <span>{formatPrice(0, locale)}</span>
            <span>{formatPrice(2000, locale)}+</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar (Permanent) */}
      <aside className="hidden lg:block w-64 shrink-0 p-8 rounded-xl bg-surface border border-muted shadow-card">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer (Slide-in) */}
      <div
        className={cn(
          'fixed inset-0 z-50 lg:hidden transition-all duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-overlay backdrop-blur-sm" onClick={onClose} />

        {/* Panel */}
        <div
          data-theme="dark"
          className={cn(
            'absolute top-0 bottom-0 w-80 max-w-[85vw] bg-surface p-6 shadow-raised transition-transform duration-300 flex flex-col',
            locale === 'ar' ? 'right-0 border-l border-muted' : 'left-0 border-r border-muted',
            isOpen ? 'translate-x-0' : (locale === 'ar' ? 'translate-x-full' : '-translate-x-full'),
          )}
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className={cn("absolute top-4 p-3 rounded-button bg-surface-raised border border-muted text-secondary hover:text-primary", locale === 'ar' ? 'left-4' : 'right-4')}
            aria-label={dict.shop?.closeFilters || "Close filters"}
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="flex-1 overflow-y-auto no-scrollbar pt-4">
            {sidebarContent}
          </div>
        </div>
      </div>
    </>
  );
}
