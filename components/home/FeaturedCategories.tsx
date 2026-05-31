'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';

const CATEGORY_IMAGES: Record<string, string> = {
  beef: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
  buffalo: 'https://images.unsplash.com/photo-1529193591184-b1d58069ecdd?w=600&q=80',
  lamb: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=600&q=80',
  goat: 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98?w=600&q=80',
  veal: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80',
  'bbq-cuts': 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80',
  'premium-cuts': 'https://images.unsplash.com/photo-1546833998-877b37c2e5c6?w=600&q=80',
  'organ-meats': 'https://images.unsplash.com/photo-1529042410759-befb1204b468?w=600&q=80',
  frozen: 'https://images.unsplash.com/photo-1572441713132-51c75654db73?w=600&q=80',
  offers: 'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?w=600&q=80',
};

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5 },
  },
};

export default function FeaturedCategories() {
  const { locale, dict } = useLocale();

  return (
    <section
      className="section-gap bg-[var(--bg-base)]"
      aria-labelledby="categories-heading"
    >
      <div className="container-brand">
        <div className="mb-12 flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
          <div>
            <span className="section-label mb-4 block text-[var(--gold)]">
              {dict.home?.categories.label}
            </span>

            <h2
              id="categories-heading"
              className="font-display text-3xl font-bold text-[var(--text-primary)] sm:text-4xl"
            >
              {dict.home?.categories.title}
            </h2>

            <p className="mt-3 max-w-md text-base leading-relaxed text-[var(--text-secondary)]">
              {dict.home?.categories.subtitle}
            </p>
          </div>

          <Link
            href={`/${locale}/categories`}
            className="flex shrink-0 items-center gap-2 whitespace-nowrap text-sm font-medium text-[var(--gold)] transition-colors hover:text-[var(--gold-hover)]"
            aria-label={locale === 'ar' ? 'عرض كل التصنيفات' : 'View all categories'}
          >
            {dict.home?.categories.allCategories}
            <ArrowRight
              className={locale === 'ar' ? 'h-4 w-4 rotate-180' : 'h-4 w-4'}
              aria-hidden="true"
            />
          </Link>
        </div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px', amount: 0.2 }}
          className="grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-4 md:gap-6"
        >
          {CATEGORIES.map((cat) => {
            const img = CATEGORY_IMAGES[cat.slug];
            const isWide = cat.slug === 'beef' || cat.slug === 'premium-cuts';

            return (
              <motion.div
                key={cat.slug}
                variants={cardVariants}
                className={cn(isWide && 'col-span-2 sm:col-span-2')}
              >
                <Link
                  href={`/${locale}/categories/${cat.slug}`}
                  className="group relative block overflow-hidden rounded-card"
                  aria-label={
                    locale === 'ar'
                      ? `تصفح ${cat.nameAr}`
                      : `Browse ${cat.name}`
                  }
                >
                  <div
                    className={cn(
                      'relative img-zoom',
                      isWide
                        ? 'aspect-[2/1.4] sm:aspect-[2/1.3]'
                        : 'aspect-category'
                    )}
                  >
                    {img ? (
                      <Image
                        src={img}
                        alt={locale === 'ar' ? cat.nameAr : cat.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.07]"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--bg-surface-raised)]">
                        <span className="text-4xl" aria-hidden="true">
                          {cat.icon}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 overlay-card" aria-hidden="true" />

                    <div
                      className="absolute inset-0 rounded-card ring-1 ring-inset ring-[var(--border-subtle)] transition-all duration-300 group-hover:ring-black/50"
                      aria-hidden="true"
                    />

                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="flex items-center gap-2">
                      <span
                        className="text-base leading-none"
                        aria-hidden="true"
                      >
                        {cat.icon}
                      </span>

                      <span className="truncate text-sm font-semibold leading-tight text-white transition-colors group-hover:text-[var(--gold)]">
                        {locale === 'ar' ? cat.nameAr : cat.name}
                      </span>
                    </div>

                    {isWide && (
                      <p className="mt-1 line-clamp-1 text-sm text-slate-300">
                        {locale === 'ar'
                          ? cat.descriptionAr
                          : cat.description}
                      </p>
                    )}
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}