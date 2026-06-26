'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';
import { cloudinaryImageUrl, formatPrice } from '@/lib/utils';

const PLACEHOLDER = cloudinaryImageUrl('eltalkhawy/general/placeholder', { preset: 'productCard' });
const BBQ_BG_1    = cloudinaryImageUrl('eltalkhawy/categories/bbq-cuts/products/shish-tawook', { width: 800, height: 540, crop: 'fill', gravity: 'auto' });
const BBQ_BG_2    = cloudinaryImageUrl('eltalkhawy/categories/beef/brisket/products/beef-brisket', { width: 800, height: 540, crop: 'fill', gravity: 'auto' });

export default function BBQSection() {
  const { locale, dict } = useLocale();
  const bbqProducts = useQuery(api.products.list, { isBBQ: true });
  const topBBQ = bbqProducts?.slice(0, 3) ?? [];
  const shouldReduceMotion = useReducedMotion();

  const initialLeft = shouldReduceMotion ? {} : { opacity: 0, x: locale === 'ar' ? 32 : -32 };
  const animateLeft = shouldReduceMotion ? {} : { opacity: 1, x: 0 };
  const transitionLeft = shouldReduceMotion ? {} : { duration: 0.65 };

  const initialRight = shouldReduceMotion ? {} : { opacity: 0, x: locale === 'ar' ? -32 : 32 };
  const animateRight = shouldReduceMotion ? {} : { opacity: 1, x: 0 };
  const transitionRight = shouldReduceMotion ? {} : { duration: 0.65, delay: 0.15 };

  return (
    <section
      className="relative overflow-hidden"
      aria-labelledby="bbq-heading"
    >
      <div className="absolute inset-0 bg-base" aria-hidden="true" />
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 60% at 60% 50%, var(--brand) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container-brand section-gap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: text block */}
          <motion.div
            initial={initialLeft}
            whileInView={shouldReduceMotion ? undefined : animateLeft}
            viewport={{ once: true }}
            transition={transitionLeft}
          >
            <h2
              id="bbq-heading"
              className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight"
            >
              {dict.home?.bbqSection.title}{' '}
              <span className="text-brand-emphasis italic">{dict.home?.bbqSection.titleHighlight}</span>
            </h2>
            <p className="mt-5 text-lg text-secondary leading-relaxed max-w-md">
              {dict.home?.bbqSection.description}
            </p>

            {/* Product mini-list */}
            {bbqProducts === undefined ? (
              <div className="mt-10 space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-5 p-5 rounded-lg bg-surface border border-muted animate-pulse">
                    <div className="w-14 h-14 rounded-lg bg-surface-raised/80 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-surface-raised/80 rounded w-3/4" />
                      <div className="h-3 bg-surface-raised/80 rounded w-1/2" />
                    </div>
                    <div className="h-5 bg-surface-raised/80 rounded w-16 shrink-0" />
                  </div>
                ))}
              </div>
            ) : topBBQ.length === 0 ? null : (
              <ul className="mt-10 space-y-4" aria-label="Grill-ready products">
                {topBBQ.map((p) => {
                  const firstPrice = p.variants[0]?.price ?? p.basePrice;
                  return (
                    <li key={p._id}>
                      <Link
                        href={`/${locale}/shop/${p.slug}`}
                        className="group flex items-center gap-5 p-5 rounded-lg bg-surface ring-1 ring-inset ring-[var(--border-muted)] hover:ring-[var(--gold)]/50 hover:shadow-gold hover:bg-surface-raised transition-all duration-300"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-raised">
                           <Image
                             src={p.images[0] ? cloudinaryImageUrl(p.images[0], { width: 112, height: 112, crop: 'fill', gravity: 'auto' }) : PLACEHOLDER}
                             alt={locale === 'ar' ? p.nameAr : p.name}
                             width={56}
                             height={56}
                             loading="lazy"
                             className="w-full h-full object-cover"
                           />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-base font-semibold text-primary truncate group-hover:text-[var(--gold)] transition-colors">
                            {locale === 'ar' ? p.nameAr : p.name}
                          </p>
                          <p className="text-sm text-secondary">{locale === 'ar' ? p.name : p.nameAr}</p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="font-mono text-primary font-medium tracking-tight group-hover:text-[var(--gold)] transition-colors">
                            {formatPrice(firstPrice, locale)}
                          </span>
                          <span className="text-2xs text-muted">
                            {dict.shop?.per} {p.variants[0]?.weight ?? p.unit}
                          </span>
                        </div>
                        <ArrowRight className={locale === 'ar' ? "w-4 h-4 text-muted group-hover:text-[var(--gold)] group-hover:-translate-x-1 transition-all shrink-0 rotate-180" : "w-4 h-4 text-muted group-hover:text-[var(--gold)] group-hover:translate-x-0.5 transition-all shrink-0"} aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}

            <Link
              href={`/${locale}/categories/bbq-cuts`}
              className="inline-flex items-center justify-center gap-3 mt-4 px-9 h-12 rounded-button text-sm font-semibold uppercase tracking-wider text-primary border border-[var(--gold-border)] bg-surface hover:bg-[var(--gold-subtle)] hover:text-[var(--gold)] hover:shadow-gold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
            >
              <Flame className="w-4 h-4 text-[var(--warning)]" aria-hidden="true" />
              {dict.home?.bbqSection.shopAll}
            </Link>
          </motion.div>

          {/* Right: cinematic image stack */}
          <motion.div
            initial={initialRight}
            whileInView={shouldReduceMotion ? undefined : animateRight}
            viewport={{ once: true }}
            transition={transitionRight}
            className="relative h-[440px] lg:h-[540px]"
            aria-hidden="true"
          >
            <div className={locale === 'ar' ? "absolute left-6 top-6 bottom-0 right-12 rounded-card overflow-hidden" : "absolute right-6 top-6 bottom-0 left-12 rounded-card overflow-hidden"}>
              <Image
                src={BBQ_BG_1}
                alt="Premium grill cuts"
                fill
                loading="lazy"
                className="object-cover opacity-60"
              />
            </div>
            <div className={locale === 'ar' ? "absolute right-0 top-12 bottom-12 left-12 rounded-card overflow-hidden shadow-raised border border-muted" : "absolute left-0 top-12 bottom-12 right-12 rounded-card overflow-hidden shadow-raised border border-muted"} data-theme="dark">
              <Image
                src={BBQ_BG_2}
                alt="Premium beef brisket on butcher block"
                fill
                loading="lazy"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/80 via-transparent to-transparent" />
              <div className={locale === 'ar' ? "absolute bottom-5 right-5 flex items-center gap-3 px-5 py-2.5 rounded-full surface-elevated" : "absolute bottom-5 left-5 flex items-center gap-3 px-5 py-2.5 rounded-full surface-elevated"}>
                <Flame className="w-4 h-4 text-[var(--warning)]" />
                <span className="text-sm font-semibold text-primary">
                  {dict.home?.bbqSection.butchersPick}
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
