'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CATEGORIES } from '@/lib/constants';
import { ArrowRight, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useLocale } from '@/components/LocaleProvider';

const CATEGORY_IMAGES: Record<string, string> = {
  'beef': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
  'buffalo': 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
  'lamb': 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80',
  'goat': 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=600&q=80',
  'veal': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'bbq-cuts': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
  'premium-cuts': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&q=80',
  'organ-meats': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80',
  'frozen': 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=600&q=80',
  'offers': 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80',
};

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function CategoriesPage() {
  const { locale } = useLocale();

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-base)] py-16 md:py-24">
        <div className="container-brand font-sans">

          {/* Header */}
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
              Explore Our Collection
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
              Premium Meat Categories
            </h1>
            <p className="text-base text-secondary mt-5 leading-relaxed font-light">
              Discover the full breadth of El Talkhawy's master butcher offerings. From fresh prime cuts of grain-fed beef to premium grill-ready selections.
            </p>
          </div>

          {/* Grid */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="show"
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            {CATEGORIES.map((cat: any) => {
              const img = CATEGORY_IMAGES[cat.slug];
              const subcats = 'subcategories' in cat ? cat.subcategories : [];

              return (
                <motion.div
                  key={cat.slug}
                  variants={cardVariants}
                  className="group rounded-2xl bg-surface ring-1 ring-inset ring-[var(--border-muted)] overflow-hidden shadow-lg hover:ring-black/50 transition-all duration-300 flex flex-col h-full"
                >
                  {/* Category Image Header */}
                  <div className="relative aspect-[16/9] w-full bg-surface-raised overflow-hidden">
                    {img && (
                      <Image
                        src={img}
                        alt={cat.name}
                        fill
                        sizes="(max-width:768px) 100vw, (max-width:1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
                      />
                    )}
                    {/* Overlay gradient */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

                    {/* Icon and Titles */}
                    <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                      <div>
                        <span className="text-[var(--gold)] text-2xs font-semibold tracking-widest uppercase block mb-1">
                          {cat.icon} Specialty Cut
                        </span>
                        <h2 className="font-display text-xl md:text-2xl font-bold text-primary flex items-center gap-2">
                          {locale === 'ar' ? cat.nameAr : cat.name}
                          <span className="font-arabic text-primary/70 text-sm font-medium">({locale === 'ar' ? cat.name : cat.nameAr})</span>
                        </h2>
                      </div>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-7 flex flex-col flex-1 gap-7">
                    <p className="text-sm text-secondary font-light leading-relaxed">
                      {locale === 'ar' ? cat.descriptionAr || cat.description : cat.description}
                    </p>

                    {/* Subcategories list */}
                    {subcats && subcats.length > 0 && (
                      <div className="flex flex-col gap-4">
                        <span className="text-sm uppercase tracking-wider text-muted font-semibold">
                          Featured Sub-Cuts
                        </span>
                        <div className="flex flex-wrap gap-2">
                          {subcats.map((sub: any) => (
                            <Link
                              key={sub.slug}
                              href={`/${locale}/shop?category=${cat.slug}&sub=${sub.slug}`}
                              className="text-3xs px-2.5 py-1 rounded bg-surface border border-muted text-primary hover:text-[var(--gold)] hover:border-[var(--gold)]/20 transition-all font-mono"
                            >
                              {locale === 'ar' ? sub.nameAr : sub.name}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* CTA Footer */}
                    <div className="mt-auto pt-5 border-t border-muted flex items-center justify-between">
                      <span className="text-sm text-muted font-mono">
                        EL TALKHAWY BUTCHERY
                      </span>
                      <Link
                        href={`/${locale}/categories/${cat.slug}`}
                        className="flex items-center gap-2 text-sm text-[var(--gold)] group-hover:text-[var(--gold-hover)] font-medium transition-colors cursor-pointer"
                      >
                        Explore Selection
                        <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

        </div>
      </main>

      <Footer />
    </>
  );
}
