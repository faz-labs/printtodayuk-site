'use client';

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Lightning,
  Flame,
  MagnifyingGlass,
  ArrowRight,
  SquaresFour,
} from '@phosphor-icons/react';
import { CategoryConfig, Product } from '@/lib/types';
import { getLocalCategories } from '@/lib/db';

interface DynamicCategoryGroup {
  letter: string;
  categories: {
    category: CategoryConfig;
    productCount: number;
  }[];
}

interface AllProductsMegaMenuProps {
  categories?: CategoryConfig[];
  products?: Product[];
  onClose: () => void;
  onMouseEnter?: () => void;
  onMouseLeave?: () => void;
}

export function AllProductsMegaMenu({
  categories = [],
  products = [],
  onClose,
  onMouseEnter,
  onMouseLeave,
}: AllProductsMegaMenuProps) {
  const [filterQuery, setFilterQuery] = useState('');

  // 1. Strictly CMS Categories (ignoring legacy container names)
  const cleanCategories = useMemo(() => {
    let list = categories && categories.length > 0 ? categories : [];
    if (list.length === 0 && typeof window !== 'undefined') {
      list = getLocalCategories();
    }
    return list.filter(
      (c) =>
        c &&
        c.name &&
        c.name.toLowerCase() !== 'printing' &&
        c.name.toLowerCase() !== 'clothing'
    );
  }, [categories]);

  // 2. Filter by search query if user searches
  const filteredCategories = useMemo(() => {
    if (!filterQuery.trim()) return cleanCategories;
    const q = filterQuery.toLowerCase().trim();
    return cleanCategories.filter((c) => c.name.toLowerCase().includes(q));
  }, [cleanCategories, filterQuery]);

  // 3. Build alphabetical letter groups from CMS Category names ONLY
  const letterGroups = useMemo<DynamicCategoryGroup[]>(() => {
    const map = new Map<string, DynamicCategoryGroup['categories']>();

    // Sort categories alphabetically A to Z
    const sorted = [...filteredCategories].sort((a, b) => a.name.localeCompare(b.name));

    for (const cat of sorted) {
      const letter = cat.name.trim().charAt(0).toUpperCase();
      if (!letter) continue;

      const count = products.filter(
        (p) =>
          p &&
          p.category &&
          p.category.toLowerCase().trim() === cat.name.toLowerCase().trim()
      ).length;

      if (!map.has(letter)) {
        map.set(letter, []);
      }
      map.get(letter)!.push({
        category: cat,
        productCount: count,
      });
    }

    const letters = Array.from(map.keys()).sort();
    return letters.map((letter) => ({
      letter,
      categories: map.get(letter)!,
    }));
  }, [filteredCategories, products]);

  // 4. Distribute letter groups into up to 4 columns
  const columns = useMemo(() => {
    const numCols = Math.min(4, Math.max(1, letterGroups.length));
    const cols: DynamicCategoryGroup[][] = Array.from({ length: numCols }, () => []);
    letterGroups.forEach((group, index) => {
      cols[index % numCols].push(group);
    });
    return cols;
  }, [letterGroups]);

  // 5. Featured Best Sellers from CMS categories marked with isBestSeller
  const enlistedBestSellers = useMemo(() => {
    return cleanCategories.filter((c) => Boolean(c.isBestSeller));
  }, [cleanCategories]);

  return (
    <motion.div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      data-lenis-prevent
      initial={{ opacity: 0, y: 8, scale: 0.99 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.99 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
      className="absolute left-0 right-0 top-full pt-1.5 max-w-7xl mx-auto z-50 pointer-events-auto px-4 sm:px-6 lg:px-8"
    >
      {/* Invisible Hover Safety Bridge */}
      <div
        className="absolute -top-3 left-0 right-0 h-4 bg-transparent cursor-default pointer-events-auto"
        onMouseEnter={onMouseEnter}
      />

      {/* Floating Rounded Card with Pure CMS Category Data */}
      <div
        data-lenis-prevent
        className="rounded-3xl bg-white/98 backdrop-blur-3xl border border-white/80 shadow-[0_25px_60px_-15px_rgba(1,33,105,0.22),0_8px_20px_-6px_rgba(0,0,0,0.08)] ring-1 ring-slate-900/5 max-h-[75vh] overflow-y-auto overscroll-contain px-5 sm:px-7 py-6 transition-all"
        style={{ scrollbarGutter: 'stable' }}
      >
        {/* Top Header Row: Category Count, Quick Filter Search, & Link to /all-products */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3.5 pb-4 mb-5 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <h3 className="text-base font-bold text-[#012169] font-sans tracking-tight">
                A to Z Categories
              </h3>
              <span className="text-xs text-slate-400 font-medium font-sans">
                ({cleanCategories.length} Categories)
              </span>
            </div>
            <p className="text-[11px] text-slate-500 font-sans mt-0.5">
              Live product categories managed via London Studio CMS
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Filter */}
            {cleanCategories.length > 3 && (
              <div className="relative">
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter categories..."
                  className="w-44 sm:w-56 h-8.5 pl-8 pr-3 text-xs rounded-full bg-slate-50 border border-slate-200 focus:bg-white focus:border-[#012169] focus:outline-hidden font-sans text-slate-800 placeholder:text-slate-400"
                />
                <MagnifyingGlass
                  weight="bold"
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400"
                />
              </div>
            )}

            {/* Direct CTA to All Products Cover Page */}
            <Link
              href="/all-products"
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#012169] text-white hover:bg-[#0B2559] text-xs font-semibold shadow-xs transition-all shrink-0 hover:scale-[1.02] cursor-pointer"
            >
              <SquaresFour weight="bold" className="h-3.5 w-3.5 text-amber-300" />
              <span>View All Products Cover Page</span>
              <ArrowRight weight="bold" className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Mega Menu Body: Left Sidebar + Alphabetical CMS Category Columns */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* 1. Left Best Sellers Sidebar */}
          <div className="w-full lg:w-56 shrink-0 bg-slate-50/90 rounded-2xl p-4 border border-slate-200/80 h-fit">
            <div className="px-3 py-2 rounded-xl bg-[#012169] text-white text-xs font-black uppercase tracking-wider flex items-center gap-1.5 shadow-xs mb-3">
              <Flame weight="fill" className="h-4 w-4 text-amber-300" />
              <span>Best Sellers</span>
            </div>

            <div className="space-y-1">
              {enlistedBestSellers.length > 0 ? (
                enlistedBestSellers.map((item) => (
                  <Link
                    key={item.name}
                    href={`/category/${encodeURIComponent(item.name)}`}
                    onClick={onClose}
                    className="flex items-center justify-between px-2.5 py-1.5 rounded-lg font-sans text-[13px] font-medium text-slate-700 hover:text-[#012169] hover:bg-white hover:shadow-xs transition-all group"
                  >
                    <span className="truncate">{item.name}</span>
                    <span className="text-[11px] text-slate-400 group-hover:text-[#012169] transition-transform group-hover:translate-x-0.5 shrink-0 ml-1">
                      →
                    </span>
                  </Link>
                ))
              ) : (
                <div className="px-2.5 py-3 text-xs text-slate-400 italic font-sans">
                  Toggle category in CMS to enlist in Best Sellers
                </div>
              )}
            </div>

            {/* Link to /all-products in sidebar */}
            <div className="mt-4 pt-3 border-t border-slate-200 space-y-2 font-sans">
              <Link
                href="/all-products"
                onClick={onClose}
                className="w-full flex items-center justify-between p-2 rounded-xl bg-blue-50/80 hover:bg-blue-100/80 text-[#012169] text-xs font-semibold transition-colors border border-blue-200/60"
              >
                <span>Browse Cover Gallery</span>
                <ArrowRight weight="bold" className="h-3 w-3" />
              </Link>

              <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
                <Lightning weight="fill" className="h-3.5 w-3.5 text-[#C8102E]" />
                <span className="font-semibold text-slate-700">Same-Day London Dispatch</span>
              </div>
            </div>
          </div>

          {/* 2. Main Alphabetical A-Z Columns (Strictly CMS Categories) */}
          <div className="flex-1">
            {letterGroups.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {columns.map((colGroups, colIdx) => (
                  <div key={colIdx} className="space-y-6">
                    {colGroups.map((group) => (
                      <div key={group.letter} className="space-y-2 scroll-mt-2">
                        {/* Alphabet letter header */}
                        <div className="font-sans text-[17px] font-bold text-[#012169] border-b border-slate-200 pb-1 flex items-center gap-2">
                          <span className="font-mono">{group.letter}</span>
                          <div className="h-0.5 w-5 bg-[#012169]/30 rounded-full" />
                          <span className="text-[11px] font-medium text-slate-400 ml-auto font-sans">
                            {group.categories.length}
                          </span>
                        </div>

                        {/* Category links under this letter */}
                        <div className="space-y-1.5 pl-0.5">
                          {group.categories.map(({ category, productCount }) => (
                            <div key={category.name}>
                              <Link
                                href={`/category/${encodeURIComponent(category.name)}`}
                                onClick={onClose}
                                className="flex items-center justify-between font-sans text-[14px] font-medium text-slate-800 hover:text-[#012169] group transition-colors py-1 hover:translate-x-0.5"
                              >
                                <span className="group-hover:underline truncate font-semibold">
                                  {category.name}
                                </span>
                                <div className="flex items-center gap-1.5 shrink-0 ml-1.5">
                                  {productCount > 0 && (
                                    <span className="text-[10px] text-slate-400 bg-slate-100 px-1.5 py-0.2 rounded-full">
                                      {productCount}
                                    </span>
                                  )}
                                  <span className="text-[11px] text-slate-300 group-hover:text-[#012169] transition-transform group-hover:translate-x-0.5">
                                    →
                                  </span>
                                </div>
                              </Link>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400">
                <SquaresFour className="h-8 w-8 mx-auto text-slate-300 mb-2" />
                <p className="text-sm font-sans font-medium text-slate-600">No categories found in CMS</p>
                <p className="text-xs text-slate-400 font-sans mt-1">
                  Add categories in CMS to display them alphabetically here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
