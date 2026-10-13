'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  RocketLaunch,
  ForkKnife,
  Ticket,
  Wrench,
  ArrowRight,
  Check,
} from '@phosphor-icons/react';

export function CuratedSolutionsSection() {
  const solutions = [
    {
      title: 'Launch My Business',
      tagline: 'All essentials to start trading with confidence',
      icon: RocketLaunch,
      accentColor: 'from-[#012169] to-[#0B2559]',
      imageUrl: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?q=80&w=600&auto=format&fit=crop',
      includes: [
        'Luxury Velvet Business Cards',
        'Company Presentation Flyers',
        'Official Letterheads & Invoices',
        'Staff Name Badges',
      ],
      filterHref: '/category/Printing?subcat=Business%20Cards',
    },
    {
      title: 'Cafes, Bars & Restaurants',
      tagline: 'High-durability dining and hospitality branding',
      icon: ForkKnife,
      accentColor: 'from-amber-600 to-amber-800',
      imageUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop',
      includes: [
        'Waterproof Wipeable Menus',
        'Table Talkers & Tent Cards',
        'Embroidered Staff Aprons',
        'Loyalty & Takeaway Cards',
      ],
      filterHref: '/category/Printing?subcat=Flyers%20%26%20Leaflets',
    },
    {
      title: 'Events, Expos & Exhibitions',
      tagline: 'High-visibility displays that draw huge crowds',
      icon: Ticket,
      accentColor: 'from-[#C8102E] to-[#85081C]',
      imageUrl: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=600&auto=format&fit=crop',
      includes: [
        'Pull-Up Roller Banners (85x200cm)',
        'Event Badges & Lanyards',
        'Heavy Silk Handout Brochures',
        'Branded Cotton Tote Bags',
      ],
      filterHref: '/category/Printing?subcat=PVC%20Banners',
    },
    {
      title: 'Trades, Workwear & Fleets',
      tagline: 'Rugged professional apparel for site & field work',
      icon: Wrench,
      accentColor: 'from-slate-800 to-slate-950',
      imageUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?q=80&w=600&auto=format&fit=crop',
      includes: [
        'Hi-Vis Certified Safety Vests',
        'Embroidered Pique Polos',
        'Warm Fleece Heavy Hoodies',
        'Durable Outdoor Decals',
      ],
      filterHref: '/category/Clothing?subcat=Workwear%20%26%20High-Vis',
    },
  ];

  return (
    <section className="bg-slate-100/70 py-16 border-y border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-bold text-[#C8102E] uppercase tracking-wider">
            Curated Collections • Shop by Need
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1 tracking-tight">
            Tailored Print Packages for Your Industry
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            From new startup launch bundles to heavy-duty workwear, explore matched collections designed to save time.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {solutions.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="rounded-3xl bg-white border border-slate-200 overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
              >
                {/* Clean Image Container without overlays */}
                <div className="relative w-full h-44 overflow-hidden bg-slate-50">
                  <img
                    src={item.imageUrl}
                    alt={item.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#012169] transition-colors">
                      {item.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 leading-relaxed">
                      {item.tagline}
                    </p>

                    {/* Includes list */}
                    <div className="mt-4 pt-3 border-t border-slate-100 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        Package Includes:
                      </div>
                      {item.includes.map((inc, i) => (
                        <div
                          key={i}
                          className="flex items-center gap-2 text-xs text-slate-700 font-medium"
                        >
                          <Check
                            weight="bold"
                            className="h-3.5 w-3.5 text-[#012169] shrink-0"
                          />
                          <span className="truncate">{inc}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA */}
                  <div className="mt-6 pt-3">
                    <Link
                      href={item.filterHref}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-[#012169] text-slate-800 hover:text-white text-xs font-bold transition-all shadow-xs group-hover:bg-[#012169] group-hover:text-white"
                    >
                      <span>Explore Collection</span>
                      <ArrowRight weight="bold" className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
