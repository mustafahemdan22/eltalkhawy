'use client';

import Link from 'next/link';
import Image from 'next/image';
import { motion, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { CATEGORIES, CATEGORY_IMAGES } from '@/lib/constants';
import { cn, cloudinaryImageUrl } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';

function formatPrice(value: number, locale: 'en' | 'ar'): string {
  const rounded = Math.round(value);
  return locale === 'ar'
    ? `${rounded.toLocaleString('ar-EG')} ج.م`
    : `EGP ${rounded.toLocaleString()}`;
}

export default function FeaturedCategories() {
  const { locale, dict } = useLocale();
  const stats = useQuery(api.products.categoryStats);
  const shouldReduceMotion = useReducedMotion();

  const statsBySlug = new Map(stats?.map((s) => [s.slug, s]) ?? []);

  const containerVariants = shouldReduceMotion
    ? { hidden: {}, show: {} }
    : {
        hidden: {},
        show: { transition: { staggerChildren: 0.06 } },
      };
  const cardVariants = shouldReduceMotion
    ? { hidden: {}, show: {} }
    : { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.45 } } };

  return (
    <section
      className="section-gap bg-[var(--bg-base)]"
      aria-labelledby="categories-heading"
    >
      <div className="container-brand">
        {/* Section header — standardized pattern */}
        <div className="mb-12 flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <div className="w-16 h-px bg-[var(--gold)] mb-4" aria-hidden="true" />
            <h2
              id="categories-heading"
              className="font-display text-3xl sm:text-4xl font-bold text-primary"
            >
              {dict.home?.categories.title}
            </h2>
            <p className="mt-3 max-w-xl text-base leading-relaxed text-secondary">
              {dict.home?.categories.subtitle}
            </p>
          </div>

          <Link
            href={`/${locale}/categories`}
            className={cn(
              'inline-flex items-center gap-2 min-h-11 px-4 rounded-button text-sm font-semibold',
              'text-[var(--gold)] hover:text-[var(--gold-hover)] hover:bg-[var(--gold-subtle)]/40',
              'transition-colors whitespace-nowrap shrink-0 self-start sm:self-end',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]/50',
            )}
            aria-label={locale === 'ar' ? 'عرض كل التصنيفات' : 'View all categories'}
          >
            {dict.home?.categories.allCategories}
            <ArrowRight
              className={locale === 'ar' ? 'h-4 w-4 rotate-180' : 'h-4 w-4'}
              aria-hidden="true"
            />
          </Link>
        </div>

        {/* Uniform grid — 2 cols mobile, 3 cols sm, 4 cols lg+; consistent 4:5 aspect for all cards */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px', amount: 0.2 }}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5 md:gap-6"
        >
          {CATEGORIES.map((cat) => {
            const publicId = CATEGORY_IMAGES[cat.slug];
            const img = publicId ? cloudinaryImageUrl(publicId, { width: 600, height: 750, crop: 'fill', gravity: 'auto' }) : '';
            const isAnimal = ['beef', 'buffalo', 'lamb', 'goat', 'veal'].includes(cat.slug);
            const categoryHref = isAnimal ? `/${locale}/animal/${cat.slug}` : `/${locale}/categories/${cat.slug}`;
            const catStats = statsBySlug.get(cat.slug);
            const productCount = catStats?.count;
            const priceLabel = catStats
              ? catStats.minPrice === catStats.maxPrice
                ? formatPrice(catStats.minPrice, locale)
                : `${formatPrice(catStats.minPrice, locale)} – ${formatPrice(catStats.maxPrice, locale)}`
              : null;

            return (
              <motion.div key={cat.slug} variants={cardVariants}>
                <Link
                  href={categoryHref}
                  className={cn(
                    'group relative block overflow-hidden rounded-card card-border-glow',
                    'bg-surface ring-1 ring-inset ring-[var(--border-muted)]',
                    'hover:ring-[var(--gold)]/40 transition-all duration-300',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)]',
                  )}
                  aria-label={
                    locale === 'ar'
                      ? `تصفح ${cat.nameAr}`
                      : `Browse ${cat.name}`
                  }
                >
                    <div className="relative img-zoom product-img-frame aspect-[4/5]">
                      {img ? (
                        <Image
                          src={img}
                          alt={locale === 'ar' ? cat.nameAr : cat.name}
                          fill
                          loading="lazy"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className="object-cover object-center transition-transform duration-700 ease-out group-hover:scale-[1.08]"
                        />
                      ) : (
                      <div className="flex h-full w-full items-center justify-center bg-[var(--bg-surface-raised)]">
                        <span className="text-4xl" aria-hidden="true">
                          {cat.icon}
                        </span>
                      </div>
                    )}

                    <div
                      className="absolute inset-0 bg-gradient-to-t from-[var(--bg-overlay-dark)]/90 via-[var(--bg-overlay-dark)]/35 to-transparent opacity-85 transition-opacity duration-300 group-hover:opacity-95"
                      aria-hidden="true"
                    />

                    <div
                      className="absolute inset-0 rounded-card ring-1 ring-inset ring-[var(--border-subtle)] transition-all duration-300 group-hover:ring-[var(--gold)]/30"
                      aria-hidden="true"
                    />

                    {productCount !== undefined && productCount > 0 && (
                      <div
                        className="absolute top-3 right-3 inline-flex items-center gap-1.5 rounded-pill bg-[var(--bg-overlay-dark)]/70 backdrop-blur-sm border border-[var(--border-subtle)] px-2.5 py-1 text-2xs font-semibold text-[var(--text-primary)]"
                        aria-label={
                          locale === 'ar'
                            ? `${productCount} منتج`
                            : `${productCount} products`
                        }
                      >
                        <span aria-hidden="true">{cat.icon}</span>
                        <span className="font-mono">{productCount}</span>
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-4" data-theme="dark">
                    <div className="flex items-center gap-2">
                      <span className="text-base leading-none" aria-hidden="true">
                        {cat.icon}
                      </span>
                      <span className="truncate text-sm font-bold leading-tight text-[var(--text-primary)] transition-colors group-hover:text-[var(--gold)]">
                        {locale === 'ar' ? cat.nameAr : cat.name}
                      </span>
                    </div>
                    <p className="mt-1 line-clamp-1 text-2xs text-[var(--text-secondary)] font-arabic">
                      {locale === 'ar' ? cat.name : cat.nameAr}
                    </p>
                    {priceLabel && (
                      <p className="mt-1.5 text-2xs font-mono font-semibold text-[var(--gold)] tracking-wide">
                        {priceLabel}
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
