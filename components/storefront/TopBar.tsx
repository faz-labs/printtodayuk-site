'use client';

import React from 'react';
import { Phone, MapPin, Sparkle } from '@phosphor-icons/react';

export function TopBar() {
  return (
    <div className="w-full bg-[#012169] text-white text-xs py-2 px-4 border-b border-[#00174c] select-none transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Location */}
        <div className="flex items-center gap-1.5 text-blue-100 font-medium shrink-0">
          <MapPin weight="fill" className="h-3.5 w-3.5 text-red-400 shrink-0" />
          <span>75 Green St, E7 8JF</span>
        </div>

        {/* Center: Same Day Custom Printing & Apparel in London */}
        <div className="hidden sm:flex items-center gap-1.5 font-medium text-blue-100 text-center truncate mx-auto">
          <Sparkle weight="fill" className="h-3.5 w-3.5 text-amber-300 animate-pulse shrink-0" />
          <span>Same Day Custom Printing &amp; Apparel in London</span>
        </div>

        {/* Right: Direct Phone Link (Call Me button removed) */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:03300103521"
            className="inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors font-medium px-2 py-0.5 rounded-md hover:bg-white/10"
          >
            <Phone weight="fill" className="h-3.5 w-3.5 text-red-400" />
            <span>0330 010 3521</span>
          </a>
        </div>
      </div>
    </div>
  );
}
