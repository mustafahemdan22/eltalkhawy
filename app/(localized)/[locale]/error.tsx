'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

export default function LocaleError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const pathname = usePathname();
  const locale = pathname?.split('/')[1] === 'ar' ? 'ar' : 'en';
  const isAr = locale === 'ar';

  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('App error boundary:', error);
    }
  }, [error]);

  const t = isAr
    ? {
        eyebrow: 'حدث خطأ غير متوقع',
        title: 'نعتذر، واجهنا مشكلة',
        body: 'فشل تحميل هذه الصفحة. حاول مجدداً، وإن استمرّ الخطأ تواصل مع فريق الدعم.',
        retry: 'إعادة المحاولة',
        home: 'الصفحة الرئيسية',
        digest: 'رمز الخطأ',
      }
    : {
        eyebrow: 'Unexpected error',
        title: 'Something went wrong',
        body: 'We could not load this page. Please try again, and reach out to support if the issue persists.',
        retry: 'Try again',
        home: 'Back to home',
        digest: 'Reference',
      };

  return (
    <main
      id="main-content"
      className="min-h-[70vh] flex items-center justify-center px-4 py-16"
    >
      <div className="relative max-w-xl w-full text-center">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_center,var(--error)/10,transparent_60%)] opacity-70"
        />
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-[var(--bg-surface)] border border-[var(--border-default)] text-[var(--error)] shadow-card mb-8">
          <AlertTriangle className="w-9 h-9" strokeWidth={1.5} />
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
        {error?.digest && (
          <p className="text-xs text-[var(--text-muted)] mb-6 font-mono">
            {t.digest}: {error.digest}
          </p>
        )}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 text-sm font-medium rounded-button bg-[var(--brand)] text-[var(--brand-fg)] hover:bg-[var(--brand-hover)] shadow-card hover:shadow-raised transition-all duration-250"
          >
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            {t.retry}
          </button>
          <Link
            href={`/${locale}`}
            className="inline-flex items-center justify-center gap-2 h-12 px-7 text-sm font-medium rounded-button bg-transparent border border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] hover:border-[var(--border-hover)] transition-all duration-250"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            {t.home}
          </Link>
        </div>
      </div>
    </main>
  );
}
