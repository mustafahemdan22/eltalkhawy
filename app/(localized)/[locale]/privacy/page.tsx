'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/components/LocaleProvider';
import { Shield } from 'lucide-react';

export default function PrivacyPage() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-[var(--bg-base)] py-14 md:py-20">
        <div className="container-brand max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[var(--gold-subtle)] flex items-center justify-center">
              <Shield className="w-5 h-5 text-[var(--gold)]" />
            </div>
            <div>
              <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block">
                {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight mt-1">
                {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
              </h1>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-[var(--text-secondary)] space-y-6 mt-10">
            <p className="text-sm leading-relaxed">
              {isAr
                ? 'في التلخاوي، خصوصيتك هي أولويتنا. توضح سياسة الخصوصية هذه كيفية جمع واستخدام وحماية معلوماتك الشخصية عند استخدامك لموقعنا الإلكتروني.'
                : 'At El Talkhawy, your privacy is our priority. This Privacy Policy explains how we collect, use, and protect your personal information when you use our website.'}
            </p>

            <Section title={isAr ? 'المعلومات التي نجمعها' : 'Information We Collect'}>
              <p>
                {isAr
                  ? 'نجمع المعلومات التالية:'
                  : 'We collect the following information:'}
              </p>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>{isAr ? 'الاسم الكامل' : 'Full name'}</li>
                <li>{isAr ? 'البريد الإلكتروني' : 'Email address'}</li>
                <li>{isAr ? 'رقم الهاتف' : 'Phone number'}</li>
                <li>{isAr ? 'عنوان التوصيل' : 'Delivery address'}</li>
                <li>{isAr ? 'سجل الطلبات' : 'Order history'}</li>
              </ul>
            </Section>

            <Section title={isAr ? 'كيف نستخدم معلوماتك' : 'How We Use Your Information'}>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>{isAr ? 'معالجة وتوصيل طلباتك' : 'Process and deliver your orders'}</li>
                <li>{isAr ? 'التواصل معك بخصوص طلباتك' : 'Communicate with you about your orders'}</li>
                <li>{isAr ? 'تحسين خدماتنا' : 'Improve our services'}</li>
                <li>{isAr ? 'إرسال عروض حصرية (بموافقتك)' : 'Send exclusive offers (with your consent)'}</li>
              </ul>
            </Section>

            <Section title={isAr ? 'حماية بياناتك' : 'Data Protection'}>
              <p>
                {isAr
                  ? 'نستخدم إجراءات أمنية متقدمة لحماية معلوماتك الشخصية، بما في ذلك التشفير وأنظمة الخوادم الآمنة.'
                  : 'We use advanced security measures to protect your personal information, including encryption and secure server systems.'}
              </p>
            </Section>

            <Section title={isAr ? 'مشاركة البيانات' : 'Data Sharing'}>
              <p>
                {isAr
                  ? 'لا نشارك معلوماتك الشخصية مع أطراف ثالثة إلا للضرورة القصوى لمعالجة طلبك (مثل شركات التوصيل) أو وفقاً للقانون.'
                  : 'We do not share your personal information with third parties except as necessary to process your order (e.g., delivery companies) or as required by law.'}
              </p>
            </Section>

            <Section title={isAr ? 'حقوقك' : 'Your Rights'}>
              <p>
                {isAr
                  ? 'لديك الحق في الوصول إلى بياناتك الشخصية وتصحيحها أو حذفها في أي وقت. للقيام بذلك، يرجى التواصل معنا.'
                  : 'You have the right to access, correct, or delete your personal data at any time. To do so, please contact us.'}
              </p>
            </Section>

            <Section title={isAr ? 'التواصل' : 'Contact'}>
              <p>
                {isAr
                  ? 'للاستفسارات المتعلقة بالخصوصية، يرجى التواصل معنا عبر البريد الإلكتروني info@eltalkhawy.com.'
                  : 'For privacy-related inquiries, please contact us at info@eltalkhawy.com.'}
              </p>
            </Section>

            <p className="text-xs text-[var(--text-muted)] pt-4 border-t border-[var(--border-muted)]">
              {isAr ? 'آخر تحديث: يونيو 2026' : 'Last updated: June 2026'}
            </p>
          </div>

          <div className="mt-10">
            <Link
              href={`/${locale}`}
              className="inline-flex items-center gap-2 text-sm text-[var(--gold)] hover:text-[var(--gold-hover)] font-semibold"
            >
              ← {isAr ? 'العودة للرئيسية' : 'Back to home'}
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h2 className="font-display text-base font-bold text-[var(--text-primary)] mb-3">{title}</h2>
      <div className="text-sm leading-relaxed space-y-2">{children}</div>
    </div>
  );
}
