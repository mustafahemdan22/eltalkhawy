'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Award, Flame, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useLocale } from '@/components/LocaleProvider';

export default function AboutPage() {
  const { dict } = useLocale();

  const values = [
    {
      icon: ShieldCheck,
      title: dict.about.value1Title,
      description: dict.about.value1Desc,
    },
    {
      icon: Award,
      title: dict.about.value2Title,
      description: dict.about.value2Desc,
    },
    {
      icon: Flame,
      title: dict.about.value3Title,
      description: dict.about.value3Desc,
    },
  ];

  return (
    <>
      <Navbar />

      <main id="main-content" className="min-h-screen bg-[var(--bg-base)] py-14 md:py-20 font-sans">
        <div className="container-brand">
          
          {/* Hero Branding */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4 animate-fade-in">
              {dict.about.ourHeritage}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
              {dict.about.title}
            </h1>
            <p className="text-base text-secondary mt-4 leading-relaxed font-normal text-wrap-pretty">
              {dict.about.subtitle}
            </p>
          </div>

          {/* Grid: Heritage & Craft */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center mb-24">
            {/* Visual block */}
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden bg-surface border border-muted shadow-raised group">
              <Image
                src="https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=800&q=80"
                alt="Master butcher selecting prime beef"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-[var(--bg-overlay)]/30" />
            </div>

            {/* Content block */}
            <div className="flex flex-col gap-6">
              <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.2em] uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                {dict.about.artisanalRoots}
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight">
                {dict.about.rootsTitle}
              </h2>
              <p className="text-sm text-secondary font-normal leading-relaxed text-wrap-pretty">
                {dict.about.rootsDesc1}
              </p>
              <p className="text-sm text-secondary font-normal leading-relaxed text-wrap-pretty">
                {dict.about.rootsDesc2}
              </p>
            </div>
          </div>

          {/* Core values */}
          <div className="border-t border-muted pt-20 mb-16">
            <div className="text-center mb-14">
              <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.2em] uppercase block mb-3">
                {dict.about.brandValues}
              </span>
              <h3 className="font-display text-2xl font-bold text-primary">
                {dict.about.valuesTitle}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-surface border border-muted shadow-card flex flex-col gap-4 text-center items-center relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--gold)]/20 group-hover:bg-[var(--gold)] transition-colors" />
                    <div className="w-12 h-12 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-[var(--gold)] mb-2 mt-2">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-display font-bold text-primary text-base">{value.title}</h4>
                    <p className="text-sm text-secondary font-normal leading-relaxed">{value.description}</p>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
