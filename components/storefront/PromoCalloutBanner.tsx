'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Lightning,
  PhoneCall,
  Clock,
  Sparkle,
  ShieldCheck,
  Tag,
} from '@phosphor-icons/react';
import { useCallMe } from './CallMeContext';

export function PromoCalloutBanner() {
  const { openCallMe } = useCallMe();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="relative rounded-3xl bg-gradient-to-r from-[#012169] via-[#0A2E80] to-[#011C59] p-8 sm:p-10 text-white overflow-hidden shadow-2xl border border-white/10">
        {/* Ambient red and gold background glow */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-[#C8102E]/25 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 -bottom-20 w-60 h-60 bg-amber-400/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="max-w-2xl text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-xs font-bold mb-4 shadow-sm">
              <Tag weight="fill" className="h-3.5 w-3.5 text-amber-300" />
              <span>Limited Promo Code:</span>
              <span className="text-white font-mono bg-[#C8102E] px-2 py-0.5 rounded-md">
                LONDONPRINT
              </span>
              <span className="hidden sm:inline text-white/80">• 15% Off Orders Over £50</span>
            </div>

            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight">
              Emergency Printing in London Today?{' '}
              <span className="text-red-300">We Print In-House.</span>
            </h3>

            <p className="mt-3 text-sm sm:text-base text-white/90 leading-relaxed font-normal">
              Need presentation boards, event flyers, name badges or banners for an urgent deadline? 
              Confirm by <strong className="text-white font-bold underline decoration-[#C8102E] decoration-2">12:00 PM</strong> for guaranteed same-day studio collection at <span className="text-white font-bold">75 Green St, E7 8JF</span> or door-to-door courier dispatch.
            </p>

            <div className="mt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-white/80">
              <span className="flex items-center gap-1.5">
                <Clock weight="bold" className="h-4 w-4 text-amber-300" />
                <span>Ready in 2-4 Hours</span>
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck weight="fill" className="h-4 w-4 text-[#C8102E]" />
                <span>Free Pre-Flight File Check</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkle weight="fill" className="h-4 w-4 text-amber-300" />
                <span>No Hidden Artwork Fees</span>
              </span>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-3 shrink-0 w-full sm:w-auto">
            <button
              onClick={() => openCallMe('Emergency Same-Day Order')}
              className="inline-flex items-center justify-center gap-2 bg-[#C8102E] hover:bg-[#A80C24] text-white font-bold px-7 py-4 rounded-2xl shadow-xl text-sm transition-all transform hover:scale-105 active:scale-95 cursor-pointer border border-[#C8102E]"
            >
              <PhoneCall weight="bold" className="h-4 w-4" />
              <span>Get Immediate Quote</span>
            </button>

            <a
              href="tel:03300103521"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#012169] hover:bg-white/90 font-bold px-7 py-4 rounded-2xl shadow-lg text-sm transition-all hover:scale-105 text-center"
            >
              <span>Call Hotline: 0330 010 3521</span>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
