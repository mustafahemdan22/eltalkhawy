'use client';

import Link from 'next/link';
import { Home, Search, ArrowLeft, AlertCircle } from 'lucide-react';
import { usePathname } from 'next/navigation';

export default function LocaleNotFound() {
  const pathname = usePathname();
  const locale = pathname?.startsWith('/ar') ? 'ar' : 'en';
  const isAr = locale === 'ar';
  const homeHref = `/${locale}`;

  const t = isAr
    ? {
        eyebrow: 'خطأ ٤٠٤',
        title: 'لم نعثر على ما تبحث عنه',
        body: 'ربما تم نقل هذه الصفحة أو حذفها، أو أن الرابط غير صحيح. عد إلى الصفحة الرئيسية أو استكشف أحدث منتجاتنا.',
        home: 'الصفحة الرئيسية',
        back: 'العودة للخلف',
        shop: 'تسوّق الآن',
      }
    : {
        eyebrow: 'Error 404',
        title: 'We could not find that page',
        body: 'The link may be broken, or the page may have been moved. Head back home, or browse our latest selection.',
        home: 'Back to home',
        back: 'Go back',
        shop: 'Shop the catalog',
      };

  return (
    <main
      id="main-content"
      className="min-h-[70vh] flex items-center justify-center px-4 py-16"
    >
      <div className="relative max-w-xl w-full text-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--gold-subtle),transparent_60%)] opacity-70"
        />
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--gold)] shadow-card mb-8">
          <AlertCircle className="w-9 h-9" strokeWidth={1.5} />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] mb-3">
          {t.eyebrow}
        </p>
        <h1 className="font-display text-4xl md:text-5xl text-[var(--text-primary)] leading-tight mb-4">
          {t.title}
        </h1>
        <p className="text-[var(--text-secondary)] text-base md:text-lg leading-relaxed mb-10 max-w-md mx-auto">
          {t.body}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href={homeHref}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 text-sm font-medium rounded-button bg-[var(--brand)] text-[var(--brand-fg)] hover:bg-[var(--brand-hover)] shadow-card hover:shadow-raised transition-all duration-250"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            {t.home}
          </Link>
          <Link
            href={`/${locale}/categories`}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 text-sm font-medium rounded-button bg-transparent border border-[var(--gold-border)] text-[var(--gold)] hover:border-[var(--gold-hover)] hover:bg-[var(--gold-subtle)] transition-all duration-250"
          >
            <Search className="w-4 h-4" aria-hidden="true" />
            {t.shop}
          </Link>
          <button
            type="button"
            onClick={() => {
              if (typeof window !== 'undefined') window.history.back();
            }}
            className="inline-flex items-center justify-center gap-2 h-12 px-6 text-sm font-medium rounded-button bg-transparent text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-all duration-250"
          >
            <ArrowLeft className="w-4 h-4 rtl:rotate-180" aria-hidden="true" />
            {t.back}
          </button>
        </div>
      </div>
    </main>
  );
}
