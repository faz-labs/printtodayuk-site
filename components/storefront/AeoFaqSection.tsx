'use client';

import React, { useState } from 'react';
import {
  CaretDown,
  WhatsappLogo,
  Sparkle,
  Question,
  ShieldCheck,
  CheckCircle,
} from '@phosphor-icons/react';

interface FaqItem {
  question: string;
  answer: string;
}

interface AeoFaqSectionProps {
  title?: string;
  subtitle?: string;
  badge?: string;
  faqs: FaqItem[];
}

export function AeoFaqSection({
  title = 'Frequently Asked Questions | Same-Day London Printing',
  subtitle = 'Instant answers for customers, voice assistants, and search engines about our in-house London print studio, turnarounds, collection, and delivery.',
  badge = 'AEO Verified Q&A',
  faqs,
}: AeoFaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section
      aria-label="Frequently Asked Questions"
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12"
    >
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkle weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
          <span>{badge}</span>
        </span>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm sm:text-base text-slate-600">
          {subtitle}
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-3">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;
          return (
            <div
              key={idx}
              className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                isOpen
                  ? 'border-[#012169]/30 bg-white shadow-md ring-1 ring-[#012169]/10'
                  : 'border-slate-200 bg-white/70 hover:bg-white hover:border-slate-300'
              }`}
              itemScope
              itemType="https://schema.org/Question"
            >
              <button
                type="button"
                onClick={() => toggle(idx)}
                aria-expanded={isOpen}
                className="w-full flex items-center justify-between text-left p-5 sm:p-6 gap-4"
              >
                <div className="flex items-start gap-3">
                  <div
                    className={`p-1.5 rounded-lg shrink-0 mt-0.5 transition-colors ${
                      isOpen ? 'bg-[#012169] text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <Question weight="bold" className="h-4 w-4" />
                  </div>
                  <h3
                    itemProp="name"
                    className="text-base sm:text-lg font-bold text-slate-900 leading-snug"
                  >
                    {faq.question}
                  </h3>
                </div>
                <CaretDown
                  weight="bold"
                  className={`h-5 w-5 text-slate-400 shrink-0 transition-transform duration-200 ${
                    isOpen ? 'rotate-180 text-[#012169]' : ''
                  }`}
                />
              </button>

              {isOpen && (
                <div
                  itemProp="acceptedAnswer"
                  itemScope
                  itemType="https://schema.org/Answer"
                  className="px-5 pb-5 sm:px-6 sm:pb-6 pt-0 border-t border-slate-100"
                >
                  <p
                    itemProp="text"
                    className="aeo-faq-answer text-sm sm:text-base text-slate-700 leading-relaxed pt-3"
                  >
                    {faq.answer}
                  </p>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                      <CheckCircle weight="fill" className="h-3.5 w-3.5" />
                      <span>Verified by Print Today UK Production Team</span>
                    </span>
                    <a
                      href={`https://wa.me/447969559746?text=${encodeURIComponent(
                        `Hi, I have a question about: "${faq.question}"`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-[#012169] hover:text-[#C8102E] font-bold hover:underline"
                    >
                      <WhatsappLogo weight="fill" className="h-3.5 w-3.5 text-emerald-600" />
                      <span>Ask via WhatsApp</span>
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
