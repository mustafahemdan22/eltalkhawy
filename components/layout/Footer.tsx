'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useMutation } from 'convex/react';
import { api } from '@/convex/_generated/api';
import {
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';
import { SITE_CONFIG, CATEGORIES } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useLocale } from '@/components/LocaleProvider';

function NewsletterForm({ locale }: { locale: 'en' | 'ar' }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const subscribe = useMutation(api.newsletter.subscribe);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) {
      setStatus('error');
      setMessage(locale === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setStatus('error');
      setMessage(locale === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
      return;
    }
    setStatus('loading');
    try {
      const result = await subscribe({ email: trimmed, locale });
      if (result.status === 'already_subscribed') {
        setMessage(locale === 'ar' ? 'أنت مشترك بالفعل!' : 'You are already subscribed!');
      } else {
        setMessage(locale === 'ar' ? 'تم الاشتراك بنجاح!' : 'Subscribed successfully!');
      }
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
      setMessage(locale === 'ar' ? 'حدث خطأ. حاول مرة أخرى.' : 'Something went wrong. Try again.');
    }
    setTimeout(() => setStatus('idle'), 3000);
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto shrink-0">
      <div className="relative flex-1 sm:w-80">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={locale === 'ar' ? 'البريد الإلكتروني' : 'Your premium email address'}
          className={cn(
            'w-full h-12 rounded-button text-sm font-sans',
            locale === 'ar' ? 'pr-5 pl-10' : 'pl-5 pr-10',
            'bg-surface/80 border border-muted backdrop-blur-sm',
            'text-primary placeholder:text-muted',
            'focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20',
            'transition-all duration-300',
            status === 'success' && 'border-fresh',
            status === 'error' && 'border-error',
          )}
          aria-label="Email address for newsletter"
        />
        <div className={cn(
          "absolute top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[var(--gold)] animate-pulse_gold",
          locale === 'ar' ? 'left-3.5' : 'right-3.5'
        )} />
      </div>
      <button
        type="submit"
        disabled={status === 'loading' || status === 'success'}
        className={cn(
          'h-12 px-6 rounded-button text-sm tracking-wider uppercase font-semibold',
          'bg-gradient-brand text-[var(--brand-fg)] hover:shadow-gold',
          'border border-[var(--gold)]/20 hover:border-[var(--gold)]/50',
          'transition-all duration-300 whitespace-nowrap flex items-center justify-center gap-2 group cursor-pointer',
          (status === 'loading' || status === 'success') && 'opacity-70 cursor-not-allowed',
        )}
      >
        {status === 'loading' ? (
          <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : status === 'success' ? (
          <span>{locale === 'ar' ? 'تم!' : 'Done!'}</span>
        ) : (
          <>
            <span>{locale === 'ar' ? 'اشترك الآن' : 'Subscribe Now'}</span>
            <ArrowRight className={cn("w-3.5 h-3.5 transition-transform duration-300", locale === 'ar' ? "rotate-180 group-hover:-translate-x-1" : "group-hover:translate-x-1")} aria-hidden="true" />
          </>
        )}
      </button>
      {message && (
        <p className={cn(
          'text-xs mt-1 sm:absolute sm:top-full sm:left-0 sm:right-0',
          status === 'success' ? 'text-fresh' : 'text-error',
        )}>
          {message}
        </p>
      )}
    </form>
  );
}

// Custom Instagram icon styled to match Lucide icons exactly
const Instagram = ({ className, ...props }: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

// Custom Facebook icon styled to match Lucide icons exactly
const Facebook = ({ className, ...props }: React.ComponentProps<'svg'>) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0 -5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);

export default function Footer() {
  const year = new Date().getFullYear();
  const pathname = usePathname();
  const { locale } = useLocale();
  const isHome = pathname === '/' || pathname === '/ar' || pathname === '/en';

  return (
    <footer className="bg-base border-t border-muted mt-auto relative overflow-hidden">
      {/* Subtle gold ambient glow in footer corner */}
      <div className="absolute bottom-0 right-0 w-[300px] h-[300px] bg-[var(--gold)]/3 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-0 left-10 w-[250px] h-[250px] bg-[var(--brand)]/2 blur-[100px] rounded-full pointer-events-none" />

      {/* ── Newsletter Strip (Premium Dark Gradient) ── */}
      {!isHome && (
        <div className="border-b border-muted bg-gradient-to-r from-base via-surface to-base relative z-10">
          <div className="container-brand py-16 md:py-20">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-10">
              <div className="max-w-xl">
                <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-3">
                  {locale === 'ar' ? 'انضم إلى نادي النخبة' : 'Join The Elite Club'}
                </span>
                <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight text-wrap-balance">
                  {locale === 'ar' ? 'احصل على قطعيات حصرية وأحدث خلطات الجزارة' : 'Get Exclusive Cuts & Gastronomy News'}
                </h2>
                <p className="text-sm text-secondary mt-3 font-sans font-normal leading-relaxed text-wrap-pretty">
                  {locale === 'ar' ? 'اشترك لتصلك تنبيهات خاصة باللحوم الطازجة، وصفات حصرية من جزارنا، وأولوية الحجز.' : 'Subscribe to receive private alerts on fresh arrivals, curated recipes from our premium butcher, and priority reservations.'}
                </p>
              </div>
              <NewsletterForm locale={locale} />
            </div>
          </div>
        </div>
      )}

      {/* ── Main Footer Grid ── */}
      <div className="container-brand py-20 md:py-24 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-20">
          
          {/* Column 1: Brand details & identity */}
          <div className="flex flex-col space-y-8">
            <Link href={`/${locale}`} className="flex items-center gap-3 group w-fit">
              <div className="w-11 h-11 rounded-full bg-gradient-brand flex items-center justify-center shadow-gold transition-transform duration-500 group-hover:rotate-[360deg]">
                <span className="text-[var(--brand-fg)] font-display font-bold text-base tracking-wider select-none">ET</span>
              </div>
              <div>
                <div className="font-display font-bold text-primary text-xl leading-none tracking-tight">
                  El Talkhawy
                </div>
                <div className="text-[var(--gold)] text-3xs font-medium tracking-[0.2em] uppercase mt-1">
                  Premium Butcher Shop
                </div>
              </div>
            </Link>
            <p className="text-sm text-secondary leading-relaxed font-sans font-normal max-w-xs text-wrap-pretty">
              {locale === 'ar' ? SITE_CONFIG.descriptionAr : SITE_CONFIG.description}
            </p>
            {/* Elegant glassmorphic Social Links */}
            <div className="flex items-center gap-4 pt-2">
              {[
                { href: SITE_CONFIG.socials.instagram, icon: Instagram, label: 'Instagram' },
                { href: SITE_CONFIG.socials.facebook, icon: Facebook, label: 'Facebook' },
                { href: SITE_CONFIG.socials.whatsapp, icon: MessageCircle, label: 'WhatsApp' },
              ].map((social) => {
                const IconComponent = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      'w-11 h-11 rounded-full bg-surface-raised/80 border border-muted flex items-center justify-center',
                      'text-secondary hover:text-primary hover:border-[var(--gold)] hover:bg-[var(--gold-subtle)]',
                      'transition-all duration-300 hover:-translate-y-1 hover:shadow-gold-sm',
                      'social-icon-ring',
                    )}
                    aria-label={social.label}
                  >
                    <IconComponent className="w-4 h-4" aria-hidden="true" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Column 2: Shop Sections */}
          <div>
            <h3 className="text-[var(--gold)] font-display font-medium text-xs tracking-[0.2em] uppercase mb-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]/50" />
              {locale === 'ar' ? 'تصنيفات المتجر' : 'Shop Categories'}
            </h3>
            <ul className="space-y-5 font-sans">
              {CATEGORIES.slice(0, 7).map((cat: (typeof CATEGORIES)[number]) => {
                const isAnimal = ['beef', 'buffalo', 'lamb', 'goat', 'veal'].includes(cat.slug);
                const categoryHref = isAnimal ? `/${locale}/animal/${cat.slug}` : `/${locale}/categories/${cat.slug}`;
                
                return (
                  <li key={cat.slug} className="group overflow-hidden">
                    <Link
                      href={categoryHref}
                      className={cn(
                        'text-sm text-secondary hover:text-primary',
                        'flex items-center gap-2.5 transition-all duration-300 ease-out',
                        locale === 'ar' ? 'group-hover:-translate-x-1.5' : 'group-hover:translate-x-1.5',
                        'py-2 -my-2 min-h-11',
                      )}
                    >
                    <span className="text-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 select-none" aria-hidden="true">
                      {cat.icon}
                    </span>
                    <span className="relative">
                      {locale === 'ar' ? cat.nameAr : cat.name}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--gold)]/40 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
                );
              })}
              <li className="pt-2">
                <Link
                  href={`/${locale}/categories`}
                  className="inline-flex items-center gap-1.5 px-3 py-3 -my-3 text-xs text-[var(--gold)] hover:text-[var(--gold)] font-semibold tracking-wider uppercase group/all transition-colors"
                >
                  <span>{locale === 'ar' ? 'عرض جميع الأقسام' : 'View All Categories'}</span>
                  <ArrowRight className={cn("w-3.5 h-3.5 transition-transform duration-300", locale === 'ar' ? "rotate-180 group-hover/all:-translate-x-1" : "group-hover/all:translate-x-1")} />
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 3: Information */}
          <div>
            <h3 className="text-[var(--gold)] font-display font-medium text-xs tracking-[0.2em] uppercase mb-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]/50" />
              {locale === 'ar' ? 'معلومات تهمك' : 'Information'}
            </h3>
            <ul className="space-y-5 font-sans">
              {[
                { label: 'About Our Heritage', labelAr: 'قصتنا وخبرتنا', href: '/about' },
                { label: 'Curated Gastronomy FAQs', labelAr: 'الأسئلة الشائعة', href: '/faq' },
                { label: 'Contact Elite Support', labelAr: 'تواصل معنا', href: '/contact' },
                { label: 'Track Order Freshness', labelAr: 'تتبع حالة طلبك', href: '/orders' },
                { label: 'My Meat Account', labelAr: 'حسابي', href: '/account' },
                { label: 'My Gastronomy Wishlist', labelAr: 'قائمتي المفضلة', href: '/wishlist' },
                { label: 'Privacy Regulations', labelAr: 'سياسة الخصوصية', href: '/privacy' },
              ].map((item) => (
                <li key={item.href} className="group overflow-hidden">
                  <Link
                    href={item.href === '/' ? `/${locale}` : `/${locale}${item.href}`}
                    className={cn(
                      'text-sm text-secondary hover:text-primary',
                      'flex items-center gap-2 transition-all duration-300 ease-out',
                      locale === 'ar' ? 'group-hover:-translate-x-1.5' : 'group-hover:translate-x-1.5',
                      'py-2 -my-2 min-h-11',
                    )}
                  >
                    <span className="w-1 h-1 rounded-full bg-muted transition-all duration-300 group-hover:bg-[var(--gold)] group-hover:scale-125" />
                    <span className={cn("relative", locale === 'ar' ? "mr-1" : "ml-1")}>
                      {locale === 'ar' ? item.labelAr : item.label}
                      <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[var(--gold)]/40 transition-all duration-300 group-hover:w-full" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Operations */}
          <div>
            <h3 className="text-[var(--gold)] font-display font-medium text-xs tracking-[0.2em] uppercase mb-10 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold)]/50" />
              {locale === 'ar' ? 'تفاصيل التواصل' : 'Contact Details'}
            </h3>
            <ul className="space-y-5 font-sans text-sm">
              <li className="group">
                <a
                  href={`tel:${SITE_CONFIG.phone}`}
                  className="flex items-center gap-3 py-1 -my-1 text-secondary hover:text-primary transition-colors w-fit min-h-11"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-raised border border-muted flex items-center justify-center transition-colors group-hover:border-[var(--gold)] group-hover:bg-[var(--gold-subtle)]">
                    <Phone className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" aria-hidden="true" />
                  </div>
                  <span className="font-medium tracking-wide">{SITE_CONFIG.phone}</span>
                </a>
              </li>
              <li className="group">
                <a
                  href={`mailto:${SITE_CONFIG.email}`}
                  className="flex items-center gap-3 py-1 -my-1 text-secondary hover:text-primary transition-colors w-fit min-h-11"
                >
                  <div className="w-8 h-8 rounded-full bg-surface-raised border border-muted flex items-center justify-center transition-colors group-hover:border-[var(--gold)] group-hover:bg-[var(--gold-subtle)]">
                    <Mail className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" aria-hidden="true" />
                  </div>
                  <span className="break-all">{SITE_CONFIG.email}</span>
                </a>
              </li>
              <li className="flex items-start gap-3 text-secondary">
                <div className="w-8 h-8 rounded-full bg-surface-raised border border-muted flex items-center justify-center shrink-0 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" aria-hidden="true" />
                </div>
                <div className="flex flex-col gap-4 pt-1">
                  {SITE_CONFIG.branches.map((branch, idx) => (
                    <div key={idx} className="leading-relaxed font-normal text-wrap-pretty">
                      <span className="block font-medium text-primary text-xs">{locale === 'ar' ? branch.nameAr : branch.name}</span>
                      <span className="text-xs">{locale === 'ar' ? branch.addressAr : branch.address}</span>
                    </div>
                  ))}
                </div>
              </li>
            </ul>

            {/* Premium Working Hours Block */}
            <div className="mt-10 p-6 rounded-xl bg-gradient-to-br from-surface-raised to-base border border-muted relative overflow-hidden shadow-raised group">
              <div className="absolute top-0 right-0 w-12 h-12 bg-[var(--gold)]/2 blur-lg rounded-full pointer-events-none transition-opacity duration-300 group-hover:opacity-100" />
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-fresh animate-pulse" />
                {locale === 'ar' ? 'ساعات العمل' : 'Boutique Hours'}
              </p>
              <div className="space-y-2 text-sm text-secondary font-normal">
                <div className="flex justify-between">
                  <span>{locale === 'ar' ? 'السبت – الخميس:' : 'Sat – Thu:'}</span>
                  <span className="font-medium text-primary">
                    {locale === 'ar' ? '٨:٠٠ ص – ١٢:٠٠ ص' : '8:00 AM – 12:00 AM'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>{locale === 'ar' ? 'الجمعة:' : 'Friday:'}</span>
                  <span className="font-medium text-primary">
                    {locale === 'ar' ? '٢:٠٠ م – ١٢:٠٠ ص' : '2:00 PM – 12:00 AM'}
                  </span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── Bottom Bar (Pristine Details) ── */}
      <div className="border-t border-muted bg-base relative z-10">
        <div className="container-brand py-8 flex flex-col md:flex-row items-center justify-between gap-5 text-sm text-muted font-sans font-normal">
          <p>
            {locale === 'ar' 
              ? `© ${year} الطلخاوي. صُنع لعشاق اللحوم الفاخرة. جميع الحقوق محفوظة.` 
              : `© ${year} El Talkhawy. Crafted for Gourmet Meat Enthusiasts. All rights reserved.`}
          </p>
          <div className="flex items-center gap-6">
            <Link href={`/${locale}/privacy`} className="hover:text-[var(--gold)] transition-colors relative group py-3 -my-3 min-h-11 inline-flex items-center">
              <span>{locale === 'ar' ? 'سياسة الخصوصية' : 'Privacy Policy'}</span>
              <span className="absolute bottom-2 left-0 w-0 h-px bg-[var(--gold)]/50 transition-all duration-300 group-hover:w-full" />
            </Link>
            <span className="w-1.5 h-1.5 rounded-full bg-surface-raised" />
            <Link href={`/${locale}/terms`} className="hover:text-[var(--gold)] transition-colors relative group py-3 -my-3 min-h-11 inline-flex items-center">
              <span>{locale === 'ar' ? 'شروط الخدمة' : 'Terms of Service'}</span>
              <span className="absolute bottom-2 left-0 w-0 h-px bg-[var(--gold)]/50 transition-all duration-300 group-hover:w-full" />
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
