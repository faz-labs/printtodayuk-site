'use client';

import React from 'react';
import { Phone, Clock, MapPin, Sparkle } from '@phosphor-icons/react';
import { useCallMe } from './CallMeContext';

export function TopBar() {
  const { openCallMe } = useCallMe();

  return (
    <div className="w-full bg-[#012169] text-white text-xs py-2 px-4 border-b border-[#00174c] select-none transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Highlight & Address */}
        <div className="flex items-center gap-4 truncate">
          <div className="hidden sm:flex items-center gap-1.5 font-medium text-blue-100">
            <Sparkle weight="fill" className="h-3.5 w-3.5 text-amber-300 animate-pulse shrink-0" />
            <span className="truncate">Same Day Custom Printing & Apparel in London</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-300">
            <span>•</span>
            <MapPin weight="fill" className="h-3.5 w-3.5 text-red-400 shrink-0" />
            <span>75 Green St, E7 8JF</span>
          </div>
          <div className="flex sm:hidden items-center gap-1.5 text-blue-100 font-medium">
            <Clock weight="bold" className="h-3.5 w-3.5 text-amber-300" />
            <span>Same Day Dispatch</span>
          </div>
        </div>

        {/* Right: Functional "Call Me" and Direct Phone Link Only */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:03300103521"
            className="hidden sm:inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors font-medium px-2 py-0.5 rounded-md hover:bg-white/10"
          >
            <Phone weight="fill" className="h-3.5 w-3.5 text-red-400" />
            <span>0330 010 3521</span>
          </a>

          {/* Active Call Me Trigger */}
          <button
            onClick={() => openCallMe()}
            className="group relative inline-flex items-center gap-1.5 bg-[#C8102E] hover:bg-[#A80C24] active:bg-[#85081C] text-white font-bold px-3 py-1 rounded-full text-xs transition-all duration-200 shadow-xs hover:shadow-sm hover:scale-105 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Phone weight="fill" className="h-3 w-3 transition-transform group-hover:rotate-12" />
            <span>Call me</span>
          </button>
        </div>
      </div>
    </div>
  );
}
