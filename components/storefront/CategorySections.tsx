'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { CategoryConfig } from '@/lib/types';
import { getCategories } from '@/lib/db';
import { DEFAULT_SUBCATEGORY_IMAGES } from '@/lib/data';
import {
  Gift,
  Printer,
  TShirt,
  Sparkle,
  ArrowRight,
  CircleNotch,
  Tag,
} from '@phosphor-icons/react';

// Category icons map
const CATEGORY_ICONS: Record<string, React.ElementType> = {
  'gift items': Gift,
  'printing': Printer,
  'clothing': TShirt,
};

// Fallback images pool
const GENERAL_FALLBACK_IMAGES = [
  'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1585336261026-41862551e1e4?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?q=80&w=600&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1561070791-2526d30994b5?q=80&w=600&auto=format&fit=crop',
];

export function CategorySections() {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories();
        setCategories(cats);
      } catch (err) {
        console.error('Failed to load categories on homepage:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="py-16 flex items-center justify-center">
        <CircleNotch className="w-8 h-8 text-[#012169] animate-spin" />
      </div>
    );
  }

  if (categories.length === 0) {
    return null;
  }

  return (
    <div className="space-y-16 py-12 bg-white">
      {categories.map((cat, idx) => {
        const IconComponent =
          CATEGORY_ICONS[cat.name.toLowerCase()] || Sparkle;

        const subcats = cat.subcategories || [];

        return (
          <section
            key={cat.name}
            id={`category-${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="scroll-mt-20 border-b border-slate-100 last:border-b-0 pb-16"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Category Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#012169]/10 text-[#012169] text-xs font-bold mb-2">
                    <IconComponent weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
                    <span>{cat.name} Collection</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    {cat.name}
                  </h2>
                  <p className="mt-1 text-sm text-slate-600 max-w-2xl">
                    {cat.description ||
                      `Browse our custom-crafted ${cat.name.toLowerCase()} range. Click any item to explore products and instant online pricing.`}
                  </p>
                </div>

                <Link
                  href={`/category/${encodeURIComponent(cat.name)}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#012169] hover:text-[#C8102E] transition-colors shrink-0 group self-start sm:self-end"
                >
                  <span>Explore All {cat.name}</span>
                  <ArrowRight
                    weight="bold"
                    className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform"
                  />
                </Link>
              </div>

              {/* Subcategories Visual Cards Grid */}
              {subcats.length === 0 ? (
                <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-500">
                  No subcategory items configured yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 sm:gap-5">
                  {subcats.map((subcat, sIdx) => {
                    // Check uploaded image from CMS, then default lookup, then fallback
                    const imageUrl =
                      cat.subcategoryImages?.[subcat] ||
                      DEFAULT_SUBCATEGORY_IMAGES[subcat] ||
                      GENERAL_FALLBACK_IMAGES[sIdx % GENERAL_FALLBACK_IMAGES.length];

                    const itemHref = `/category/${encodeURIComponent(
                      cat.name
                    )}?subcat=${encodeURIComponent(subcat)}`;

                    return (
                      <Link
                        key={subcat}
                        href={itemHref}
                        className="group flex flex-col focus:outline-hidden"
                      >
                        {/* Clean Bordered Image Container */}
                        <div className="relative w-full aspect-square bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden p-3 flex items-center justify-center transition-all duration-200 group-hover:border-[#012169]/40 group-hover:shadow-md group-hover:shadow-[#012169]/5">
                          <img
                            src={imageUrl}
                            alt={subcat}
                            className="w-full h-full object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                            onError={(e) => {
                              // If broken URL, fallback
                              e.currentTarget.src =
                                GENERAL_FALLBACK_IMAGES[0];
                            }}
                          />

                          {/* Subtle arrow tag on hover */}
                          <div className="absolute bottom-2 right-2 h-7 w-7 rounded-full bg-white/90 backdrop-blur-xs flex items-center justify-center text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
                            <ArrowRight weight="bold" className="h-3.5 w-3.5 text-[#012169]" />
                          </div>
                        </div>

                        {/* Subcategory Label below the box */}
                        <div className="mt-2 text-center">
                          <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1">
                            {subcat}
                          </span>
                          <span className="text-[11px] text-slate-400 group-hover:text-[#C8102E] transition-colors block mt-0.5">
                            Shop {subcat} →
                          </span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
