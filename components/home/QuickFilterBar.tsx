'use client';

import Link from 'next/link';
import { Sparkles, Beef, Drumstick, Milk, Utensils, Flame } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';

type Chip = {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean }>;
};

export default function QuickFilterBar() {
  const { locale } = useLocale();

  const chips: readonly Chip[] = [
    {
      label: locale === 'ar' ? 'كل المنتجات' : 'All Products',
      href: `/${locale}/categories`,
      icon: Sparkles,
    },
    {
      label: locale === 'ar' ? 'لحوم البقر' : 'Beef',
      href: `/${locale}/animal/beef`,
      icon: Beef,
    },
    {
      label: locale === 'ar' ? 'لحوم الضأن' : 'Lamb',
      href: `/${locale}/animal/lamb`,
      icon: Drumstick,
    },
    {
      label: locale === 'ar' ? 'لحوم العجل' : 'Veal',
      href: `/${locale}/animal/veal`,
      icon: Milk,
    },
    {
      label: locale === 'ar' ? 'الجاموس' : 'Buffalo',
      href: `/${locale}/animal/buffalo`,
      icon: Utensils,
    },
    {
      label: locale === 'ar' ? 'الماعز' : 'Goat',
      href: `/${locale}/animal/goat`,
      icon: Flame,
    },
  ];

  return (
    <div
      className="container-brand"
      aria-label={locale === 'ar' ? 'روابط سريعة' : 'Quick category shortcuts'}
    >
      <div
        className={cn(
          'flex gap-2.5 overflow-x-auto pb-1 -mx-4 px-4 sm:mx-0 sm:px-0',
          'scroll-smooth snap-x snap-mandatory',
          '[scrollbar-width:none] [&::-webkit-scrollbar]:hidden',
        )}
        role="list"
      >
        {chips.map((chip) => {
          const Icon = chip.icon;
          return (
            <Link
              key={chip.href}
              href={chip.href}
              role="listitem"
              className={cn(
                'group inline-flex items-center gap-2 shrink-0 snap-start',
                'min-h-10 px-4 rounded-pill',
                'bg-[var(--bg-surface)] text-[var(--text-secondary)]',
                'border border-[var(--border-subtle)]',
                'hover:border-[var(--gold-border)] hover:text-[var(--gold)] hover:bg-[var(--gold-subtle)]/30',
                'hover:shadow-gold transition-all duration-250',
                'text-sm font-semibold whitespace-nowrap',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]',
              )}
            >
              <Icon
                className="w-3.5 h-3.5 text-[var(--gold)] transition-transform duration-250 group-hover:scale-110"
                aria-hidden
              />
              <span>{chip.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
