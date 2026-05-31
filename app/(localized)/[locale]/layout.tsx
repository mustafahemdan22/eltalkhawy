import type { Metadata } from 'next';
import { Libre_Baskerville, Nunito_Sans, Fira_Code, Cairo } from 'next/font/google';
import '@/app/globals.css';
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LocaleProvider } from '@/components/LocaleProvider';
import { getDictionary } from '@/lib/dictionaries';
import type { Locale } from '@/i18n-config';

const baskerville = Libre_Baskerville({
  subsets:  ['latin'],
  variable: '--font-display',
  display:  'swap',
  weight:   ['400', '700'],
  style:    ['normal', 'italic'],
});

const nunitoSans = Nunito_Sans({
  subsets:  ['latin'],
  variable: '--font-sans',
  display:  'swap',
  weight:   ['300', '400', '500', '600', '700', '800'],
});

const firaCode = Fira_Code({
  subsets:  ['latin'],
  variable: '--font-mono',
  display:  'swap',
  weight:   ['400', '500'],
});

const cairo = Cairo({
  subsets:  ['arabic', 'latin'],
  variable: '--font-arabic',
  display:  'swap',
  weight:   ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default:  'El Talkhawy — Premium Meat',
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
      <body className="antialiased font-sans bg-[var(--bg-base)] text-[var(--text-primary)]">
        <ThemeProvider attribute="data-theme" defaultTheme="dark">
          <LocaleProvider locale={locale} dict={dict}>
            <ClerkProvider dynamic>
              <ConvexClientProvider>
                {children}
              </ConvexClientProvider>
            </ClerkProvider>
          </LocaleProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
