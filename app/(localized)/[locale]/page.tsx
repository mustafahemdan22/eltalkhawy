import type { Metadata } from 'next';
import Navbar            from '@/components/layout/Navbar';
import Footer            from '@/components/layout/Footer';
import HeroSection       from '@/components/home/HeroSection';
import FeaturedCategories from '@/components/home/FeaturedCategories';
import QuickFilterBar    from '@/components/home/QuickFilterBar';
import PromoBanners      from '@/components/home/PromoBanners';
import BestSellers       from '@/components/home/BestSellers';
import PremiumCutsSection from '@/components/home/PremiumCutsSection';
import BBQSection        from '@/components/home/BBQSection';
import WhyChooseUs       from '@/components/home/WhyChooseUs';
import Testimonials      from '@/components/home/Testimonials';
import NewsletterSection from '@/components/home/NewsletterSection';

export const metadata: Metadata = {
  title: 'El Talkhawy — Premium Meat Delivered Fresh',
  description:
    'Premium butcher shop offering the finest selection of fresh red meats — beef, lamb, veal, and more — delivered same-day across Egypt.',
  openGraph: {
    title:       'El Talkhawy — Premium Meat Delivered Fresh',
    description: 'Finest quality meat butchered daily. Same-day delivery across Egypt.',
    type:        'website',
  },
};

export default function HomePage() {
  return (
    <>
      <Navbar />

      <main id="main-content" className="bg-base text-primary">
        {/* 1 — Cinematic full-viewport hero */}
        <HeroSection />

        {/* 2 — Category grid */}
        <FeaturedCategories />

        {/* 3 — Quick chip shortcuts to each animal */}
        <QuickFilterBar />

        {/* 4 — Promo banners */}
        <PromoBanners />

        {/* 5 — Best sellers product grid */}
        <BestSellers />

        {/* 6 — Premium & rare cuts editorial section */}
        <PremiumCutsSection />

        {/* 7 — Grill-ready cuts */}
        <BBQSection />

        {/* 8 — Trust / Why choose us */}
        <WhyChooseUs />

        {/* 9 — Customer testimonials */}
        <Testimonials />

        {/* 10 — Newsletter */}
        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}
