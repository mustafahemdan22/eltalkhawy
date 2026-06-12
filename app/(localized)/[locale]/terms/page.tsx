'use client';

import Link from 'next/link';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useLocale } from '@/components/LocaleProvider';
import { FileText } from 'lucide-react';

export default function TermsPage() {
  const { locale } = useLocale();
  const isAr = locale === 'ar';

  return (
    <>
      <Navbar />
      <main id="main-content" className="min-h-screen bg-[var(--bg-base)] py-14 md:py-20">
        <div className="container-brand max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-[var(--gold-subtle)] flex items-center justify-center">
              <FileText className="w-5 h-5 text-[var(--gold)]" />
            </div>
            <div>
              <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block">
                {isAr ? 'شروط الخدمة' : 'Terms of Service'}
              </span>
              <h1 className="font-display text-2xl md:text-3xl font-bold text-[var(--text-primary)] leading-tight mt-1">
                {isAr ? 'شروط الخدمة' : 'Terms of Service'}
              </h1>
            </div>
          </div>

          <div className="prose prose-sm max-w-none text-[var(--text-secondary)] space-y-6 mt-10">
            <p className="text-sm leading-relaxed">
              {isAr
                ? 'باستخدامك لموقع التلخاوي الإلكتروني، فإنك توافق على الشروط والأحكام التالية. يرجى قراءتها بعناية.'
                : 'By using the El Talkhawy website, you agree to the following terms and conditions. Please read them carefully.'}
            </p>

            <Section title={isAr ? 'الطلبات والتوصيل' : 'Orders & Delivery'}>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>{isAr ? 'جميع الأسعار بالجنيه المصري وتشمل ضريبة القيمة المضافة.' : 'All prices are in EGP and include VAT.'}</li>
                <li>{isAr ? 'نحن نحتفظ بالحق في رفض أو إلغاء أي طلب.' : 'We reserve the right to refuse or cancel any order.'}</li>
                <li>{isAr ? 'يتم التوصيل داخل القاهرة والجيزة في نفس اليوم للطلبات قبل الساعة ٢:٠٠ م.' : 'Delivery within Cairo and Giza is same-day for orders before 2:00 PM.'}</li>
                <li>{isAr ? 'التوصيل مجاني للطلبات فوق ٢٠٠٠ ج.م.' : 'Free delivery for orders above EGP 2,000.'}</li>
              </ul>
            </Section>

            <Section title={isAr ? 'الجودة والطزاجة' : 'Quality & Freshness'}>
              <p>
                {isAr
                  ? 'نحن ملتزمون بتقديم أجود أنواع اللحوم الطازجة. إذا لم تكن راضياً عن جودة منتجك، يرجى التواصل معنا خلال ٢٤ ساعة من الاستلام.'
                  : 'We are committed to providing the highest quality fresh meats. If you are not satisfied with your product quality, please contact us within 24 hours of receipt.'}
              </p>
            </Section>

            <Section title={isAr ? 'الإلغاء والاسترجاع' : 'Cancellation & Returns'}>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                <li>{isAr ? 'يمكن إلغاء الطلب خلال ٣٠ دقيقة من تقديمه.' : 'Orders can be cancelled within 30 minutes of placement.'}</li>
                <li>{isAr ? 'نظراً لطبيعة المنتجات الطازجة، لا يمكن استبدال أو إرجاع اللحوم بعد الاستلام.' : 'Due to the nature of fresh products, meat cannot be exchanged or returned after receipt.'}</li>
                <li>{isAr ? 'في حالة وجود عيب في المنتج، يرجى التواصل معنا فوراً.' : 'In case of a product defect, please contact us immediately.'}</li>
              </ul>
            </Section>

            <Section title={isAr ? 'المسؤولية' : 'Liability'}>
              <p>
                {isAr
                  ? 'الطلخاوي غير مسؤول عن أي أضرار غير مباشرة ناتجة عن استخدام أو عدم القدرة على استخدام خدماتنا.'
                  : 'El Talkhawy is not liable for any indirect damages resulting from the use or inability to use our services.'}
              </p>
            </Section>

            <Section title={isAr ? 'تعديل الشروط' : 'Modifications'}>
              <p>
                {isAr
                  ? 'نحن نحتفظ بالحق في تعديل هذه الشروط في أي وقت. سيتم إخطارك بالتغييرات الهامة عبر البريد الإلكتروني.'
                  : 'We reserve the right to modify these terms at any time. Material changes will be notified via email.'}
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
