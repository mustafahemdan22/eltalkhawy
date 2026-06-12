'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from '@/components/LocaleProvider';

export default function OrdersRedirectPage() {
  const { locale } = useLocale();
  const router = useRouter();

  useEffect(() => {
    router.replace(`/${locale}/account`);
  }, [locale, router]);

  return (
    <main id="main-content" className="min-h-screen flex items-center justify-center bg-[var(--bg-base)]">
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 border-2 border-[var(--gold)]/20 border-t-[var(--gold)] rounded-full animate-spin" />
        <p className="text-sm text-[var(--text-secondary)]">
          {locale === 'ar' ? 'جاري تحميل الطلبات...' : 'Loading orders...'}
        </p>
      </div>
    </main>
  );
}
