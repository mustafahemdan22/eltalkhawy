'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Tag, ArrowRight, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { formatPrice, discountedPrice } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';

export default function PromoBanners() {
  const { locale, dict } = useLocale();

  const PROMOS = [
    {
      id: 'eid',
      title: dict.home?.promos.items.eid.title || 'Eid Al-Adha Special',
      subtitle: dict.home?.promos.items.eid.subtitle || 'Whole lamb & premium cuts',
      discount: 20,
      badge: dict.home?.promos.items.eid.badge || 'Limited Time',
      badgeVariant: 'discount' as const,
      cta: dict.home?.promos.items.eid.cta || 'Shop Eid Offers',
      href: `/${locale}/shop?tag=eid`,
      img: 'https://images.unsplash.com/photo-1603048588665-791ca8aea617?w=900&q=85',
      accent: '#7c0035',
      expires: dict.home?.promos.items.eid.expires || '2 days left',
    },
    {
      id: 'bbq',
      title: dict.home?.promos.items.bbq.title || 'Grill Cuts Bundle',
      subtitle: dict.home?.promos.items.bbq.subtitle || '3kg mix · premium butcher cuts',
      discount: 15,
      badge: dict.home?.promos.items.bbq.badge || 'Bundle Deal',
      badgeVariant: 'gold' as const,
      cta: dict.home?.promos.items.bbq.cta || 'Get the Bundle',
      href: `/${locale}/shop?tag=bundle`,
      img: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=900&q=85',
      accent: '#a07820',
      expires: dict.home?.promos.items.bbq.expires || '5 days left',
    },
  ];

  return (
    <section
      className="section-gap bg-base"
      aria-label="Promotions and deals"
    >
      <div className="container-brand">
        <div className="flex items-center justify-between mb-10">
          <div>
            <span className="section-label text-[var(--gold)] mb-4 block">
              <Tag className={locale === 'ar' ? "w-3 h-3 inline ml-1 -mt-0.5" : "w-3 h-3 inline mr-1 -mt-0.5"} aria-hidden="true" />
              {dict.home?.promos.label}
            </span>
            <h2 className="font-display text-3xl font-bold text-primary">
              {dict.home?.promos.title}
            </h2>
          </div>
          <Link
            href={`/${locale}/shop?sort=discount`}
            className="hidden sm:flex items-center gap-2 text-sm text-[var(--gold)] hover:text-[var(--gold-hover)] font-medium transition-colors"
          >
            {dict.home?.promos.allOffers} <ArrowRight className={locale === 'ar' ? "w-4 h-4 rotate-180" : "w-4 h-4"} />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PROMOS.map((promo, i) => (
            <motion.div
              key={promo.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
            >
              <Link
                href={promo.href}
                className="group relative flex items-end h-60 md:h-72 rounded-card ring-1 ring-inset ring-[var(--border-muted)] hover:ring-black/50 overflow-hidden transition-all duration-350"
                aria-label={promo.title}
              >
                <Image
                  src={promo.img}
                  alt={promo.title}
                  fill
                  className="object-cover transition-transform duration-600 group-hover:scale-[1.04]"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: `linear-gradient(135deg, ${promo.accent}dd 0%, ${promo.accent}44 40%, transparent 70%)`,
                  }}
                  aria-hidden="true"
                />
                <div
                  className="absolute inset-0 overlay-bottom"
                  aria-hidden="true"
                />

                <div className="relative z-10 p-7 w-full">
                  <div className="flex items-start justify-between mb-3">
                    <Badge variant={promo.badgeVariant}>{promo.badge}</Badge>
                    <div className="flex items-center gap-1.5 text-white/80 text-sm">
                      <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                      {promo.expires}
                    </div>
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">
                    {promo.title}
                  </h3>
                  <p className="text-base text-slate-200 mt-1">{promo.subtitle}</p>

                  <div className="flex items-center justify-between mt-5">
                    <span className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-surface-raised/50 backdrop-blur-sm text-[var(--gold)] text-base font-bold" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
                      {dict.home?.promos.save} %{promo.discount}
                    </span>
                    <span className="flex items-center gap-3 text-white group-hover:text-[var(--gold)] text-base font-medium group-hover:gap-4 transition-all">
                      {promo.cta}
                      <ArrowRight className={locale === 'ar' ? "w-4 h-4 rotate-180" : "w-4 h-4"} aria-hidden="true" />
                    </span>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
