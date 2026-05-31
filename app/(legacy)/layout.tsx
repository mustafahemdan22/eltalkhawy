import type { Metadata } from 'next';
import { Libre_Baskerville, Nunito_Sans, Fira_Code, Cairo } from 'next/font/google';
import '../globals.css';
import ConvexClientProvider from '@/components/ConvexClientProvider';
import { ClerkProvider } from '@clerk/nextjs';
import { ThemeProvider } from '@/components/ThemeProvider';

/*
  Font selection — brand.md lane: consumer / food / warm artisanal
  Voice words: warm · artisanal · commanding

  - Libre Baskerville: warm humanist old-style serif. Draws from
    19th-century book type. Evokes provenance, craft, trust — reads
    like a premium label, not a magazine. Not on the reflex list.
  - Nunito Sans: open, rounded humanist sans with high legibility.
    Friendly authority — reads clean at small sizes, warm at display.
    Contrasts structurally with Baskerville (serif + humanist sans).
  - Fira Code: tabular mono for prices, weights, order numbers.
    Precise without being cold.
  - Cairo: Arabic humanist sans — designed for Arabic/Latin bilingual
    use, warm stroke contrast, excellent with dark backgrounds.
*/
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

/* ── Metadata ── */
export const metadata: Metadata = {
  title: {
    default:  'El Talkhawy — Premium Meat',
    template: '%s | El Talkhawy',
  },
  description: 'Premium butcher shop offering the finest selection of fresh and frozen meats, delivered to your door across Egypt.',
  keywords:    ['meat', 'butcher', 'fresh meat', 'beef', 'lamb', 'premium', 'Egypt', 'delivery'],
  authors:     [{ name: 'El Talkhawy' }],
  creator:     'El Talkhawy',
  metadataBase: new URL('https://eltalkhawy.com'),
  openGraph: {
    type:        'website',
    locale:      'en_EG',
    url:         'https://eltalkhawy.com',
    siteName:    'El Talkhawy',
    title:       'El Talkhawy — Premium Meat',
    description: 'Premium butcher shop. Finest quality meat delivered to your door.',
  },
  twitter: {
    card:  'summary_large_image',
    title: 'El Talkhawy — Premium Meat',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

/* ── Root Layout ── */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${baskerville.variable} ${nunitoSans.variable} ${firaCode.variable} ${cairo.variable}`}
      suppressHydrationWarning
    >
      <body className="antialiased font-sans bg-[var(--bg-base)] text-[var(--text-primary)]">
        <ThemeProvider attribute="data-theme" defaultTheme="dark">
          <ClerkProvider dynamic>
            <ConvexClientProvider>
              {children}
            </ConvexClientProvider>
          </ClerkProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
