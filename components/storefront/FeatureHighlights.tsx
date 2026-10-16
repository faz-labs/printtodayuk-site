'use client';

import React from 'react';
import Link from 'next/link';
import { Lightning, ArrowRight, Clock } from '@phosphor-icons/react';

export function FeatureHighlights() {
  return (
    <div className="w-full bg-white border-y border-slate-200/90 shadow-2xs relative z-20 font-['Open_Sans',sans-serif]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-5 sm:gap-6">
          {/* Left Side: Big Bold Text with London Badge */}
          <div className="flex items-center gap-3 sm:gap-4 text-center md:text-left">
            <div className="hidden sm:flex h-12 w-12 rounded-2xl bg-[#C8102E]/10 text-[#C8102E] items-center justify-center shrink-0">
              <Clock weight="fill" className="h-6 w-6" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#012169]/10 text-[#012169] text-[11px] font-black uppercase tracking-wider mb-1">
                <Lightning weight="fill" className="h-3 w-3 text-[#C8102E]" />
                <span>Express Service</span>
              </div>
              <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                Same Day &amp; 24 Hours Printing &amp; Signs London
              </h2>
            </div>
          </div>

          {/* Right Side: CTA Button redirecting to Same-Day page */}
          <div className="shrink-0 w-full sm:w-auto flex justify-center">
            <Link
              href="/same-day-printing"
              className="inline-flex items-center justify-center gap-2.5 w-full sm:w-auto px-7 py-3.5 rounded-xl bg-[#012169] hover:bg-[#C8102E] text-white text-sm sm:text-base font-bold shadow-md hover:shadow-xl transition-all duration-200 cursor-pointer group"
            >
              <span>Get Sameday Prints</span>
              <ArrowRight weight="bold" className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
