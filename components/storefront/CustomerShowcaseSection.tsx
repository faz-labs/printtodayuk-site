'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, CheckCircle, Heart, InstagramLogo, Sparkle } from '@phosphor-icons/react';
import { ReviewItem, ReviewPlatform } from '@/lib/types';
import { DEFAULT_REVIEWS } from '@/lib/db';

interface CustomerShowcaseSectionProps {
  initialReviews?: ReviewItem[];
}

export function CustomerShowcaseSection({ initialReviews }: CustomerShowcaseSectionProps) {
  const reviews = useMemo(() => {
    const list = initialReviews && initialReviews.length > 0 ? initialReviews : DEFAULT_REVIEWS;
    // Show only featured reviews on storefront (or all if isFeatured undefined)
    return list.filter((r) => r.isFeatured !== false);
  }, [initialReviews]);

  const [activePlatformFilter, setActivePlatformFilter] = useState<'all' | 'google' | 'trustpilot'>('all');

  const filteredReviews = useMemo(() => {
    if (activePlatformFilter === 'all') return reviews;
    return reviews.filter((r) => r.platform === activePlatformFilter);
  }, [reviews, activePlatformFilter]);

  const metrics = useMemo(() => {
    const total = reviews.length;
    const avg =
      total > 0
        ? (reviews.reduce((acc, r) => acc + (r.rating || 5), 0) / total).toFixed(1)
        : '4.9';
    const googleCount = reviews.filter((r) => r.platform === 'google').length;
    const trustpilotCount = reviews.filter((r) => r.platform === 'trustpilot').length;
    return { total, avg, googleCount, trustpilotCount };
  }, [reviews]);

  const showcaseProjects = [
    {
      title: 'Luxury Gold Foil Business Cards',
      category: 'Business Cards',
      imageUrl: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=500&auto=format&fit=crop',
      tag: '#PrintedByPrintToday',
    },
    {
      title: 'Full Colour DTF Custom Hoodies',
      category: 'Apparel & Uniforms',
      imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?q=80&w=500&auto=format&fit=crop',
      tag: 'London Studio Print',
    },
    {
      title: 'High-Impact Event Roller Banners',
      category: 'Exhibition Displays',
      imageUrl: 'https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=500&auto=format&fit=crop',
      tag: 'Same Day Collection',
    },
    {
      title: 'Die-Cut Waterproof Packaging Labels',
      category: 'Product Stickers',
      imageUrl: 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?q=80&w=500&auto=format&fit=crop',
      tag: 'Precision Contour Cut',
    },
  ];

  return (
    <section className="bg-white py-16 border-b border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Header & Trustpilot Rating Pill */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 mb-3 shadow-xs">
            <div className="flex items-center text-amber-400">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} weight="fill" className="h-3.5 w-3.5 fill-current" />
              ))}
            </div>
            <span>
              Rated <strong>{metrics.avg} / 5.0</strong> on Google &amp; Trustpilot ({metrics.total}+ Reviews)
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Loved by 1,000+ London Businesses &amp; Creators
          </h2>
          <p className="mt-2 text-sm text-slate-600 leading-relaxed">
            See real work printed in our London studio for cafes, tech agencies, corporate teams, and creators.
          </p>

          {/* Platform Filter Pills */}
          <div className="flex items-center justify-center gap-2 mt-6">
            <button
              type="button"
              onClick={() => setActivePlatformFilter('all')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                activePlatformFilter === 'all'
                  ? 'bg-[#012169] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
              }`}
            >
              All Reviews ({reviews.length})
            </button>

            {metrics.googleCount > 0 && (
              <button
                type="button"
                onClick={() => setActivePlatformFilter('google')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePlatformFilter === 'google'
                    ? 'bg-[#4285F4] text-white shadow-xs'
                    : 'bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200'
                }`}
              >
                <span className="font-black text-xs">G</span>
                <span>Google ({metrics.googleCount})</span>
              </button>
            )}

            {metrics.trustpilotCount > 0 && (
              <button
                type="button"
                onClick={() => setActivePlatformFilter('trustpilot')}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  activePlatformFilter === 'trustpilot'
                    ? 'bg-[#00b67a] text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200'
                }`}
              >
                <Star weight="fill" className="h-3 w-3" />
                <span>Trustpilot ({metrics.trustpilotCount})</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Customer Creation Gallery (Vistaprint Style) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          {showcaseProjects.map((item, idx) => (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="group relative rounded-2xl overflow-hidden aspect-square bg-slate-100 border border-slate-200/80 shadow-xs hover:shadow-lg transition-all"
            >
              <img
                src={item.imageUrl}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-108"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent opacity-80 group-hover:opacity-95 transition-opacity" />

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <span className="text-[10px] font-bold text-red-300 uppercase tracking-wider block">
                  {item.tag}
                </span>
                <div className="text-xs font-bold line-clamp-1 mt-0.5">
                  {item.title}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Dynamic Verified Customer Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredReviews.map((rev, idx) => (
              <motion.div
                key={rev.id || rev.author + idx}
                layout
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.25, delay: Math.min(idx * 0.04, 0.2) }}
                className="p-6 rounded-2xl bg-slate-50 border border-slate-200/90 flex flex-col justify-between shadow-xs hover:shadow-md transition-shadow relative overflow-hidden"
              >
                <div>
                  {/* Top Bar with Platform Badge & Rating */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    {/* Platform Badge */}
                    {rev.platform === 'google' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-900 text-[10px] font-bold border border-blue-200">
                        <span className="text-[#4285F4] font-black">G</span>
                        <span>Google Review</span>
                      </span>
                    ) : rev.platform === 'trustpilot' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-950 text-[10px] font-bold border border-emerald-200">
                        <Star weight="fill" className="h-3 w-3 text-[#00b67a]" />
                        <span>Trustpilot Verified</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 text-[10px] font-bold border border-purple-200">
                        <Sparkle weight="fill" className="h-3 w-3 text-purple-600" />
                        <span>Direct Feedback</span>
                      </span>
                    )}

                    {rev.date && (
                      <span className="text-[10px] font-medium text-slate-400">
                        {rev.date}
                      </span>
                    )}
                  </div>

                  {/* Star Rating */}
                  <div className="flex items-center gap-0.5 text-amber-400 mb-2.5">
                    {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                      <Star key={i} weight="fill" className="h-4 w-4" />
                    ))}
                  </div>

                  {/* Review Quote */}
                  <p className="text-xs sm:text-sm text-slate-700 italic leading-relaxed">
                    &ldquo;{rev.review}&rdquo;
                  </p>
                </div>

                {/* Bottom Author & Product Tag */}
                <div className="mt-5 pt-4 border-t border-slate-200/70 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-900 flex items-center gap-1">
                      <span>{rev.author}</span>
                      {rev.isVerified && (
                        <span title="Verified Customer" className="inline-flex items-center">
                          <CheckCircle weight="fill" className="h-3.5 w-3.5 text-emerald-600" />
                        </span>
                      )}
                    </div>
                    {(rev.company || rev.location) && (
                      <div className="text-[11px] text-slate-500 font-medium">
                        {rev.company} {rev.company && rev.location && '•'} {rev.location}
                      </div>
                    )}
                  </div>

                  {rev.product && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[#012169] truncate max-w-[130px] shrink-0">
                      {rev.product}
                    </span>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
