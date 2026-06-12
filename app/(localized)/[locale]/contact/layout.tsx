import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description:
    'Get in touch with El Talkhawy. Visit our boutique, call our helpline, or send us a message. We are here to serve you the finest meat in Egypt.',
  openGraph: {
    title: 'Contact El Talkhawy — Premium Meat Butcher',
    description:
      'Visit our boutique, call our helpline, or send us a message.',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
