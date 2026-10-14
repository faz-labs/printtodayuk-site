'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, ShieldCheck, Sparkle } from '@phosphor-icons/react';

export function FeatureHighlights() {
  const features = [
    {
      icon: Clock,
      title: 'Same Day Dispatch',
      description: 'Order by 12pm for today',
      iconColor: 'text-[#C8102E]',
      bgLight: 'bg-red-50',
    },
    {
      icon: MapPin,
      title: 'London Studio Hub',
      description: '75 Green St, E7 8JF',
      iconColor: 'text-[#012169]',
      bgLight: 'bg-blue-50',
    },
    {
      icon: ShieldCheck,
      title: 'Quality Guarantee',
      description: 'HD Pigment & DTF Print',
      iconColor: 'text-[#012169]',
      bgLight: 'bg-blue-50',
    },
    {
      icon: Sparkle,
      title: 'Free Artwork Proof',
      description: '100% proof check',
      iconColor: 'text-[#C8102E]',
      bgLight: 'bg-red-50',
    },
  ];

  return (
    <div className="w-full bg-white border-y border-slate-200/90 shadow-2xs relative z-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200/80">
          {features.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-center gap-3.5 px-3 sm:px-6 py-4 bg-white hover:bg-slate-50/80 transition-colors"
              >
                <div className={`p-2.5 rounded-xl ${item.bgLight} ${item.iconColor} shrink-0`}>
                  <Icon weight="bold" className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-extrabold text-slate-900 tracking-tight truncate font-['Open_Sans',sans-serif]">
                    {item.title}
                  </div>
                  <div className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5 font-medium font-['Open_Sans',sans-serif]">
                    {item.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
