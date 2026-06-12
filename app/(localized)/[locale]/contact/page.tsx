'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { SITE_CONFIG } from '@/lib/constants';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Phone,
  Mail,
  MapPin,
  Clock,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const { locale, dict } = useLocale();
  const sendMessage = useMutation(api.contact.send);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !message) return;

    setLoading(true);
    try {
      await sendMessage({ name, email, message, locale: locale as 'en' | 'ar' });
      setSubmitted(true);
      setName('');
      setEmail('');
      setMessage('');
    } catch {
      // Error state could be added
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen bg-[var(--bg-base)] py-14 md:py-20 font-sans">
        <div className="container-brand">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
              {dict.contact.getInTouch}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
              {dict.contact.title}
            </h1>
            <p className="text-base text-secondary mt-4 leading-relaxed font-normal">
              {dict.contact.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 xl:gap-14 items-start">
            
            {/* Info Cards Column */}
            <div className="lg:col-span-5 flex flex-col gap-6 w-full">
              
              {/* Phone card */}
              <div className="p-6 rounded-xl bg-surface border border-muted shadow-card flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-[var(--gold)] shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-3xs uppercase tracking-wider text-muted font-semibold block">{dict.contact.phoneHelpline}</span>
                  <a href={`tel:${SITE_CONFIG.phone}`} className="text-sm font-semibold text-primary hover:text-[var(--gold)] transition-colors block">
                    {SITE_CONFIG.phone}
                  </a>
                  <span className="text-3xs text-secondary font-normal block">{dict.contact.phoneHours}</span>
                </div>
              </div>

              {/* Email card */}
              <div className="p-6 rounded-xl bg-surface border border-muted shadow-card flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-[var(--gold)] shrink-0">
                  <Mail className="w-4 h-4" />
                </div>
                <div className="space-y-1.5">
                  <span className="text-3xs uppercase tracking-wider text-muted font-semibold block">{dict.contact.emailDispatch}</span>
                  <a href={`mailto:${SITE_CONFIG.email}`} className="text-sm font-semibold text-primary hover:text-[var(--gold)] transition-colors block break-all">
                    {SITE_CONFIG.email}
                  </a>
                  <span className="text-3xs text-secondary font-normal block">{dict.contact.emailResponse}</span>
                </div>
              </div>

              {/* Branches */}
              {SITE_CONFIG.branches.map((branch, idx) => (
                <div key={idx} className="p-6 rounded-xl bg-surface border border-muted shadow-card flex items-start gap-4">
                  <div className="w-11 h-11 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-[var(--gold)] shrink-0 mt-1">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div className="space-y-1.5">
                    <span className="text-3xs uppercase tracking-wider text-muted font-semibold block">{locale === 'ar' ? branch.nameAr : branch.name}</span>
                    <span className="text-sm font-semibold text-primary block">{locale === 'ar' ? branch.addressAr : branch.address}</span>
                    <span className="text-3xs text-secondary font-normal block">{dict.contact.directPickup}</span>
                  </div>
                </div>
              ))}

              {/* Boutique Hours */}
              <div className="p-6 rounded-xl bg-surface border border-muted shadow-card flex items-start gap-4">
                <div className="w-11 h-11 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-[var(--gold)] shrink-0 mt-1">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="space-y-1.5 w-full">
                  <span className="text-3xs uppercase tracking-wider text-muted font-semibold block mb-2">{dict.contact.workingHours}</span>
                  <div className="text-sm text-secondary font-normal space-y-1.5 w-full">
                    <p className="flex justify-between w-full pe-4">
                      <span>{dict.contact.satThu}</span>
                      <span className="font-semibold text-primary">{dict.contact.satThuHours}</span>
                    </p>
                    <p className="flex justify-between w-full pe-4">
                      <span>{dict.contact.friday}</span>
                      <span className="font-semibold text-primary">{dict.contact.fridayHours}</span>
                    </p>
                  </div>
                </div>
              </div>

            </div>

            {/* Inquiry Form Column */}
            <div className="lg:col-span-7 w-full">
              <div className="p-8 rounded-2xl bg-surface border border-muted shadow-card">
                <h2 className="font-display text-primary font-bold text-lg mb-6 border-b border-muted pb-3">
                  {dict.contact.sendInquiry}
                </h2>

                {submitted ? (
                  <div className="text-center py-10 flex flex-col items-center gap-2">
                    <div className="w-14 h-14 rounded-full bg-success-bg border border-success-border flex items-center justify-center text-success mb-3 animate-pulse">
                      <CheckCircle2 className="w-7 h-7" />
                    </div>
                    <h3 className="font-bold text-primary text-base">{dict.contact.successTitle}</h3>
                    <p className="text-sm text-secondary font-normal max-w-sm mt-1">
                      {dict.contact.successMessage}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {/* Name */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="contact-name" className="text-3xs uppercase tracking-wider text-muted font-semibold">
                          {dict.contact.name}
                        </label>
                        <input
                          id="contact-name"
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={cn(
                            'h-11 px-5 rounded-button text-sm bg-base border border-muted',
                            'text-primary focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-200'
                          )}
                        />
                      </div>

                      {/* Email */}
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="contact-email" className="text-3xs uppercase tracking-wider text-muted font-semibold">
                          {dict.contact.email}
                        </label>
                        <input
                          id="contact-email"
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className={cn(
                            'h-11 px-5 rounded-button text-sm bg-base border border-muted',
                            'text-primary focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-200'
                          )}
                        />
                      </div>
                    </div>

                    {/* Message */}
                    <div className="flex flex-col gap-1.5">
                      <label htmlFor="contact-message" className="text-3xs uppercase tracking-wider text-muted font-semibold">
                        {dict.contact.message}
                      </label>
                      <textarea
                        id="contact-message"
                        required
                        rows={6}
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={dict.contact.placeholder}
                        className="w-full p-4 rounded-button text-sm bg-base border border-muted text-primary placeholder:text-muted focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-300 resize-none"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={loading}
                      loading={loading}
                      fullWidth
                      iconRight={<Send className="w-4 h-4" />}
                      className="h-12 text-sm tracking-wider uppercase font-semibold mt-2 cursor-pointer"
                    >
                      {dict.contact.submit}
                    </Button>
                  </form>
                )}
              </div>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
