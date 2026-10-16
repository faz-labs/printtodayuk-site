'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight } from '@phosphor-icons/react';
import { CategoryConfig } from '@/lib/types';
import { getCategories } from '@/lib/db';

export function CategoryTilesSection() {
  const [categories, setCategories] = useState<CategoryConfig[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const cats = await getCategories();
        // Only include categories that have an imageUrl
        setCategories(cats.filter((c) => Boolean(c.imageUrl)));
      } catch (err) {
        console.warn('Failed to load spotlight categories:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading || categories.length === 0) {
    return null;
  }

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 font-sans">
      {/* Header: Title and Shop now link */}
      <div className="flex items-baseline justify-between gap-4 mb-6">
        <div className="flex items-baseline gap-4">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            In the spotlight
          </h2>
          <span className="text-xs sm:text-sm font-semibold text-slate-500">
            Featured Categories
          </span>
        </div>
      </div>

      {/* Grid of Cards: Image inside bordered card, Text OUTSIDE the card */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 gap-4 sm:gap-6">
        {categories.slice(0, 8).map((cat) => {
          return (
            <Link
              key={cat.name}
              href={`/category/${encodeURIComponent(cat.name)}`}
              className="group flex flex-col focus:outline-hidden"
            >
              {/* CARD CONTAINER */}
              <div className="relative w-full aspect-square bg-white rounded-2xl sm:rounded-3xl border border-slate-200 overflow-hidden p-3 sm:p-5 flex items-center justify-center transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-md">
                <img
                  src={cat.imageUrl}
                  alt={cat.name}
                  className="w-full h-full object-contain rounded-xl transition-transform duration-300 group-hover:scale-105"
                  loading="lazy"
                />
              </div>

              {/* TEXT OUTSIDE THE CARD */}
              <div className="mt-2.5 text-left space-y-0.5">
                <span className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-[#012169] transition-colors line-clamp-1 block">
                  {cat.name}
                </span>
                {cat.description && (
                  <span className="text-xs text-slate-500 line-clamp-1 block">
                    {cat.description}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
