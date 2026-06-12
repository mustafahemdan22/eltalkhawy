import type { Metadata } from 'next';
import { Libre_Baskerville, Nunito_Sans, Fira_Code, Cairo } from 'next/font/google';
import '@/app/globals.css';
import ConvexClientProvider from '@/components/ConvexClientProvider';
import UserSync from '@/components/UserSync';
import AdminRedirect from '@/components/admin/AdminRedirect';
import { ToastProvider } from '@/components/ui/Toast';
import { ClerkProvider } from '@clerk/nextjs';
import { arSA, enUS } from '@clerk/localizations';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';

const baskerville = Libre_Baskerville({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
  weight: ['400', '700'],
  style: ['normal', 'italic'],
});

const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700', '800'],
});

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500'],
});

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-arabic',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'El Talkhawy — Premium Meat',
    template: '%s | El Talkhawy',
  },
  description: 'Premium butcher shop offering the finest selection of fresh and frozen meats.',
};

export default async function LocalizedLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: localeStr } = await params;
  const locale = localeStr as Locale;
  const dict = await getDictionary(locale);
  const dir = locale === 'ar' ? 'rtl' : 'ltr';

  // In Arabic, we prioritize the Cairo font for sans.
  // In English, we use Nunito Sans. 
  // We can inject a CSS variable or a body class to handle this seamlessly.

  return (
    <html
      lang={locale}
      dir={dir}
      suppressHydrationWarning
      className={`${baskerville.variable} ${nunitoSans.variable} ${firaCode.variable} ${cairo.variable}`}
    >
      <body className="antialiased font-sans bg-[var(--bg-base)] text-[var(--text-primary)] pt-9 pb-[72px] lg:pt-0 lg:pb-0" suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-[var(--gold)] focus:text-[var(--gold-fg)] focus:text-sm focus:font-semibold focus:rounded-button focus:shadow-raised focus:outline-none"
        >
          Skip to main content
        </a>
        <ThemeProvider attribute="data-theme" defaultTheme="dark">
          <LocaleProvider locale={locale} dict={dict}>
            <ClerkProvider dynamic localization={locale === 'ar' ? arSA : enUS}>
              <ConvexClientProvider>
                <UserSync />
                <AdminRedirect />
                <ToastProvider>
                  {children}
                </ToastProvider>
              </ConvexClientProvider>
            </ClerkProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
