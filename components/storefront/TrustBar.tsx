'use client';

import React from 'react';
import {
  Truck,
  CurrencyGbp,
  Trophy,
  Clock,
  Package,
  PottedPlant,
} from '@phosphor-icons/react';

interface TrustFeature {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
  iconColor?: string;
}

const TRUST_FEATURES: TrustFeature[] = [
  {
    id: 'delivery',
    icon: Truck,
    title: 'Fast, Reliable Delivery',
    subtitle: 'London Same-Day',
    iconColor: 'text-emerald-600',
  },
  {
    id: 'prices',
    icon: CurrencyGbp,
    title: 'Highly Competitive Prices',
    subtitle: 'Direct Trade Rates',
    iconColor: 'text-emerald-700',
  },
  {
    id: 'quality',
    icon: Trophy,
    title: 'Commitment to High Quality',
    subtitle: 'In-House Production',
    iconColor: 'text-amber-600',
  },
  {
    id: 'hours',
    icon: Clock,
    title: 'Open Mon-Fri: 8am - 8pm',
    subtitle: 'Sat - Sun: 10am - 4pm',
    iconColor: 'text-[#012169]',
  },
  {
    id: 'whitelabel',
    icon: Package,
    title: 'White Label Shipping',
    subtitle: 'Plain Packaging Available',
    iconColor: 'text-teal-700',
  },
  {
    id: 'eco',
    icon: PottedPlant,
    title: 'A Focus on Sustainability',
    subtitle: 'FSC-Certified Papers',
    iconColor: 'text-emerald-600',
  },
];

export function TrustBar() {
  return (
    <section className="w-full bg-white border-b border-slate-200/80 shadow-2xs relative z-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-3.5">
        <div className="flex items-center justify-start lg:justify-between gap-5 sm:gap-6 lg:gap-4 overflow-x-auto no-scrollbar scroll-smooth">
          {TRUST_FEATURES.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2.5 sm:gap-3 shrink-0 select-none py-1 group"
              >
                {/* Circular Icon Badge matching screenshot */}
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-slate-50 border border-slate-200/90 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 group-hover:border-[#012169]/30 transition-transform">
                  <IconComponent
                    weight="bold"
                    className={`h-4.5 w-4.5 sm:h-5 sm:w-5 ${item.iconColor || 'text-slate-700'}`}
                  />
                </div>

                {/* Text Labels */}
                <div className="flex flex-col text-left">
                  <span className="text-xs sm:text-[13px] font-bold text-slate-900 leading-snug whitespace-nowrap">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="text-[11px] font-semibold text-slate-500 leading-tight whitespace-nowrap mt-0.5">
                      {item.subtitle}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
