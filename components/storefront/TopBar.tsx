'use client';

import React from 'react';
import { Phone, Sparkle, Chats, Envelope } from '@phosphor-icons/react';

export function TopBar() {
  return (
    <div className="w-full bg-[#012169] text-white text-xs sm:text-sm py-2.5 sm:py-3 px-4 border-b border-[#00174c] select-none transition-colors">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Same Day Custom Printing shifted to address position (address removed) */}
        <div className="flex items-center gap-2 text-white font-semibold shrink-0">
          <Sparkle weight="fill" className="h-4 w-4 text-amber-300 animate-pulse shrink-0" />
          <span className="text-xs sm:text-sm tracking-wide">
            Same Day Custom Printing &amp; Apparel in London
          </span>
        </div>

        {/* Right: Phone, Email & Live Chat */}
        <div className="flex items-center gap-3 sm:gap-4 shrink-0 text-xs sm:text-sm">
          {/* Phone Number */}
          <a
            href="tel:03300103521"
            className="inline-flex items-center gap-1.5 text-white/95 hover:text-white transition-colors font-medium hover:underline"
          >
            <Phone weight="fill" className="h-4 w-4 text-red-400 shrink-0" />
            <span>0330 010 3521</span>
          </a>

          <span className="text-white/30 hidden xs:inline">•</span>

          {/* Email address beside phone */}
          <a
            href="mailto:info@printtodayuk.com"
            className="inline-flex items-center gap-1.5 text-white/95 hover:text-white transition-colors font-medium hover:underline"
          >
            <Envelope weight="fill" className="h-4 w-4 text-cyan-300 shrink-0" />
            <span>info@printtodayuk.com</span>
          </a>

          <span className="text-white/30 hidden sm:inline">•</span>

          {/* Live Chat */}
          <a
            href="https://wa.me/447969559746"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-emerald-300 hover:text-white transition-colors font-semibold"
            title="Chat with London studio team"
          >
            <Chats weight="fill" className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Live Chat</span>
          </a>
        </div>
      </div>
    </div>
  );
}
