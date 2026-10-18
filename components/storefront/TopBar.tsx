'use client';

import React from 'react';
import { Phone, Sparkle, Envelope } from '@phosphor-icons/react';

export function TopBar() {
  return (
    <div className="w-full bg-[#012169] text-white text-xs sm:text-sm py-2.5 sm:py-3 px-3 sm:px-4 border-b border-[#00174c] select-none transition-colors overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Same Day Custom Printing shifted to address position (address removed) */}
        <div className="flex items-center gap-1.5 sm:gap-2 text-white font-semibold min-w-0 truncate">
          <Sparkle weight="fill" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-amber-300 animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm tracking-wide truncate">
            <span className="inline sm:hidden">Same Day Printing London</span>
            <span className="hidden sm:inline">Same Day Custom Printing &amp; Apparel in London</span>
          </span>
        </div>

        {/* Right: Phone & Email (Live Chat removed per request) */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0 text-xs sm:text-sm">
          {/* Phone Number */}
          <a
            href="tel:03300103521"
            className="inline-flex items-center gap-1.5 text-white/95 hover:text-white transition-colors font-medium hover:underline shrink-0"
          >
            <Phone weight="fill" className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-red-400 shrink-0" />
            <span className="whitespace-nowrap">0330 010 3521</span>
          </a>

          <span className="text-white/30 hidden md:inline">•</span>

          {/* Email address beside phone on md+ screens */}
          <a
            href="mailto:info@printtodayuk.com"
            className="hidden md:inline-flex items-center gap-1.5 text-white/95 hover:text-white transition-colors font-medium hover:underline shrink-0"
          >
            <Envelope weight="fill" className="h-4 w-4 text-cyan-300 shrink-0" />
            <span className="whitespace-nowrap">info@printtodayuk.com</span>
          </a>
        </div>
      </div>
    </div>
  );
}

