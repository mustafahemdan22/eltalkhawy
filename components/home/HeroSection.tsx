'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform } from 'framer-motion';
import { ArrowRight, ChevronDown, ShieldCheck, Truck, Star } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/components/LocaleProvider';

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY    = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY  = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const { locale, dict } = useLocale();

  const TRUST_PILLS = [
    { icon: ShieldCheck, label: dict.home?.hero.trust1 || 'Certified Fresh Daily' },
    { icon: Truck,       label: dict.home?.hero.trust2 || 'Same-Day Delivery' },
    { icon: Star,        label: dict.home?.hero.trust3 || '4.9★ Customer Rating' },
  ];

  return (
    <section
      ref={ref}
      data-theme="dark"
      className="relative w-full overflow-hidden"
      style={{ height: 'calc(100svh - 72px)', minHeight: '560px', maxHeight: '900px' }}
      aria-label="Hero"
    >
      {/* ── Parallax background ── */}
      <motion.div
        style={{ y: bgY }}
        className="absolute inset-0 will-change-transform"
        aria-hidden="true"
      >
        <Image
          src="/hero_premium_meat.png"
          alt="Premium meat cuts on dark stone surface"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center scale-110"
        />
<div className="absolute inset-0 bg-gradient-to-l from-black/90 via-black/60 to-black/20" />
      </motion.div>

      {/* ── Content ── */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 container-brand h-full flex flex-col justify-center"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            <span className="section-label text-[var(--gold)] mb-8 block">
              {dict.home?.hero.label}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="font-display text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight"
          >
            {dict.home?.hero.title1}
            <br />
            <span className="text-gradient-gold">{dict.home?.hero.title2}</span>
            <br />
            {dict.home?.hero.title3}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-10 text-lg sm:text-xl text-slate-300 leading-relaxed max-w-lg"
          >
            {dict.home?.hero.subtitle}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.55 }}
            className="flex flex-wrap items-center gap-4 mt-10"
          >
            <Link
              href={`/${locale}/shop`}
              className="inline-flex items-center gap-3 h-13 px-9 rounded-button text-base font-semibold bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] transition-all duration-250 shadow-gold hover:shadow-gold-lg"
            >
              {dict.home?.hero.shopNow}
              <ArrowRight className={locale === 'ar' ? "w-4 h-4 rotate-180" : "w-4 h-4"} aria-hidden="true" />
            </Link>
            <Link
              href={`/${locale}/categories`}
              className="inline-flex items-center h-13 px-9 rounded-button text-base font-medium border border-white/25 text-red hover:bg-white/10 hover:border-white/40 transition-all duration-250"
            >
              {dict.home?.hero.browseCategories}
            </Link>
          </motion.div>

        </div>
      </motion.div>

    </section>
  );
}
