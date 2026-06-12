'use client';

import { use } from 'react';
import Link from 'next/link';
import { SignUp } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { ArrowLeft } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';

interface PageProps { params: Promise<{ locale: string }> }

export default function SignUpPage({ params }: PageProps) {
  const { locale } = use(params);
  const { dict } = useLocale();
  const isAr = locale === 'ar';

  return (
    <div className="min-h-screen bg-[var(--bg-base)] flex flex-col">
      <div className="container-brand py-4">
        <Link
          href={`/${locale}`}
          className="inline-flex items-center gap-1.5 text-xs uppercase tracking-wider text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors"
        >
          <ArrowLeft className={isAr ? 'rotate-180 w-3.5 h-3.5' : 'w-3.5 h-3.5'} />
          {dict.categoryDetail?.home || 'Home'}
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-20">
        <SignUp
          appearance={{
            baseTheme: dark,
            elements: {
              rootBox: 'mx-auto w-full max-w-md',
              card: 'bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-card',
              headerTitle: 'font-display text-[var(--text-primary)]',
              headerSubtitle: 'text-[var(--text-secondary)]',
              formButtonPrimary: 'bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)]',
              formFieldLabel: 'text-[var(--text-secondary)]',
              formFieldInput: 'bg-[var(--bg-base)] border-[var(--border-default)] text-[var(--text-primary)]',
              footerActionLink: 'text-[var(--gold)] hover:text-[var(--gold-hover)]',
              dividerLine: 'bg-[var(--border-subtle)]',
              dividerText: 'text-[var(--text-muted)]',
              socialButtonsBlockButton: 'border-[var(--border-default)] text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)]',
              identityPreviewText: 'text-[var(--text-primary)]',
              identityPreviewEditButton: 'text-[var(--gold)]',
            },
          }}
          routing="path"
          path={`/${locale}/sign-up`}
          signInUrl={`/${locale}/sign-in`}
        />
      </div>
    </div>
  );
}
