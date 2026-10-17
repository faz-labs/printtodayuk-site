'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  MagnifyingGlass,
  X,
  Lightning,
  FadersHorizontal,
  SquaresFour,
  Plus,
  ArrowRight,
  Sparkle,
} from '@phosphor-icons/react';
import { cn } from '@/lib/utils';
import { CategoryConfig } from '@/lib/types';

interface SearchFilterBarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories?: CategoryConfig[];
  currentCategory?: string;
  subcategories?: string[];
  selectedSubcategory?: string;
  onSelectSubcategory?: (subcat: string) => void;
  sameDayOnly: boolean;
  onToggleSameDayOnly: () => void;
  sortBy: 'a-z' | 'z-a' | 'price-asc' | 'price-desc' | 'featured';
  onSortChange: (sort: 'a-z' | 'z-a' | 'price-asc' | 'price-desc' | 'featured') => void;
  totalResults: number;
}

export function SearchFilterBar({
  searchQuery,
  onSearchChange,
  categories = [],
  currentCategory = '',
  subcategories = [],
  selectedSubcategory = 'All',
  onSelectSubcategory,
  sameDayOnly,
  onToggleSameDayOnly,
  sortBy,
  onSortChange,
  totalResults,
}: SearchFilterBarProps) {
  const cleanCategories = categories.filter(
    (c) =>
      c &&
      c.name &&
      c.name.toLowerCase() !== 'printing' &&
      c.name.toLowerCase() !== 'clothing'
  );

  return (
    <div className="w-full bg-white rounded-2xl p-4 sm:p-6 shadow-lg shadow-slate-200/50 border border-slate-200/70 mb-8 space-y-4">
      {/* Top row: Search Input & Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <MagnifyingGlass weight="bold" className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={`Search within ${currentCategory || 'products'}...`}
            className="w-full h-11 pl-10 pr-10 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:bg-white focus:border-[#012169] focus:ring-2 focus:ring-[#012169]/15 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              aria-label="Clear search"
            >
              <X weight="bold" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Same-day quick toggle */}
        <button
          onClick={onToggleSameDayOnly}
          className={cn(
            'inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-xl text-xs font-bold transition-all border cursor-pointer select-none shrink-0',
            sameDayOnly
              ? 'bg-[#012169] text-white border-[#012169] shadow-sm shadow-[#012169]/30'
              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
          )}
        >
          <Lightning
            weight="fill"
            className={cn(
              'h-3.5 w-3.5',
              sameDayOnly ? 'text-amber-300' : 'text-slate-400'
            )}
          />
          <span>Same Day Dispatch</span>
        </button>

        {/* Sort selector */}
        <div className="flex items-center gap-2 shrink-0">
          <FadersHorizontal weight="bold" className="h-4 w-4 text-slate-400 hidden sm:block" />
          <select
            value={sortBy}
            onChange={(e) =>
              onSortChange(e.target.value as 'a-z' | 'z-a' | 'price-asc' | 'price-desc' | 'featured')
            }
            className="h-11 px-3 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:outline-hidden focus:border-[#012169] cursor-pointer"
          >
            <option value="a-z">Name: A to Z</option>
            <option value="z-a">Name: Z to A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="featured">Default / Featured</option>
          </select>
        </div>
      </div>

      {/* Bottom row: Horizontal Scrollable Category & Subcategory Filter Bar */}
      <div className="pt-2.5 border-t border-slate-100 flex flex-col gap-2">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none no-scrollbar">
          {/* 1. All Products / All Categories Button */}
          <Link
            href="/all-products"
            className={cn(
              'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border',
              !currentCategory || currentCategory.toLowerCase() === 'all'
                ? 'bg-[#012169] text-white border-[#012169] shadow-xs'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-transparent hover:text-slate-900'
            )}
          >
            <SquaresFour weight="bold" className="h-3.5 w-3.5" />
            <span>All Categories</span>
          </Link>

          {/* 2. Horizontal Category Pills */}
          {cleanCategories.map((cat) => {
            const isCurrent =
              currentCategory &&
              currentCategory.toLowerCase().trim() === cat.name.toLowerCase().trim();

            return (
              <Link
                key={cat.id || cat.name}
                href={`/category/${encodeURIComponent(cat.name)}`}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer shrink-0 border',
                  isCurrent
                    ? 'bg-[#012169] text-white border-[#012169] shadow-xs'
                    : 'bg-slate-100/90 hover:bg-slate-200/90 text-slate-700 border-transparent hover:text-slate-900'
                )}
              >
                {cat.imageUrl && (
                  <img
                    src={cat.imageUrl}
                    alt={cat.name}
                    className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                  />
                )}
                <span>{cat.name}</span>
              </Link>
            );
          })}

          {/* 3. Add / Explore More Categories Button */}
          <Link
            href="/all-products"
            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-[#012169] bg-blue-50/80 hover:bg-blue-100 border border-blue-200/80 whitespace-nowrap transition-colors shrink-0"
          >
            <Plus weight="bold" className="h-3 w-3" />
            <span>More Categories</span>
          </Link>
        </div>

        {/* 4. Subcategory Pills for the Current Category (if any subcategories exist) */}
        {subcategories && subcategories.length > 1 && onSelectSubcategory && (
          <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-1 scrollbar-none no-scrollbar border-t border-slate-50">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1">
              Filter:
            </span>
            {subcategories.map((subcat) => {
              const isSelected = selectedSubcategory === subcat;
              return (
                <button
                  key={subcat}
                  onClick={() => onSelectSubcategory(subcat)}
                  className={cn(
                    'px-3 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition-all duration-200 cursor-pointer select-none shrink-0 border',
                    isSelected
                      ? 'bg-[#C8102E] text-white border-[#C8102E] shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-600 border-slate-200 hover:text-slate-900'
                  )}
                >
                  {subcat}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results counter indicator */}
      <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
        <span>
          Showing <strong>{totalResults}</strong> {totalResults === 1 ? 'product' : 'products'}
          {searchQuery && (
            <>
              {' '}
              matching &ldquo;<span className="text-[#012169] font-semibold">{searchQuery}</span>&rdquo;
            </>
          )}
        </span>
        {currentCategory && (
          <span className="text-slate-400">
            Viewing: <span className="font-semibold text-slate-700">{currentCategory}</span>
            {selectedSubcategory && selectedSubcategory !== 'All' && (
              <> &bull; {selectedSubcategory}</>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
