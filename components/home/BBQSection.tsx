'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { useQuery } from 'convex/react';
import { api } from '@/convex/_generated/api';
import { useLocale } from '@/components/LocaleProvider';

export default function BBQSection() {
  const { locale, dict } = useLocale();
  const bbqProducts = useQuery(api.products.list, { isBBQ: true });
  const topBBQ = bbqProducts?.slice(0, 3) ?? [];

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
            'radial-gradient(ellipse 80% 60% at 60% 50%, #7c0035 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 container-brand section-gap">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">

          {/* Left: text block */}
          <motion.div
            initial={{ opacity: 0, x: locale === 'ar' ? 32 : -32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65 }}
          >
            <span className="section-label text-[var(--brand)] mb-5 block">
              {dict.home?.bbqSection.label}
            </span>
            <h2
              id="bbq-heading"
              className="font-display text-4xl sm:text-5xl font-bold text-primary leading-tight"
            >
              {dict.home?.bbqSection.title}{' '}
              <span className="text-gradient-brand italic">{dict.home?.bbqSection.titleHighlight}</span>
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
                    <li key={p.slug}>
                      <Link
                        href={`/${locale}/shop/${p.slug}`}
                        className="group flex items-center gap-5 p-5 rounded-lg bg-surface ring-1 ring-inset ring-[var(--border-muted)] hover:ring-black/50 hover:bg-surface-raised transition-all duration-250"
                      >
                        <div className="w-14 h-14 rounded-lg overflow-hidden shrink-0 bg-surface-raised">
                          <Image
                            src={p.images[0]?.startsWith('http') ? p.images[0] : 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=600&q=80'}
                            alt={locale === 'ar' ? p.nameAr : p.name}
                            width={56}
                            height={56}
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
                            EGP {firstPrice}
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
              href={`/${locale}/categories/bbq`}
              className="inline-flex items-center gap-2 px-8 h-12 rounded-full border border-muted text-sm font-semibold text-primary hover:bg-surface-raised hover:border-[var(--gold)] transition-all duration-300"
            >
              <Flame className="w-4 h-4" aria-hidden="true" />
              {dict.home?.bbqSection.shopAll}
            </Link>
          </motion.div>

          {/* Right: cinematic image stack */}
          <motion.div
            initial={{ opacity: 0, x: locale === 'ar' ? -32 : 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.65, delay: 0.15 }}
            className="relative h-[440px] lg:h-[540px]"
            aria-hidden="true"
          >
            <div className={locale === 'ar' ? "absolute left-6 top-6 bottom-0 right-12 rounded-card overflow-hidden" : "absolute right-6 top-6 bottom-0 left-12 rounded-card overflow-hidden"}>
              <Image
                src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80"
                alt="Premium raw steak"
                fill
                className="object-cover opacity-60"
              />
            </div>
            <div className={locale === 'ar' ? "absolute right-0 top-12 bottom-12 left-12 rounded-card overflow-hidden shadow-raised border border-muted" : "absolute left-0 top-12 bottom-12 right-12 rounded-card overflow-hidden shadow-raised border border-muted"}>
              <Image
                src="https://images.unsplash.com/photo-1544025162-d76694265947?w=800&q=80"
                alt="Premium raw meat cuts on butcher block"
                fill
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              <div className={locale === 'ar' ? "absolute bottom-5 right-5 flex items-center gap-3 px-5 py-2.5 rounded-full glass" : "absolute bottom-5 left-5 flex items-center gap-3 px-5 py-2.5 rounded-full glass"}>
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
