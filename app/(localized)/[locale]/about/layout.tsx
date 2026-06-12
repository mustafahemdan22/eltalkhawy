import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    'Learn about El Talkhawy — our heritage, our commitment to premium quality, and our passion for delivering the finest meat cuts across Egypt.',
  openGraph: {
    title: 'About El Talkhawy — Premium Meat Butcher',
    description:
      'Our heritage, our commitment to premium quality, and our passion for the finest meat.',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
