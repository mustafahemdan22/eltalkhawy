'use client';

import { Truck, ShieldCheck, Award, RotateCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { TRUST_FEATURES } from '@/lib/constants';
import { useLocale } from '@/components/LocaleProvider';

const ICON_MAP: Record<string, React.ElementType> = {
  Truck,
  Shield: ShieldCheck,
  Award,
  RotateCcw,
};

const cardVariants = {
  hidden: { opacity: 0, y: 24 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

export default function WhyChooseUs() {
  const { locale, dict } = useLocale();

  const STATS = [
    { value: '38+',    label: dict.home?.whyChooseUs.stats.years || 'Years of Service' },
    { value: '50k+',   label: dict.home?.whyChooseUs.stats.customers || 'Happy Customers' },
    { value: '99%',    label: dict.home?.whyChooseUs.stats.freshness || 'Freshness Rating' },
    { value: '2h',     label: dict.home?.whyChooseUs.stats.delivery || 'Avg. Delivery Time' },
  ];

  return (
    <section
      className="section-gap bg-surface/50 relative overflow-hidden"
      aria-labelledby="why-heading"
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(124,0,53,0.07) 0%, transparent 70%)',
        }}
        aria-hidden="true"
      />

      <div className="container-brand relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
            <span className="section-label text-[var(--gold)] mb-4 justify-center">
            {dict.home?.whyChooseUs.label}
          </span>
          <h2
            id="why-heading"
            className="font-display text-3xl sm:text-4xl font-bold text-primary"
          >
            {dict.home?.whyChooseUs.title}
          </h2>
          <p className="mt-4 text-base text-secondary max-w-xl mx-auto leading-relaxed">
            {dict.home?.whyChooseUs.description}
          </p>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-muted rounded-card overflow-hidden mb-14" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
          {STATS.map(({ value, label }) => (
            <div
              key={label}
              className="bg-base px-6 py-6 text-center"
            >
              <div className="font-display text-3xl font-bold text-[var(--gold)]" dir="ltr">
                {value}
              </div>
              <div className="text-sm text-secondary mt-1.5">{label}</div>
            </div>
          ))}
        </div>

        {/* Feature cards */}
        <motion.div
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.1 } } }}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {TRUST_FEATURES.map(({ icon, title, titleAr, description, descriptionAr }) => {
            const Icon = ICON_MAP[icon] ?? ShieldCheck;
            return (
              <motion.div
                key={title}
                variants={cardVariants}
                  className="group p-7 rounded-card bg-surface ring-1 ring-inset ring-[var(--border-muted)] hover:ring-black/50 hover:bg-surface-raised transition-all duration-350"
              >
                {/* Icon */}
              <div className="w-12 h-12 rounded-lg bg-[var(--gold-subtle)] border border-[var(--gold-border)] flex items-center justify-center mb-5 transition-colors">
                <Icon
                  className="w-5 h-5 text-[var(--gold)]"
                  aria-hidden="true"
                />
                </div>
                <h3 className="text-lg font-semibold text-primary mb-3">
                  {locale === 'ar' ? titleAr : title}
                </h3>
                <p className="text-sm text-secondary leading-relaxed">
                  {locale === 'ar' ? descriptionAr : description}
                </p>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
