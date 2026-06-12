'use client';

import React, { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { cn } from '@/lib/utils';
import { ChevronDown, HelpCircle, Compass } from 'lucide-react';
import { useLocale } from '@/components/LocaleProvider';

interface FAQItemProps {
  question: string;
  answer:   string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-muted rounded-xl bg-surface overflow-hidden shadow-card transition-all duration-300">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-6 flex items-center justify-between text-start gap-4 hover:bg-surface-raised transition-colors cursor-pointer group"
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
        <p className="p-6 font-sans font-normal text-sm text-secondary leading-relaxed">
          {answer}
        </p>
      </div>
    </div>
  );
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const { dict } = useLocale();

  const faqs = [
    {
      category: dict.faq.categories.sourcing,
      items: [
        {
          question: dict.faq.questions.q1,
          answer: dict.faq.questions.a1,
        },
        {
          question: dict.faq.questions.q2,
          answer: dict.faq.questions.a2,
        },
        {
          question: dict.faq.questions.q3,
          answer: dict.faq.questions.a3,
        },
      ],
    },
    {
      category: dict.faq.categories.logistics,
      items: [
        {
          question: dict.faq.questions.q4,
          answer: dict.faq.questions.a4,
        },
        {
          question: dict.faq.questions.q5,
          answer: dict.faq.questions.a5,
        },
        {
          question: dict.faq.questions.q6,
          answer: dict.faq.questions.a6,
        },
      ],
    },
    {
      category: dict.faq.categories.orders,
      items: [
        {
          question: dict.faq.questions.q7,
          answer: dict.faq.questions.a7,
        },
        {
          question: dict.faq.questions.q8,
          answer: dict.faq.questions.a8,
        },
        {
          question: dict.faq.questions.q9,
          answer: dict.faq.questions.a9,
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

      <main id="main-content" className="min-h-screen bg-[var(--bg-base)] py-14 md:py-20">
        <div className="container-brand font-sans">
          
          {/* Header */}
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-[var(--gold)] text-3xs font-semibold tracking-[0.25em] uppercase block mb-4">
              {dict.faq.registry}
            </span>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-primary leading-tight">
              {dict.faq.title}
            </h1>
            
            {/* Filter Search */}
            <div className="mt-10 max-w-md mx-auto relative">
              <input
                type="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={dict.faq.placeholder}
                className={cn(
                  'w-full h-12 ps-5 pe-12 rounded-button text-sm font-sans',
                  'bg-surface border border-muted',
                  'text-primary placeholder:text-muted focus:outline-none focus:border-[var(--gold)] focus:ring-1 focus:ring-[var(--gold)]/20 transition-all duration-300'
                )}
              />
              <HelpCircle className="absolute end-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted pointer-events-none" />
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
                <p className="text-sm font-normal text-muted italic">{dict.faq.empty}</p>
              </div>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </>
  );
}
