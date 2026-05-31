'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { ChevronDown, HelpCircle, Compass } from 'lucide-react';

interface FAQItemProps {
  question: string;
  answer:   string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-muted rounded-xl bg-surface overflow-hidden shadow-sm transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-left gap-4 hover:bg-surface-raised transition-colors cursor-pointer group"
      >
        <span className="font-display font-semibold text-primary text-sm md:text-base group-hover:text-[var(--gold)] transition-colors">
          {question}
        </span>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-muted transition-transform duration-300 shrink-0 group-hover:text-[var(--gold)]',
            isOpen && 'rotate-180 text-[var(--gold)]'
          )}
        />
      </button>

      <div
        className={cn(
          'transition-all duration-300 overflow-hidden ease-in-out',
          isOpen ? 'max-h-96 border-t border-muted' : 'max-h-0'
        )}
      >
        <p className="p-6 font-sans font-light text-sm text-secondary leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const faqs = [
    {
      category: 'Sourcing & Freshness',
      items: [
        {
          question: 'Where do you source your meats from?',
          answer: 'All our beef, lamb, and veal are sourced directly from certified organic Egyptian pasture farms. The animals are entirely grass-fed, naturally reared, and free from growth hormones or chemically enhanced feeds.',
        },
        {
          question: 'Are your meats fresh or frozen?',
          answer: 'We offer both options labeled explicitly in our catalog! Our fresh cuts are butchered and prepared daily in our clean flagship boutique. Our frozen items are flash-frozen instantly using premium technology at the peak of freshness to preserve flavor, cell structures, and nutrients without any artificial preservatives.',
        },
        {
          question: 'What is your dry-aging process?',
          answer: 'Our dry-aged beef cuts (like Ribeye and T-Bone) are aged inside our custom, temperature and humidity-controlled Himalayan salt brick chambers for 21 to 28 days. This process concentrates the beef flavor, breaks down muscle fibers naturally, and yields an incredibly tender steak.',
        },
      ],
    },
    {
      category: 'Logistics & Dispatch',
      items: [
        {
          question: 'How do you guarantee cold chain integrity during delivery?',
          answer: 'We run a private logistics fleet equipped with advanced temperature-controlled refrigerated storage boxes. The meats are kept strictly in chilled ranges (0°C to 2°C) or frozen ranges (-18°C) from our butchery to your hands. This guarantees absolute compliance with food hygiene safety rules.',
        },
        {
          question: 'What are your delivery hours and dispatch times?',
          answer: 'We deliver daily across Cairo and Giza from 10:00 AM to 10:00 PM. Orders placed before 2:00 PM are dispatched for same-day delivery (within 2 to 3 hours). Orders placed after 2:00 PM will be delivered same-day if slots exist, otherwise scheduled for the next morning.',
        },
        {
          question: 'What is the delivery fee?',
          answer: 'We offer free delivery for all orders above EGP 200! For orders under EGP 200, a standard delivery service fee of EGP 50 applies.',
        },
      ],
    },
    {
      category: 'Orders & Payments',
      items: [
        {
          question: 'Do you allow guest checkouts without creating an account?',
          answer: 'Yes! We support guest checkout for customers who want a fast purchase. You will only need to provide an email and phone number for delivery tracking and order receipt. However, we recommend creating an account to track order history and access exclusive offers.',
        },
        {
          question: 'What payment methods do you accept?',
          answer: 'We accept Cash on Delivery (COD), Credit/Debit Card payments (Visa, MasterCard), and major Digital Wallets (like Vodafone Cash or Instapay). Select your desired payment method at checkout.',
        },
        {
          question: 'Can I cancel or modify my order after placement?',
          answer: 'Since prepared cuts are butchered to order, modifications or cancellations are only permitted within 30 minutes of order placement. Contact our elite helpline directly at +20 10 0000 0000 to check status.',
        },
      ],
    },
  ];

  const filteredFaqs = faqs.map((cat) => {
    const items = cat.items.filter(
      (item) =>
        item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
    return { ...cat, items };
  }).filter((cat) => cat.items.length > 0);

  return (
    <>
      <Navbar />

      <main className="min-h-screen bg-[var(--bg-base)] py-14 md:py-20">
        <div className="container-brand font-sans">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
              Faq Registry
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
              Curated Gastronomy FAQs
            </h1>
            
            {/* Filter Search */}
            <div className="mt-10 max-w-md mx-auto relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for dry-aging, delivery times, sourcing..."
                className={cn(
                  'w-full h-12 pl-5 pr-12 rounded-button text-sm font-sans',
                  'bg-surface border border-muted',
                  'text-primary placeholder:text-muted focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-300'
                )}
              />
              <HelpCircle className="absolute right-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
            </div>
          </div>

          {/* FAQ Accordions */}
          <div className="max-w-3xl mx-auto flex flex-col gap-12">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((cat, idx) => (
                <div key={idx} className="flex flex-col gap-5">
                  <h2 className="font-display font-bold text-base text-[var(--gold)] uppercase tracking-wider flex items-center gap-2 border-b border-muted pb-2">
                    <Compass className="w-4 h-4" />
                    {cat.category}
                  </h2>
          <div className="flex flex-col gap-4">
            {cat.items.map((item, itemIdx) => (
              <FAQItem key={itemIdx} question={item.question} answer={item.answer} />
            ))}
          </div>
                </div>
              ))
            ) : (
              <div className="text-center py-16 border border-dashed border-muted rounded-xl">
                <p className="text-sm font-light text-muted italic">No FAQ results match your search term. Feel free to contact our helpline directly!</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
