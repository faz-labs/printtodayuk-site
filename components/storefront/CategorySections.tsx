'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CategoryConfig } from '@/lib/types';
import { getCategories } from '@/lib/db';
import { DEFAULT_SUBCATEGORY_IMAGES } from '@/lib/data';
import { ArrowRight, CircleNotch } from '@phosphor-icons/react';

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
    <div className="space-y-12 sm:space-y-16 py-10 sm:py-14 bg-white">
      {categories.map((cat) => {
        const subcats = cat.subcategories || [];
        if (subcats.length === 0) return null;

        return (
          <section
            key={cat.name}
            id={`category-${cat.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
            className="scroll-mt-20 border-b border-slate-100 last:border-b-0 pb-12 sm:pb-16"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header: Title and Shop now link directly matching user screenshot */}
              <div className="flex items-baseline justify-between gap-4 mb-6">
                <div className="flex items-baseline gap-4">
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                    {cat.name}
                  </h2>
                  <Link
                    href={`/category/${encodeURIComponent(cat.name)}`}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#012169] transition-colors group"
                  >
                    <span>Shop now</span>
                    <ArrowRight
                      weight="bold"
                      className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform"
                    />
                  </Link>
                </div>
              </div>

              {/* Grid of Cards: Image inside bordered card, Text OUTSIDE the card */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
                {subcats.slice(0, 8).map((subcat, sIdx) => {
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
                      {/* CARD CONTAINER: Shows ONLY the image with rounded border, NO text/icons inside */}
                      <div className="relative w-full aspect-square bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden p-3 sm:p-5 flex items-center justify-center transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-md">
                        <img
                          src={imageUrl}
                          alt={subcat}
                          className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                          onError={(e) => {
                            e.currentTarget.src = GENERAL_FALLBACK_IMAGES[0];
                          }}
                        />
                      </div>

                      {/* TEXT IS OUT OF THE CARD: Clean text directly below the card */}
                      <div className="mt-2.5 text-left">
                        <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1 block">
                          {subcat}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}
    </div>
  );
}
