'use client';

import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Award, Flame, ShieldCheck, Sparkles } from 'lucide-react';
import Image from 'next/image';

export default function AboutPage() {
  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-base)] py-14 md:py-20 font-sans">
        <div className="container-brand">
          
          {/* Hero Branding */}
          <div className="text-center max-w-2xl mx-auto mb-20">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4 animate-fade-in">
              Our Heritage
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
              The El Talkhawy Legacy
            </h1>
            <p className="text-base text-secondary mt-4 leading-relaxed font-light text-wrap-pretty">
              Crafting premium red meat experiences through master butchery, rigorous farm-to-table sourcing, and a dedication to absolute quality.
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
              <div className="absolute inset-0 bg-black/10 dark:bg-black/20" />
            </div>

            {/* Content block */}
            <div className="flex flex-col gap-6">
              <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.2em] uppercase flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Artisanal Roots
              </span>
              <h2 className="font-display text-2xl md:text-3xl font-bold text-primary leading-tight">
                Honoring the Craft of Prime Meat Sourcing
              </h2>
              <p className="text-sm text-secondary font-light leading-relaxed text-wrap-pretty">
                Founded with a singular mission—to redefine what premium red meat means in Egypt—El Talkhawy draws inspiration from traditional butcher boutique heritages. We believe that beef, lamb, and veal are not merely commodities, but the cornerstone of an exceptional meal. 
              </p>
              <p className="text-sm text-secondary font-light leading-relaxed text-wrap-pretty">
                Every single carcass is scrutinized by our master selectors, verifying that parameters like marbling, age, feed nutrition, and color metrics comply with our elite standards before being sliced.
              </p>
            </div>
          </div>

          {/* Core values */}
          <div className="border-t border-muted pt-20 mb-16">
            <div className="text-center mb-14">
              <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.2em] uppercase block mb-3">
                Brand Values
              </span>
              <h3 className="font-display text-2xl font-bold text-primary">
                Our Gastronomy Pledges
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: ShieldCheck,
                  title: 'Rigorous Sourcing Protocols',
                  description: 'All livestock are naturally pasture-raised, grass-fed, and chemically unenhanced, complying with certified organic metrics.',
                },
                {
                  icon: Award,
                  title: 'Gourmet Selection Standards',
                  description: 'Only the top 5% of marbled cuts qualify for our premium steak tags, ensuring melt-in-the-mouth textures every time.',
                },
                {
                  icon: Flame,
                  title: 'Cold-Chain Delivery Integrity',
                  description: 'We run temperature-monitored refrigerated transport dispatch, securing absolute hygiene and freshness to your doorstep.',
                },
              ].map((value, idx) => {
                const Icon = value.icon;
                return (
                  <div
                    key={idx}
                    className="p-6 rounded-xl bg-surface border border-muted shadow-sm flex flex-col gap-4 text-center items-center relative overflow-hidden group"
                  >
                    <div className="absolute top-0 left-0 w-full h-1 bg-[var(--gold)]/20 group-hover:bg-[var(--gold)] transition-colors" />
                    <div className="w-12 h-12 rounded-full bg-surface-raised border border-muted flex items-center justify-center text-[var(--gold)] mb-2 mt-2">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h4 className="font-display font-bold text-primary text-base">{value.title}</h4>
                    <p className="text-sm text-secondary font-light leading-relaxed">{value.description}</p>
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
