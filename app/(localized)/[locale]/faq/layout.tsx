import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about El Talkhawy — ordering, delivery, meat quality, storage, preparation tips, and more.',
  openGraph: {
    title: 'FAQ — El Talkhawy Premium Meat',
    description:
      'Answers to common questions about ordering, delivery, and meat preparation.',
  },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
