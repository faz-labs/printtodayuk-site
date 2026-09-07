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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-30 mb-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {features.map((item, idx) => {
          const Icon = item.icon;
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200/90 shadow-md shadow-slate-200/50 hover:shadow-lg hover:border-[#012169]/30 transition-all"
            >
              <div className={`p-2.5 rounded-xl ${item.bgLight} ${item.iconColor} shrink-0`}>
                <Icon weight="duotone" className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs sm:text-sm font-bold text-slate-900 truncate">
                  {item.title}
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 truncate mt-0.5">
                  {item.description}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
