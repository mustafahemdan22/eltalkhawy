'use client';

import React from 'react';
import { useLocale } from '@/components/LocaleProvider';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
  limitOptions?: number[];
  className?: string;
}

export function Pagination({
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
  limitOptions = [12, 24, 48],
  className,
}: PaginationProps) {
  const { locale, dict } = useLocale();
  const isRtl = locale === 'ar';
  const currentPage = Math.min(Math.max(1, page), Math.max(1, totalPages));

  const t = dict.shop?.pagination ?? {
    previous: isRtl ? 'السابق' : 'Previous',
    next: isRtl ? 'التالي' : 'Next',
    showing: isRtl ? 'عرض {start} إلى {end} من إجمالي {total} قطعة' : 'Showing {start} to {end} of {total} cuts',
    limitLabel: isRtl ? 'عرض' : 'Show',
    pageOf: isRtl ? 'صفحة {page} من {total}' : 'Page {page} of {total}',
  };

  const getPageRange = () => {
    const delta = 1; // Number of pages to show before/after current
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let prevIndex: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (prevIndex !== undefined) {
        if (i - prevIndex === 2) {
          rangeWithDots.push(prevIndex + 1);
        } else if (i - prevIndex > 2) {
          rangeWithDots.push('...');
        }
      }
      rangeWithDots.push(i);
      prevIndex = i;
    }

    return rangeWithDots;
  };

  const handlePrev = () => {
    if (currentPage > 1) onPageChange(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) onPageChange(currentPage + 1);
  };

  if (total === 0 || totalPages <= 1) {
    return null;
  }

  // Calculate items bounds
  const startItem = (currentPage - 1) * limit + 1;
  const endItem = Math.min(currentPage * limit, total);

  // Format the showing message
  const showingText = t.showing
    .replace('{start}', String(startItem))
    .replace('{end}', String(endItem))
    .replace('{total}', String(total));

  // Format page indicator for mobile
  const mobilePageText = t.pageOf
    .replace('{page}', String(currentPage))
    .replace('{total}', String(totalPages));

  // Icons flip automatically for RTL layout
  const PrevIcon = isRtl ? ChevronRight : ChevronLeft;
  const NextIcon = isRtl ? ChevronLeft : ChevronRight;

  return (
    <div
      className={cn(
        'flex flex-col md:flex-row items-center justify-between gap-6 py-6 border-t border-[var(--border-subtle)] font-sans',
        className
      )}
      role="navigation"
      aria-label="Pagination Navigation"
    >
      {/* Items Range / Text */}
      <div className="text-sm text-[var(--text-secondary)] font-normal order-3 md:order-1">
        {showingText}
      </div>

      {/* Pages Navigation */}
      <div className="flex items-center gap-2 order-1 md:order-2">
        {/* Previous Button */}
        <button
          onClick={handlePrev}
          disabled={currentPage <= 1}
          aria-label={t.previous}
          className={cn(
            'inline-flex items-center justify-center gap-1 min-h-11 px-4 rounded-button border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-secondary)] transition-all select-none cursor-pointer',
            'hover:text-[var(--text-primary)] hover:border-[var(--gold)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'
          )}
        >
          <PrevIcon className="w-4 h-4" />
          <span className="hidden sm:inline">{t.previous}</span>
        </button>

        {/* Numeric Page Buttons (Desktop only) */}
        <div className="hidden sm:flex items-center gap-1.5">
          {getPageRange().map((p, index) => {
            if (p === '...') {
              return (
                <span
                  key={`dots-${index}`}
                  className="flex items-center justify-center w-11 h-11 text-[var(--text-muted)]"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </span>
              );
            }

            const isCurrent = p === currentPage;
            return (
              <button
                key={`page-${p}`}
                onClick={() => onPageChange(p as number)}
                aria-current={isCurrent ? 'page' : undefined}
                aria-label={`Go to page ${p}`}
                className={cn(
                  'flex items-center justify-center w-11 h-11 rounded-button text-sm font-semibold transition-all cursor-pointer',
                  isCurrent
                    ? 'bg-[var(--gold)] text-[var(--gold-fg)] font-bold shadow-gold'
                    : 'bg-transparent text-[var(--text-secondary)] border border-transparent hover:border-[var(--gold)]/40 hover:bg-[var(--bg-surface-hover)] hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]'
                )}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Compact Page Number (Mobile only) */}
        <span className="sm:hidden text-sm font-semibold text-[var(--text-primary)] px-3 py-2 bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-button">
          {mobilePageText}
        </span>

        {/* Next Button */}
        <button
          onClick={handleNext}
          disabled={currentPage >= totalPages}
          aria-label={t.next}
          className={cn(
            'inline-flex items-center justify-center gap-1 min-h-11 px-4 rounded-button border border-[var(--border-default)] bg-[var(--bg-surface)] text-sm font-semibold text-[var(--text-secondary)] transition-all select-none cursor-pointer',
            'hover:text-[var(--text-primary)] hover:border-[var(--gold)] hover:bg-[var(--bg-surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
            'disabled:opacity-40 disabled:cursor-not-allowed disabled:pointer-events-none'
          )}
        >
          <span className="hidden sm:inline">{t.next}</span>
          <NextIcon className="w-4 h-4" />
        </button>
      </div>

      {/* Dynamic Sizing Control */}
      {onLimitChange && (
        <div className="flex items-center gap-2.5 order-2 md:order-3">
          <label
            htmlFor="pagination-limit"
            className="text-xs text-[var(--text-secondary)] font-medium uppercase tracking-wider"
          >
            {t.limitLabel}
          </label>
          <div className="relative">
            <select
              id="pagination-limit"
              value={limit}
              onChange={(e) => onLimitChange(Number(e.target.value))}
              className={cn(
                'appearance-none min-h-10 px-3.5 pe-8 rounded-button text-xs font-semibold bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--text-primary)] transition-all cursor-pointer',
                'hover:border-[var(--gold)]/60 focus:outline-none focus:ring-2 focus:ring-[var(--gold)] focus:border-[var(--gold)]'
              )}
            >
              {limitOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className={cn(
              "absolute top-1/2 -translate-y-1/2 pointer-events-none",
              isRtl ? "left-2.5" : "right-2.5"
            )}>
              <svg className="w-3.5 h-3.5 text-[var(--text-secondary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
export default Pagination;
