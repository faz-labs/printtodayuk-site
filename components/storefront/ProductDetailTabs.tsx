'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Ruler,
  Stack,
  Star,
  Question,
  CheckCircle,
  CaretDown,
  Sparkle,
} from '@phosphor-icons/react';
import { Product } from '@/lib/types';

interface ProductDetailTabsProps {
  product: Product;
}

export function ProductDetailTabs({ product }: ProductDetailTabsProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'specs' | 'finishes' | 'reviews' | 'faq'>('overview');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isPrinting = product.category.toLowerCase() === 'printing';

  const faqs = isPrinting
    ? [
        {
          q: 'How fast can I collect my order from 75 Green St, London?',
          a: 'Orders confirmed with print-ready artwork before 12:00 PM are guaranteed for same-day studio collection between 2:00 PM and 7:00 PM at 75 Green St, E7 8JF. Express door-to-door London couriers are also dispatched daily.',
        },
        {
          q: 'What file format and bleed do you require?',
          a: 'We accept PDF, AI, EPS, PSD, high-res PNG, JPEG, and Canva links. Please supply artwork with 3mm bleed on all edges, CMYK color format, and 300 DPI resolution. Our studio team verifies every file free of charge before printing.',
        },
        {
          q: 'Can I see a proof before printing begins?',
          a: 'Yes, absolutely! We provide a free digital pre-flight PDF proof checking bleed lines, safety zones, and resolution. Production only begins once you approve the proof.',
        },
        {
          q: 'What is the difference between Silk, Matt, and Velvet finishes?',
          a: 'Silk offers a smooth, subtle sheen with vibrant contrast; Matt provides a clean, non-reflective professional finish; and Velvet Soft-Touch adds a luxurious, tactile suede-like coating that feels substantial and premium in hand.',
        },
      ]
    : [
        {
          q: 'What printing method do you use for custom garments?',
          a: 'We utilize industrial Direct-to-Film (DTF) pigment printing and multi-head commercial embroidery. DTF delivers ultra-vibrant, stretch-resistant, photorealistic graphics that do not crack or fade, even after 50+ wash cycles.',
        },
        {
          q: 'How fast can custom t-shirts and hoodies be produced?',
          a: 'Small and medium batches of custom printed t-shirts and workwear can be printed on-demand with same-day or 24-hour turnaround in our London studio.',
        },
        {
          q: 'What sizes and fabric weights are available?',
          a: 'We stock standard adult unisex sizes (XS to 5XL), women’s fitted cuts, and children’s sizes. Standard t-shirts are 180-200gsm 100% ringspun cotton, while premium hoodies feature heavy 320-350gsm brushed fleece.',
        },
        {
          q: 'Can I order a mix of sizes and colors?',
          a: 'Yes, you can mix garment colors and sizes under the same design without paying separate setup fees.',
        },
      ];

  const reviews = [
    {
      author: 'Julian Thorne',
      role: 'Creative Director, London',
      rating: 5,
      date: '2 days ago',
      title: 'Flawless quality & incredible turnaround',
      comment:
        'Needed 500 cards for a client presentation on short notice. Printed crisply, trimmed perfectly, and collected from Green St in 3 hours. Will never use anyone else.',
    },
    {
      author: 'Sophia Chen',
      role: 'Restaurant Owner, Soho',
      rating: 5,
      date: '1 week ago',
      title: 'Colors matched our branding exactly',
      comment:
        'The deep navy and crimson red color tones matched our design palette 100%. Free artwork check caught a bleed issue before printing. Superb attention to detail.',
    },
    {
      author: 'Tariq Al-Mansoor',
      role: 'Event Producer, East London',
      rating: 5,
      date: '2 weeks ago',
      title: 'Same-day turnaround saved our event',
      comment:
        'Ordered at 10am, collected at 2:30pm. Beautiful paper stock, sharp text, and friendly studio team. Highly recommended for London businesses.',
    },
  ];

  return (
    <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden mt-12">
      {/* Vistaprint-Style Tab Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-50/70 px-4 sm:px-6 pt-3 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'overview'
              ? 'border-[#012169] text-[#012169]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <FileText weight="bold" className="h-4 w-4" />
          <span>Product Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('specs')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'specs'
              ? 'border-[#012169] text-[#012169]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Ruler weight="bold" className="h-4 w-4" />
          <span>Artwork Specs & Bleed</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('finishes')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'finishes'
              ? 'border-[#012169] text-[#012169]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Stack weight="bold" className="h-4 w-4" />
          <span>{isPrinting ? 'Paper Stocks & Finishes' : 'Fabrics & Print Methods'}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'reviews'
              ? 'border-[#012169] text-[#012169]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Star weight="bold" className="h-4 w-4" />
          <span>Customer Reviews (4.9★)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('faq')}
          className={`flex items-center gap-2 pb-3 px-3 text-xs sm:text-sm font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'faq'
              ? 'border-[#012169] text-[#012169]'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Question weight="bold" className="h-4 w-4" />
          <span>FAQs</span>
        </button>
      </div>

      {/* Tab Content Panes */}
      <div className="p-6 sm:p-8">
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  About {product.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {product.description}
                </p>
              </div>

              {product.features && product.features.length > 0 && (
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                    Highlighted Features
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {product.features.map((feat, i) => (
                      <div
                        key={i}
                        className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 text-xs font-semibold text-slate-800"
                      >
                        <CheckCircle weight="fill" className="h-4 w-4 text-[#012169] shrink-0" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="p-4 rounded-2xl bg-blue-50/70 border border-[#012169]/15 flex items-start gap-3">
                <Sparkle weight="fill" className="h-5 w-5 text-[#C8102E] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-[#012169] font-bold">100% London Print Assurance:</strong> Every order is produced right here in our East London studio at 75 Green St, London E7 8JF. Our team inspects every cut, fold, and print run before dispatch.
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'specs' && (
            <motion.div
              key="specs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  Artwork Setup & File Guidelines
                </h3>
                <p className="text-xs text-slate-600">
                  Follow these parameters to ensure razor-sharp prints with no trimmed borders.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Bleed Area</div>
                  <div className="text-lg font-black text-[#012169] mt-1">3mm Each Side</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Extend background color to avoid white edges.</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Safety Margin</div>
                  <div className="text-lg font-black text-[#012169] mt-1">4mm Inside Trim</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Keep text and critical logos away from the edge.</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Resolution</div>
                  <div className="text-lg font-black text-[#012169] mt-1">300 DPI (CMYK)</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">Vector PDF, AI or high-res 300 DPI raster.</div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Accepted Formats</div>
                  <div className="text-lg font-black text-[#012169] mt-1">PDF, AI, PNG, Canva</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">We convert and check all files for free.</div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'finishes' && (
            <motion.div
              key="finishes"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {isPrinting ? 'Paper Stocks & Finish Comparison' : 'Garment Fabric & Print Technology'}
                </h3>
                <p className="text-xs text-slate-600">
                  Choose the texture and coating that best represents your brand.
                </p>
              </div>

              {isPrinting ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#012169]">Standard</span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">350gsm Silk Coated</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Smooth, clean surface with rich color reproduction. Ideal for everyday handouts, flyers, and standard corporate cards.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-50 text-purple-700">Popular</span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">400gsm Premium Matt</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Substantial, rigid card stock with anti-glare lamination. Resists smudges and provides a high-end corporate impression.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-50 text-[#C8102E]">Luxury</span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">450gsm Velvet Soft-Touch</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Ultra-thick card laminated with a suede-like tactile finish. Feels noticeably heavy and luxurious in hand.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-[#012169]">DTF Pigment</span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">Direct-to-Film (DTF)</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Photorealistic full-color prints with elastic flexibility. Resists cracking and stays bright on dark & light fabrics.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700">Embroidery</span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">Precision Stitching</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      Textured Madeira thread embroidery for polos, jackets, aprons, and caps. Creates a durable 3D corporate look.
                    </p>
                  </div>

                  <div className="p-5 rounded-2xl border border-slate-200 bg-white shadow-xs">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700">Workwear</span>
                    <h4 className="text-base font-bold text-slate-900 mt-2">Heavy-Duty Transfer</h4>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      High-adhesion thermo-transfers for industrial hi-vis vests, weatherproof jackets, and safety workwear.
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'reviews' && (
            <motion.div
              key="reviews"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-slate-50 border border-slate-200">
                <div>
                  <div className="flex items-center gap-1.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} weight="fill" className="h-5 w-5" />
                    ))}
                    <span className="text-slate-900 font-black text-lg ml-2">4.9 out of 5</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Based on 1,240+ verified client orders in Greater London</p>
                </div>
                <div className="text-xs font-bold text-[#012169] bg-white px-3 py-1.5 rounded-xl border border-slate-200 shadow-xs">
                  ✓ 100% Verified Customers
                </div>
              </div>

              <div className="space-y-4">
                {reviews.map((r, idx) => (
                  <div key={idx} className="p-5 rounded-2xl border border-slate-100 bg-slate-50/50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-amber-400">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} weight="fill" className="h-3.5 w-3.5" />
                        ))}
                      </div>
                      <span className="text-[11px] text-slate-400">{r.date}</span>
                    </div>
                    <h5 className="text-sm font-bold text-slate-900">{r.title}</h5>
                    <p className="text-xs text-slate-600 leading-relaxed italic">&ldquo;{r.comment}&rdquo;</p>
                    <div className="text-[11px] font-semibold text-slate-500 pt-1">
                      {r.author} • <span className="text-slate-400">{r.role}</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {activeTab === 'faq' && (
            <motion.div
              key="faq"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="space-y-3"
            >
              {faqs.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="rounded-2xl border border-slate-200 overflow-hidden bg-white transition-all"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                      className="w-full p-4 text-left flex items-center justify-between gap-4 font-bold text-xs sm:text-sm text-slate-900 hover:text-[#012169] cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <CaretDown
                        weight="bold"
                        className={`h-4 w-4 text-slate-400 shrink-0 transition-transform ${
                          isOpen ? 'rotate-180 text-[#012169]' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-4 pb-4 pt-1 text-xs text-slate-600 leading-relaxed border-t border-slate-100 bg-slate-50/50">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
