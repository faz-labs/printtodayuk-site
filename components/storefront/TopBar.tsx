'use client';

import React from 'react';
import { Phone, Clock, MapPin, Sparkles } from 'lucide-react';
import { useCallMe } from './CallMeContext';

export function TopBar() {
  const { openCallMe } = useCallMe();

  return (
    <div className="w-full bg-[#4a0e35] text-white text-xs py-2 px-4 border-b border-[#390b29] select-none transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Highlight & Address */}
        <div className="flex items-center gap-4 truncate">
          <div className="hidden sm:flex items-center gap-1.5 font-medium text-rose-200">
            <Sparkles className="h-3.5 w-3.5 text-rose-300 animate-pulse shrink-0" />
            <span className="truncate">Same Day Custom Printing & Apparel in London</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-300/80">
            <span>•</span>
            <MapPin className="h-3 w-3 text-rose-300 shrink-0" />
            <span>75 Green St, E7 8JF</span>
          </div>
          <div className="flex sm:hidden items-center gap-1.5 text-rose-200 font-medium">
            <Clock className="h-3 w-3" />
            <span>Same Day Dispatch</span>
          </div>
        </div>

        {/* Right: Functional "Call Me" and Direct Phone Link Only */}
        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:02081234567"
            className="hidden sm:inline-flex items-center gap-1.5 text-white/90 hover:text-white transition-colors font-medium px-2 py-0.5 rounded-md hover:bg-white/10"
          >
            <Phone className="h-3.5 w-3.5 text-rose-300" />
            <span>020 8123 4567</span>
          </a>

          {/* Active Call Me Trigger */}
          <button
            onClick={() => openCallMe()}
            className="group relative inline-flex items-center gap-1.5 bg-rose-500 hover:bg-rose-600 active:bg-rose-700 text-white font-bold px-3 py-1 rounded-full text-xs transition-all duration-200 shadow-xs hover:shadow-sm hover:scale-105 cursor-pointer"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
            </span>
            <Phone className="h-3 w-3 transition-transform group-hover:rotate-12" />
            <span>Call me</span>
          </button>
        </div>
      </div>
    </div>
  );
}
