'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Crown } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { Badge } from '@/components/ui/Badge';
import { formatPrice } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';

export default function PremiumCutsSection() {
  const { locale, dict } = useLocale();
  const premiumCuts = useQuery(api.products.list, { isPremiumCut: true });
  const display = premiumCuts?.slice(0, 3) ?? [];
  const shouldReduceMotion = useReducedMotion();

  const containerVariants = shouldReduceMotion
    ? { hidden: {}, show: {} }
    : { hidden: {}, show: { transition: { staggerChildren: 0.1 } } };
  const cardVariants = shouldReduceMotion
    ? { hidden: {}, show: {} }
    : { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.5 } } };

  const getBadge = (slug: string): string => {
    if (slug.includes('ribeye')) return dict.home?.premiumCuts.items.ribeye.badge ?? 'Premium';
    if (slug.includes('wagyu')) return dict.home?.premiumCuts.items.wagyu.badge ?? 'Premium';
    if (slug.includes('tomahawk')) return dict.home?.premiumCuts.items.tomahawk.badge ?? 'Premium';
    return 'Premium';
  };

  const getNote = (slug: string, description: string): string => {
    if (slug.includes('ribeye')) return dict.home?.premiumCuts.items.ribeye.note ?? 'Hand-selected, 21-day dry aged';
    if (slug.includes('wagyu')) return dict.home?.premiumCuts.items.wagyu.note ?? 'Exceptional marbling, melt-in-mouth';
    if (slug.includes('tomahawk')) return dict.home?.premiumCuts.items.tomahawk.note ?? 'Long-bone rib steak, showstopper cut';
    return description.slice(0, 60);
  };

  return (
    <section
      className="section-gap bg-[var(--bg-base)]"
      aria-labelledby="premium-heading"
    >
      <div className="container-brand">
        {/* Editorial header row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-end mb-14">
          <div>
            <span className="section-label text-[var(--gold)] mb-4 block">
              <Crown className={locale === 'ar' ? "w-3.5 h-3.5 inline ml-1 -mt-0.5" : "w-3.5 h-3.5 inline mr-1 -mt-0.5"} aria-hidden="true" />
              {dict.home?.premiumCuts.label}
            </span>
            <h2 id="premium-heading" className="font-display text-4xl sm:text-5xl font-bold text-primary">
              {dict.home?.premiumCuts.title}
            </h2>
          </div>
          <div className="max-w-md lg:ml-auto">
            <p className="text-base sm:text-lg text-secondary leading-relaxed mb-6">
              {dict.home?.premiumCuts.description}
            </p>
            <Link
              href={`/${locale}/categories/premium-cuts`}
              className="inline-flex items-center gap-3 px-4 py-3 min-h-11 text-[var(--gold)] hover:text-[var(--gold-hover)] font-semibold uppercase tracking-wider text-sm group"
            >
              {dict.home?.premiumCuts.discover}
              <ArrowRight className={locale === 'ar' ? "w-4 h-4 transition-transform group-hover:-translate-x-1 rotate-180" : "w-4 h-4 transition-transform group-hover:translate-x-1"} />
            </Link>
          </div>
        </div>

        {/* Feature Grid */}
        {premiumCuts === undefined ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="rounded-card overflow-hidden bg-surface border border-muted animate-pulse">
                <div className="h-56 bg-surface-raised/80" />
                <div className="p-7 space-y-3">
                  <div className="h-5 bg-surface-raised/80 rounded w-2/3" />
                  <div className="h-4 bg-surface-raised/80 rounded w-full" />
                  <div className="h-5 bg-surface-raised/80 rounded w-1/3 mt-5" />
                </div>
              </div>
            ))}
          </div>
        ) : display.length === 0 ? null : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: '-40px' }}
            className="grid grid-cols-1 md:grid-cols-3 gap-5 md:gap-6"
          >
            {display.map((cut) => {
              const firstPrice = cut.variants[0]?.price ?? cut.basePrice;
              const firstWeight = cut.variants[0]?.weight ?? cut.unit;
              return (
                <motion.article
                  key={cut.slug}
                  variants={cardVariants}
                  className="group relative rounded-card overflow-hidden bg-surface ring-1 ring-inset ring-[var(--border-muted)] hover:ring-[var(--gold)]/40 transition-all duration-350 hover:shadow-gold"
                >
                  <Link href={`/${locale}/shop/${cut.slug}`} className="block" aria-label={locale === 'ar' ? cut.nameAr : cut.name}>
                    {/* Image */}
                    <div className="relative h-56 overflow-hidden bg-surface-raised/80" data-theme="dark">
                       <Image
                         src={cut.images[0] || '/images/products/placeholder.png'}
                         alt={`${cut.name} — ${getNote(cut.slug, cut.description)}`}
                         fill
                         loading="lazy"
                         className="object-cover transition-transform duration-500 group-hover:scale-[1.06]"
                       />
                      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)]/80 via-transparent to-transparent" />
                      <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                        style={{
                          background:
                            'linear-gradient(135deg, rgba(196,152,40,0.08) 0%, transparent 60%)',
                        }}
                        aria-hidden="true"
                      />
                      <div className="absolute top-3 left-3" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                        <Badge variant="premium">
                          <Crown className={locale === 'ar' ? "w-2.5 h-2.5 inline ml-1" : "w-2.5 h-2.5 inline mr-1"} aria-hidden="true" />
                          {getBadge(cut.slug)}
                        </Badge>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-7">
                      <h3 className="font-display text-lg font-bold text-primary group-hover:text-[var(--gold-hover)] transition-colors">
                        {locale === 'ar' ? cut.nameAr : cut.name}
                      </h3>
                      <p className="text-sm text-secondary mt-3 italic leading-relaxed">{getNote(cut.slug, cut.description)}</p>

                      <div className="flex items-end justify-between mt-6 pt-5 border-t border-muted">
                        <div>
                          <span className="font-mono font-bold text-lg text-[var(--price-current)]" dir="ltr">
                            {formatPrice(firstPrice, locale)}
                          </span>
                          <span className="text-sm text-muted mx-2">
                            {dict.shop?.per} {firstWeight}
                          </span>
                        </div>
                        <span className="inline-flex items-center gap-2 text-sm font-medium text-[var(--gold)] group-hover:gap-3 transition-all">
                          <span className="sr-only">View</span>
                          <ArrowRight className={locale === 'ar' ? "w-4 h-4 rotate-180" : "w-4 h-4"} aria-hidden="true" />
                        </span>
                      </div>
                    </div>

                  </Link>
                </motion.article>
              );
            })}
          </motion.div>
        )}
      </div>
    </section>
  );
}
