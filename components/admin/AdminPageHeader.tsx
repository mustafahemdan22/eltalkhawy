'use client';

import Link from 'next/link';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPageHeaderProps {
  title:       string;
  subtitle?:   string;
  actions?:    React.ReactNode;
  back?:       { href: string; label: string };
  className?:  string;
}

export default function AdminPageHeader({
  title,
  subtitle,
  actions,
  back,
  className,
}: AdminPageHeaderProps) {
  const { locale } = useLocale();
  const Chevron = locale === 'ar' ? ChevronRight : ChevronLeft;

  return (
    <header className={cn('mb-6 lg:mb-8 flex flex-col gap-4', className)}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {back && (
            <Link
              href={back.href}
              className="mb-2 inline-flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
            >
              <Chevron className="h-3.5 w-3.5" aria-hidden />
              {back.label}
            </Link>
          )}
          <h1 className="font-display text-2xl sm:text-3xl font-bold text-[var(--text-primary)] leading-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-[var(--text-secondary)] max-w-2xl">{subtitle}</p>
          )}
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </header>
  );
}
