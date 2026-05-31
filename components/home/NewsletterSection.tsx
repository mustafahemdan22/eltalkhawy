'use client';

import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';

export default function NewsletterSection() {
  const { locale, dict } = useLocale();
  const [email, setEmail]       = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) { setError(dict.home?.newsletter.errorEmpty || 'Please enter your email.'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(dict.home?.newsletter.errorInvalid || 'Please enter a valid email address.');
      return;
    }
    setError('');
    setLoading(true);
    // Simulate API call
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <section
      className="relative overflow-hidden bg-surface"
      aria-labelledby="newsletter-heading"
    >
      <div className="divider-gold" aria-hidden="true" />

      <div className="container-brand py-20 md:py-24">
        <div className="max-w-2xl mx-auto text-center">
          <div className="text-5xl mb-6" aria-hidden="true">🥩</div>

          <span className="section-label text-[var(--gold)] mb-4 justify-center">
            {dict.home?.newsletter.label}
          </span>
          <h2
            id="newsletter-heading"
            className="font-display text-3xl sm:text-4xl font-bold text-primary"
          >
            {dict.home?.newsletter.title}
          </h2>
          <p className="mt-4 text-base text-secondary max-w-md mx-auto leading-relaxed">
            {dict.home?.newsletter.description}
          </p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.92 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-10 flex flex-col items-center gap-4"
              >
                <div className="w-16 h-16 rounded-full bg-fresh-bg flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8 text-fresh" aria-hidden="true" />
                </div>
                <p className="text-primary font-semibold text-lg">{dict.home?.newsletter.successTitle}</p>
                <p className="text-base text-secondary">
                  {dict.home?.newsletter.successDescription}
                </p>
              </motion.div>
            ) : (
              <motion.form
                key="form"
                onSubmit={handleSubmit}
                className="mt-10"
                noValidate
                aria-label="Newsletter signup form"
              >
                <div className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto">
                  <div className="flex-1">
                    <label htmlFor="newsletter-email" className="sr-only">
                      Email address
                    </label>
                    <input
                      id="newsletter-email"
                      type="email"
                      value={email}
                      onChange={(e) => { setEmail(e.target.value); setError(''); }}
                      placeholder={dict.home?.newsletter.placeholder}
                      className={cn(
                        'w-full h-12 px-5 rounded-button text-base',
                        'bg-base border',
                        error ? 'border-error' : 'border-muted',
                        'text-primary placeholder:text-muted',
                        'focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/30',
                        'transition-all duration-250',
                      )}
                      aria-describedby={error ? 'newsletter-error' : undefined}
                      aria-invalid={!!error}
                      autoComplete="email"
                      dir="ltr"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 px-7 rounded-button text-base font-semibold bg-[var(--gold)] text-[var(--gold-fg)] hover:bg-[var(--gold-hover)] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-250 flex items-center gap-2 justify-center whitespace-nowrap"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-muted/30 border-t-charcoal-900 rounded-full animate-spin" aria-hidden="true" />
                    ) : (
                      <>
                        {dict.home?.newsletter.button}
                        <ArrowRight className={locale === 'ar' ? "w-4 h-4 rotate-180" : "w-4 h-4"} aria-hidden="true" />
                      </>
                    )}
                  </button>
                </div>

                {error && (
                  <p id="newsletter-error" className="text-sm text-error mt-3" role="alert">
                    {error}
                  </p>
                )}

                <p className="text-sm text-muted mt-4">
                  {dict.home?.newsletter.disclaimer}
                </p>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="divider-gold" aria-hidden="true" />
    </section>
  );
}
