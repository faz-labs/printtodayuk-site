'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Sparkle,
  Buildings,
  ShieldCheck,
  Truck,
  ArrowRight,
} from '@phosphor-icons/react';
import Link from 'next/link';

export function WhyChooseUsSection() {
  const pillars = [
    {
      title: 'Free Expert File Inspection',
      description:
        'Upload your PDF, Canva, Illustrator or image file. Our print technicians verify resolution, bleed, and safe zones before running the press so every copy prints sharp.',
      icon: Sparkle,
      badge: 'Zero Setup Cost',
    },
    {
      title: 'In-House London Production',
      description:
        'Everything is produced locally at our Green St production studio using industrial presses, wide-format eco-solvent printers, and DTF garment presses.',
      icon: Buildings,
      badge: '75 Green St, E7 8JF',
    },
    {
      title: '100% Quality & Happiness Guarantee',
      description:
        'If your order is anything less than immaculate, we reprint or refund immediately with no hassle. We stand behind every sheet and garment we deliver.',
      icon: ShieldCheck,
      badge: 'Risk Free',
    },
    {
      title: 'Rapid Collection & London Couriers',
      description:
        'Collect free from our East London studio counter, or choose rapid London courier delivery for urgent corporate events and retail openings.',
      icon: Truck,
      badge: 'Same-Day Dispatch',
    },
  ];

  return (
    <section className="bg-slate-50 py-16 border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#C8102E] uppercase tracking-wider">
            London&apos;s Print Partner
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Why London Businesses Choose Print Today UK
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            Fast turnarounds without compromising on luxury materials, vibrant color accuracy, or customer care.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {pillars.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="p-6 rounded-3xl bg-white border border-slate-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-11 w-11 rounded-2xl bg-[#012169]/10 text-[#012169] flex items-center justify-center">
                      <Icon weight="bold" className="h-5 w-5" />
                    </div>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {item.badge}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
