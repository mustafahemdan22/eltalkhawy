'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Star, ChevronLeft, ChevronRight, Quote } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';

const TESTIMONIALS = [
  {
    id: 1,
    name: 'Ahmed Mostafa',
    nameAr: 'أحمد مصطفى',
    location: 'Maadi, Cairo',
    locationAr: 'المعادي، القاهرة',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80',
    rating: 5,
    text: 'The ribeye I ordered was absolutely incredible — perfectly marbled and arrived perfectly chilled. El Talkhawy has completely changed how I buy meat. Never going back to the supermarket.',
    textAr: 'الريب آي الذي طلبته كان مذهلاً بكل معنى الكلمة — توزيع دهني مثالي ووصل مبرداً بشكل ممتاز. التلخاوي غيّر طريقتي في شراء اللحوم تماماً. لن أعود للسوبر ماركت أبداً.',
    product: 'Premium Ribeye Steak',
    productAr: 'ريب آي ستيك مميز',
  },
  {
    id: 2,
    name: 'Nour El-Din',
    nameAr: 'نور الدين',
    location: 'New Cairo',
    locationAr: 'القاهرة الجديدة',
    avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=80&q=80',
    rating: 5,
    text: 'Ordered the grill mix pack for a family gathering — 3kg of premium red meat that everyone couldn\'t stop talking about. The cuts were generous and even. Will be ordering every week.',
    textAr: 'طلبت تشكيلة الشوي لتجمع عائلي — ٣ كجم من اللحوم الحمراء الممتازة لم يتوقف الجميع عن الحديث عنها. القطع كانت كريمة ومتساوية. سأطلب أسبوعياً من الآن فصاعداً.',
    product: 'Grill Mix Pack',
    productAr: 'تشكيلة شوي',
  },
  {
    id: 3,
    name: 'Yasmine Khalil',
    nameAr: 'ياسمين خليل',
    location: 'Heliopolis, Cairo',
    locationAr: 'مصر الجديدة، القاهرة',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80',
    rating: 5,
    text: 'As someone who is very particular about freshness, I was blown away. The lamb arrived the same morning it was butchered. The quality speaks for itself — this is the real deal.',
    textAr: 'كشخص يهتم جداً بالطزاجة، لقد انبهرت حقاً. وصل لحم الضأن في نفس الصباح الذي ذُبح فيه. الجودة تتحدث عن نفسها — هذا هو المكان الحقيقي للحوم.',
    product: 'Fresh Lamb Chops',
    productAr: 'ريش ضأن طازجة',
  },
  {
    id: 4,
    name: 'Omar Sharif',
    nameAr: 'عمر شريف',
    location: '6th of October City',
    locationAr: 'مدينة ٦ أكتوبر',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80',
    rating: 5,
    text: 'Fast delivery, premium packaging, and honestly the best minced beef I\'ve ever used for my kofta. Tastes like it came straight from the butcher. Highly recommend to anyone who takes food seriously.',
    textAr: 'توصيل سريع، تغليف فاخر، وبصراحة أفضل لحم مفروم استخدمته للكفتة على الإطلاق. طعمه كأنه طازج من عند الجزار. أوصي به بشدة لكل من يأخذ جودة الطعام على محمل الجد.',
    product: 'Minced Beef Premium',
    productAr: 'لحم مفروم ممتاز',
  },
];

export default function Testimonials() {
  const { locale, dict } = useLocale();
  const shouldReduceMotion = useReducedMotion();
  const [current, setCurrent] = useState(0);
  const [direction, setDirection] = useState<'left' | 'right'>('right');

  const go = (idx: number) => {
    setDirection(idx > current ? 'right' : 'left');
    setCurrent(idx);
  };
  const prev = () => go((current - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  const next = () => go((current + 1) % TESTIMONIALS.length);

  const t = TESTIMONIALS[current];

  const initialX = direction === 'right' ? (locale === 'ar' ? -48 : 48) : (locale === 'ar' ? 48 : -48);
  const exitX = direction === 'right' ? (locale === 'ar' ? 48 : -48) : (locale === 'ar' ? -48 : 48);
  const initial = shouldReduceMotion ? {} : { opacity: 0, x: initialX };
  const animate = shouldReduceMotion ? {} : { opacity: 1, x: 0 };
  const exit = shouldReduceMotion ? {} : { opacity: 0, x: exitX };
  const transition = shouldReduceMotion ? {} : { duration: 0.38, ease: [0.25, 0.46, 0.45, 0.94] as const };

  return (
    <section
      className="section-gap bg-[var(--bg-base)] relative overflow-hidden"
      aria-labelledby="testimonials-heading"
    >
      <div
        className={cn(
          "absolute top-8 font-display text-[200px] leading-none text-surface-border select-none pointer-events-none",
          locale === 'ar' ? "left-8 scale-x-[-1]" : "right-8"
        )}
        aria-hidden="true"
      >
        &quot;
      </div>

      <div className="container-brand relative z-10">
        {/* Header */}
        <div className="text-center mb-14">
          <h2
            id="testimonials-heading"
            className="font-display text-3xl sm:text-4xl font-bold text-primary"
          >
            {dict.home?.testimonials.title}
          </h2>
        </div>

        {/* Testimonial card */}
        <div className="max-w-3xl mx-auto">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={t.id}
              custom={direction}
              initial={initial}
              animate={animate}
              exit={exit}
              transition={transition}
              className="bg-surface border border-muted rounded-card p-8 md:p-10 relative"
            >
              <Quote
                className={cn("w-8 h-8 text-[var(--gold)]/30 mb-6", locale === 'ar' ? "rotate-180" : "")}
                aria-hidden="true"
              />

              <div className="flex gap-1 mb-5" aria-label={`${t.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className="w-4 h-4 fill-[var(--rating-star)] text-[var(--rating-star)]"
                    aria-hidden="true"
                  />
                ))}
              </div>

              <blockquote>
                <p className="text-primary text-lg md:text-xl leading-relaxed font-medium">
                  &quot;{locale === 'ar' ? t.textAr : t.text}&quot;
                </p>
              </blockquote>

              <div className="mt-8 mb-7">
                <span className="inline-flex items-center gap-1.5 text-sm text-[var(--gold)] bg-[var(--gold-subtle)] border border-[var(--gold-border)] px-4 py-2 rounded-full">
                  <span aria-hidden="true">🥩</span>
                  {dict.home?.testimonials.ordered}: {locale === 'ar' ? t.productAr : t.product}
                </span>
              </div>

              <div className="flex items-center gap-4 pt-8 border-t border-muted">
                <div className="w-12 h-12 rounded-full overflow-hidden bg-surface-raised ring-2 ring-[var(--gold)]/20 shrink-0">
                  <Image
                    src={t.avatar}
                    alt={locale === 'ar' ? t.nameAr : t.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-base font-semibold text-primary">{locale === 'ar' ? t.nameAr : t.name}</p>
                  <p className="text-sm text-secondary">{locale === 'ar' ? t.locationAr : t.location}</p>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center justify-between mt-10" dir={locale === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex gap-3" role="tablist" aria-label="Testimonials navigation">
              {TESTIMONIALS.map((_, i) => (
                <button
                  key={i}
                  role="tab"
                  aria-selected={i === current}
                  aria-label={`Testimonial ${i + 1}`}
                  onClick={() => go(i)}
                  className="w-11 h-11 flex items-center justify-center transition-colors rounded-full hover:bg-surface-raised"
                >
                  <span className={cn(
                    'rounded-full transition-all duration-250',
                    i === current
                      ? 'w-7 h-2.5 bg-[var(--gold)]'
                      : 'w-2.5 h-2.5 bg-muted',
                  )} />
                </button>
              ))}
            </div>

            <div className="flex gap-5" dir="ltr">
            <button
              onClick={locale === 'ar' ? next : prev}
              className="w-12 h-12 rounded-full bg-surface border border-muted flex items-center justify-center text-secondary hover:text-primary hover:border-[var(--gold)] transition-all"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5" aria-hidden="true" />
            </button>
            <button
              onClick={locale === 'ar' ? prev : next}
              className="w-12 h-12 rounded-full bg-surface border border-muted flex items-center justify-center text-secondary hover:text-primary hover:border-[var(--gold)] transition-all"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5" aria-hidden="true" />
            </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
