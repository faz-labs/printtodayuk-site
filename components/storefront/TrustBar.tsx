'use client';

import React from 'react';
import {
  Truck,
  CurrencyGbp,
  SealCheck,
  Clock,
  Package,
  Leaf,
} from '@phosphor-icons/react';

interface TrustFeature {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle?: string;
}

const TRUST_FEATURES: TrustFeature[] = [
  {
    id: 'delivery',
    icon: Truck,
    title: 'Fast, Reliable Delivery',
  },
  {
    id: 'prices',
    icon: CurrencyGbp,
    title: 'Competitive Trade Prices',
  },
  {
    id: 'quality',
    icon: SealCheck,
    title: 'Commitment to Quality',
  },
  {
    id: 'hours',
    icon: Clock,
    title: 'Open 7am - 8pm',
    subtitle: 'Sat 10-6 · Sun 10-4',
  },
  {
    id: 'whitelabel',
    icon: Package,
    title: 'White Label Shipping',
  },
  {
    id: 'eco',
    icon: Leaf,
    title: 'Focus on Sustainability',
  },
];

export function TrustBar() {
  return (
    <section className="w-full bg-white border-b border-slate-200/80 shadow-2xs relative z-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 sm:py-4">
        {/* Solid responsive grid with NO scrollbar, NO slider - matching Picture 2 reference */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 lg:gap-2 items-center">
          {TRUST_FEATURES.map((item) => {
            const IconComponent = item.icon;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 sm:gap-2.5 py-1 justify-start select-none"
              >
                {/* Icon matching Picture 2 reference */}
                <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 border border-slate-200/80 flex items-center justify-center shrink-0 text-slate-800">
                  <IconComponent
                    weight="bold"
                    className="h-4.5 w-4.5 sm:h-5 sm:w-5 text-slate-800"
                  />
                </div>

                {/* Text Labels */}
                <div className="flex flex-col text-left leading-tight">
                  <span className="text-xs sm:text-[13px] font-bold text-slate-800">
                    {item.title}
                  </span>
                  {item.subtitle && (
                    <span className="text-[11px] font-semibold text-slate-500 mt-0.5">
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
