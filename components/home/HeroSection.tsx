'use client';

import { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';
import { cn } from '@/lib/utils';

export default function HeroSection() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] });
  const bgY    = useTransform(scrollYProgress, [0, 1], ['0%', '30%']);
  const textY  = useTransform(scrollYProgress, [0, 1], ['0%', '15%']);
  const opacity = useTransform(scrollYProgress, [0, 0.7], [1, 0]);

  const { locale, dict } = useLocale();
  const shouldReduceMotion = useReducedMotion();

  const initialHidden = shouldReduceMotion ? {} : { opacity: 0, y: 20 };
  const animateVisible = shouldReduceMotion ? {} : { opacity: 1, y: 0 };
  const transitionBase = shouldReduceMotion ? {} : { duration: 0.6 };

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
        <div className="absolute inset-0 bg-[var(--bg-base)]/50 sm:bg-[var(--bg-base)]/30" />
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-[var(--bg-base)]/80 to-transparent sm:hidden" />
        <div className={cn("absolute inset-0 hidden sm:block", locale === 'ar' ? "bg-gradient-to-l" : "bg-gradient-to-r", "from-[var(--bg-base)]/95 via-[var(--bg-base)]/60 to-transparent")} />
      </motion.div>

      {/* ── Content ── */}
      <motion.div
        style={{ y: textY, opacity }}
        className="relative z-10 container-brand h-full flex flex-col justify-center"
      >
        <div className="max-w-2xl">
          <motion.div
            initial={initialHidden}
            animate={animateVisible}
            transition={{ ...transitionBase, delay: 0.1 }}
          >
            <span className="section-label text-[var(--gold)] block mb-8">
              {dict.home?.hero.label}
            </span>
          </motion.div>

          <motion.h1
            initial={shouldReduceMotion ? {} : { opacity: 0, y: 30 }}
            animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
            transition={shouldReduceMotion ? {} : { duration: 0.7, delay: 0.2 }}
            className="font-display text-fluid-hero font-bold text-[var(--text-primary)] leading-[1.05] tracking-tight"
          >
            {dict.home?.hero.title1}
            <br />
            <span className="text-gold-emphasis">{dict.home?.hero.title2}</span>
            <br />
            {dict.home?.hero.title3}
          </motion.h1>

          <motion.p
            initial={initialHidden}
            animate={animateVisible}
            transition={{ ...transitionBase, delay: 0.4 }}
            className="mt-10 text-fluid-body text-[var(--text-secondary)] leading-relaxed max-w-lg"
          >
            {dict.home?.hero.subtitle}
          </motion.p>

          <motion.div
            initial={initialHidden}
            animate={animateVisible}
            transition={{ ...transitionBase, delay: 0.55 }}
            className="flex flex-wrap items-center gap-6 mt-12"
          >
            <Link
              href={`/${locale}/categories`}
              className="inline-flex items-center gap-3 h-14 px-9 rounded-button text-base font-semibold bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] transition-all duration-250 shadow-gold hover:shadow-gold-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gold)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-base)]"
            >
              {dict.home?.hero.shopNow}
              <ArrowRight className={locale === 'ar' ? "w-4 h-4 rotate-180" : "w-4 h-4"} aria-hidden="true" />
            </Link>
           
          </motion.div>

        </div>
      </motion.div>

    </section>
  );
}
